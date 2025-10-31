
import { Session } from '@supabase/supabase-js';

export enum UserTier {
  Free = 'Free',
  Pro = 'Pro',
  SmallBusiness = 'Small Business',
  Enterprise = 'Enterprise',
}

export interface User {
  id: string;
  email: string;
  tier: UserTier;
  session: Session;
}

export interface CardContact {
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  username: string;
  enabled: boolean;
}

export interface CardData {
  id: string;
  user_id: string;
  profile_photo: string;
  banner_photo: string;
  full_name: string;
  business_name: string | null;
  role: string | null;
  tagline: string | null;
  contact: CardContact;
  socials: SocialLink[];
  address: string | null;
  gallery: string[];
  qr_code_url: string;
  enabled_fields: {
    phone: boolean;
    whatsapp: boolean;
    email: boolean;
    website: boolean;
    address: boolean;
    gallery: boolean;
  };
  created_at?: string;
}

export interface AnalyticsData {
  totalViews: number;
  uniqueScans: number;
  timeOnPage: number;
  locations: { city: string; country: string; count: number }[];
  devices: { type: 'iOS' | 'Android' | 'Desktop'; count: number }[];
  heatmapData: { x: number; y: number; value: number }[];
}

// For Supabase client type-safety
export type Database = {
  public: {
    Tables: {
      cards: {
        Row: CardData;
        Insert: Omit<CardData, 'id' | 'created_at'>;
        Update: Partial<CardData>;
      };
      profiles: {
        Row: { id: string; email: string; tier: string; };
        Insert: { id: string; email: string; tier: string; };
        Update: { tier?: string; };
      };
    };
  };
};
