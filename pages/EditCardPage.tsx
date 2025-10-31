
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { CardData, UserTier, SocialLink } from '../types';
import ToggleSwitch from '../components/ToggleSwitch';
import { useTranslation } from '../hooks/useTranslation';
import Spinner from '../components/Spinner';
import { suggestUsernames } from '../services/geminiService';

const PREDEFINED_PLATFORMS = ['linkedin', 'twitter', 'instagram', 'github', 'facebook', 'youtube', 'tiktok'];

const EditCardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCardById, updateCard, user, deleteCard, uploadAsset } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [bannerPhotoFile, setBannerPhotoFile] = useState<File | null>(null);

  const [suggestions, setSuggestions] = useState<Record<number, string[]>>({});
  const [suggestionLoading, setSuggestionLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchCard = async () => {
      if (id) {
        setLoading(true);
        const foundCard = await getCardById(id);
        if (foundCard) {
          setCard(foundCard);
        } else {
          navigate('/dashboard'); // Card not found or not owned by user
        }
        setLoading(false);
      }
    };
    fetchCard();
  }, [id, getCardById, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    if (!card) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setProfilePhotoFile(file);
          setCard({ ...card, profile_photo: reader.result as string });
        } else {
          setBannerPhotoFile(file);
          setCard({ ...card, banner_photo: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section: 'contact' | null = null) => {
    if (!card) return;
    const { name, value } = e.target;
    if (section) {
      setCard({ ...card, [section]: { ...card[section], [name]: value } });
    } else {
      setCard({ ...card, [name]: value });
    }
  };

  const handleToggle = (field: keyof CardData['enabled_fields']) => {
    if (!card) return;
    setCard({ ...card, enabled_fields: { ...card.enabled_fields, [field]: !card.enabled_fields[field] }});
  };

  const handleSocialChange = (index: number, field: keyof Omit<SocialLink, 'id' | 'enabled'>, value: string) => {
    if (!card) return;
    const newSocials = [...card.socials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setCard({ ...card, socials: newSocials });
  };
  
  const handleSocialToggle = (index: number) => {
    if (!card) return;
    const newSocials = [...card.socials];
    newSocials[index].enabled = !newSocials[index].enabled;
    setCard({ ...card, socials: newSocials });
  };

  const addSocialLink = () => {
    if (!card) return;
    const newSocials = [...card.socials, { id: `new_${Date.now()}`, platform: 'linkedin', username: '', enabled: true }];
    setCard({ ...card, socials: newSocials });
  };

  const removeSocialLink = (index: number) => {
    if (!card) return;
    setCard({ ...card, socials: card.socials.filter((_, i) => i !== index) });
  };

  const handleSuggestUsernames = async (index: number) => {
    if (!card) return;
    setSuggestionLoading(prev => ({ ...prev, [index]: true }));
    setSuggestions(prev => ({ ...prev, [index]: [] }));

    const platform = card.socials[index].platform;
    
    try {
        const result = await suggestUsernames(
            card.full_name,
            card.role,
            card.business_name,
            platform
        );
        setSuggestions(prev => ({ ...prev, [index]: result }));
    } catch (error) {
        console.error("Failed to get suggestions", error);
        alert("Could not get suggestions at this time.");
    } finally {
        setSuggestionLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSelectSuggestion = (index: number, suggestion: string) => {
      handleSocialChange(index, 'username', suggestion);
      setSuggestions(prev => ({ ...prev, [index]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    setSaving(true);
    setError(null);
    try {
      let finalCard = { ...card };
      if (profilePhotoFile) {
        const url = await uploadAsset(finalCard.profile_photo);
        if (!url) throw new Error("Failed to upload profile photo.");
        finalCard.profile_photo = url;
      }
      if (bannerPhotoFile) {
        const url = await uploadAsset(finalCard.banner_photo);
        if (!url) throw new Error("Failed to upload banner photo.");
        finalCard.banner_photo = url;
      }
      await updateCard(finalCard);
      // On success, navigate away. The component will unmount, so we don't need to set saving to false.
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update card.');
      // On error, stop saving so the user can see the error and try again.
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (card && window.confirm(t('dashboard_delete_confirm'))) {
      try {
        await deleteCard(card.id);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to delete card.');
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (!card) return null; // Or a "not found" message

  const renderFieldWithToggle = (label: string, fieldName: keyof CardData['enabled_fields'], children: React.ReactNode) => (
    <div className="flex items-center justify-between space-x-4 py-2">
      <div className="flex-grow">{children}</div>
      <ToggleSwitch enabled={card.enabled_fields[fieldName]} onChange={() => handleToggle(fieldName)} />
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-text mb-6">Edit LoopCard</h1>
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-lg border border-slate-200 space-y-6">
        {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">{t('setup_progress_step1')}</h2>
             <div className="relative mb-12">
                <img src={card.banner_photo} alt="Banner" className="w-full h-24 object-cover rounded-t-lg bg-slate-200" />
                <img src={card.profile_photo} alt="Profile" className="absolute top-12 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white object-cover" />
                <div className="absolute top-2 right-2 space-x-2">
                    <label className="bg-white/80 px-3 py-1 rounded-md text-xs hover:bg-white cursor-pointer">Change Banner <input type="file" className="hidden" onChange={e => handleFileChange(e, 'banner')} accept="image/*" /></label>
                    <label className="bg-white/80 px-3 py-1 rounded-md text-xs hover:bg-white cursor-pointer">Change Photo <input type="file" className="hidden" onChange={e => handleFileChange(e, 'profile')} accept="image/*" /></label>
                </div>
            </div>
            <input type="text" name="full_name" value={card.full_name} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded-md"/>
            <input type="text" name="business_name" value={card.business_name || ''} onChange={handleChange} placeholder="Business Name" className="w-full p-2 border rounded-md mt-4"/>
            <input type="text" name="role" value={card.role || ''} onChange={handleChange} placeholder="Role / Designation" className="w-full p-2 border rounded-md mt-4"/>
            <textarea name="tagline" value={card.tagline || ''} onChange={handleChange} placeholder="About / Tagline" className="w-full p-2 border rounded-md mt-4 h-24"/>
        </div>
        
        <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">{t('setup_progress_step2')} Details</h2>
            {renderFieldWithToggle('Phone', 'phone', <input type="tel" name="phone" value={card.contact.phone} onChange={(e) => handleChange(e, 'contact')} placeholder="Phone" className="w-full p-2 border rounded-md"/>)}
            {renderFieldWithToggle('WhatsApp', 'whatsapp', <input type="text" name="whatsapp" value={card.contact.whatsapp} onChange={(e) => handleChange(e, 'contact')} placeholder="WhatsApp Number" className="w-full p-2 border rounded-md"/>)}
            {renderFieldWithToggle('Email', 'email', <input type="email" name="email" value={card.contact.email} onChange={(e) => handleChange(e, 'contact')} placeholder="Email" className="w-full p-2 border rounded-md"/>)}
            {renderFieldWithToggle('Website', 'website', <input type="url" name="website" value={card.contact.website} onChange={(e) => handleChange(e, 'contact')} placeholder="Website" className="w-full p-2 border rounded-md"/>)}
        </div>
        
        <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">{t('setup_progress_step3')}</h2>
            <div className="space-y-3">
                {card.socials.map((social, index) => (
                    <div key={social.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <select value={PREDEFINED_PLATFORMS.includes(social.platform) ? social.platform : 'Other'} onChange={(e) => handleSocialChange(index, 'platform', e.target.value === 'Other' ? 'Other' : e.target.value)} className="p-2 border rounded-md capitalize bg-white flex-shrink-0">
                            {PREDEFINED_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)} <option value="Other">Other...</option>
                        </select>
                        <div className="relative flex-grow">
                          <input type="text" value={social.username} onChange={(e) => handleSocialChange(index, 'username', e.target.value)} placeholder={PREDEFINED_PLATFORMS.includes(social.platform) ? "Username" : "Full URL"} className="w-full p-2 border rounded-md min-w-0 pr-28" />
                          {PREDEFINED_PLATFORMS.includes(social.platform) && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                  {user?.tier === UserTier.Pro ? (
                                      <button
                                          type="button"
                                          onClick={() => handleSuggestUsernames(index)}
                                          disabled={suggestionLoading[index]}
                                          className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-md hover:bg-purple-200 disabled:opacity-50 flex items-center"
                                      >
                                          {suggestionLoading[index] ? '...' : '✨ Suggest'}
                                      </button>
                                  ) : (
                                      <div className="relative group">
                                          <button type="button" disabled className="bg-slate-200 text-slate-500 text-xs font-semibold px-2 py-1 rounded-md cursor-not-allowed">
                                              ✨ Suggest <span className="text-yellow-500">Pro</span>
                                          </button>
                                          <div className="absolute bottom-full z-10 mb-2 hidden group-hover:block w-40 bg-slate-800 text-white text-xs rounded py-1 px-2 text-center">
                                              Upgrade to Pro for AI suggestions!
                                          </div>
                                      </div>
                                  )}
                              </div>
                          )}
                        </div>
                        <div className="flex-shrink-0"><ToggleSwitch enabled={social.enabled} onChange={() => handleSocialToggle(index)} /></div>
                        <button type="button" onClick={() => removeSocialLink(index)} className="text-red-500 hover:text-red-700 font-bold text-2xl p-1 flex-shrink-0 leading-none">&times;</button>
                      </div>
                      {suggestions[index] && suggestions[index].length > 0 && (
                          <div className="ml-36 p-2 bg-slate-50 border rounded-md animate-fade-in">
                              <p className="text-xs font-semibold mb-2 text-muted">Tap to use a suggestion:</p>
                              <div className="flex flex-wrap gap-2">
                                  {suggestions[index].map(s => (
                                      <button
                                          key={s}
                                          type="button"
                                          onClick={() => handleSelectSuggestion(index, s)}
                                          className="bg-white border text-slate-700 text-sm px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                                      >
                                          {s}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                    </div>
                ))}
            </div>
            <button type="button" onClick={addSocialLink} className="mt-4 text-sm font-semibold text-primary hover:underline">+ Add Social Link</button>
        </div>

        {user?.tier !== UserTier.Free && (
            <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Image Gallery (Pro)</h2>
                {renderFieldWithToggle('Gallery', 'gallery', 
                    <div><p className="text-sm text-muted mb-2">Manage your gallery images.</p><button type="button" className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600">Upload Images</button></div>
                )}
            </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="bg-primary text-white font-bold py-3 px-6 rounded-md shadow-sm hover:bg-indigo-700 transition disabled:bg-indigo-300">
            {saving ? <Spinner /> : 'Save Changes'}
          </button>
        </div>

        <div className="pt-6 border-t mt-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">{t('settings_dangerZone')}</h2>
            <div className="flex justify-between items-center bg-red-50 border border-red-200 p-4 rounded-lg">
                <div><h3 className="font-bold text-red-800">Delete this card</h3><p className="text-sm text-red-700">Once deleted, this card cannot be recovered.</p></div>
                <button type="button" onClick={handleDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 transition">{t('dashboard_card_delete')}</button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default EditCardPage;
