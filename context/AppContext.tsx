import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { User, CardData, UserTier } from '../types';

type CardCreationData = Omit<CardData, 'id' | 'user_id' | 'qr_code_url' | 'created_at'>;

interface AppContextType {
  user: User | null;
  cards: CardData[];
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, tier: UserTier) => Promise<any>;
  logout: () => Promise<void>;
  addCard: (card: CardCreationData) => Promise<void>;
  updateCard: (updatedCard: CardData) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  getCardById: (cardId: string) => Promise<CardData | null>;
  uploadAsset: (uri: string) => Promise<string | null>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserAndCards = useCallback(async (session: Session) => {
    setLoading(true);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError?.message);
      // If profile is missing, treat the user as logged out to prevent a broken state.
      setUser(null);
      setCards([]);
      setLoading(false);
      return;
    }

    const { data: userCards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (cardsError) console.error('Error fetching cards:', cardsError.message);
    else setCards(userCards as CardData[]);
    
    setUser({ id: profile.id, email: profile.email, tier: profile.tier as UserTier, session });
    setLoading(false);
  }, []);

  useEffect(() => {
    // Rely on onAuthStateChange to handle the initial session check and subsequent auth events.
    // This avoids race conditions from calling getSession() and setting up a listener separately.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          await fetchUserAndCards(session);
        } else {
          setUser(null);
          setCards([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserAndCards]);
  
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, tier: UserTier) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
        // A user profile is not created automatically, so we insert a new row.
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: data.user.id, email: email, tier: tier });
        if (profileError) throw profileError;
    }
    return data;
  }

  const logout = async () => { await supabase.auth.signOut(); };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const uploadAsset = async (dataUrl: string): Promise<string | null> => {
    if (!user) return null;
    
    const blob = dataURLtoBlob(dataUrl);
    const fileExt = blob.type.split('/')[1];
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('card_assets')
      .upload(fileName, blob);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('card_assets').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const addCard = async (card: CardCreationData) => {
    if (!user) throw new Error("User not authenticated.");
    
    const cardToInsert = { ...card, user_id: user.id, qr_code_url: '' };
    const { data: newCard, error: insertError } = await supabase
      .from('cards').insert(cardToInsert).select().single();

    if (insertError || !newCard) throw insertError || new Error("Failed to create card.");

    const baseUrl = window.location.href.split('#')[0];
    const cardUrl = `${baseUrl}#/card/${newCard.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(cardUrl)}`;

    const { data: updatedCard, error: updateError } = await supabase
      .from('cards').update({ qr_code_url: qrCodeUrl }).eq('id', newCard.id).select().single();
    
    if (updateError) throw updateError;

    setCards(prev => [updatedCard as CardData, ...prev]);
  };
  
  const updateCard = async (updatedCard: CardData) => {
    const { data, error } = await supabase.from('cards').update(updatedCard).eq('id', updatedCard.id).select().single();
    if (error) throw error;
    setCards(prev => prev.map(c => (c.id === updatedCard.id ? data as CardData : c)));
  };

  const deleteCard = async (cardId: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) throw error;
    setCards(prev => prev.filter(card => card.id !== cardId));
  };
  
  const getCardById = useCallback(async (cardId: string): Promise<CardData | null> => {
    const { data, error } = await supabase.from('cards').select('*').eq('id', cardId).single();
    if (error) {
      console.error("Error fetching card by ID:", error.message);
      return null;
    }
    return data as CardData;
  }, []);

  return (
    <AppContext.Provider value={{ user, cards, loading, login, signUp, logout, addCard, updateCard, deleteCard, getCardById, uploadAsset }}>
      {children}
    </AppContext.Provider>
  );
};