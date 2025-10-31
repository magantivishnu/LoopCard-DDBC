
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { CardData, UserTier, SocialLink } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Spinner from '../components/Spinner';
import { suggestUsernames } from '../services/geminiService';

type FormData = Omit<CardData, 'id' | 'user_id' | 'qr_code_url' | 'created_at'>;
const PREDEFINED_PLATFORMS = ['linkedin', 'twitter', 'instagram', 'github', 'facebook', 'youtube', 'tiktok'];

const ProgressBar: React.FC<{ currentStep: number; t: (key: string) => string; }> = ({ currentStep, t }) => {
  const steps = [t('setup_progress_step1'), t('setup_progress_step2'), t('setup_progress_step3'), t('setup_progress_step4')];
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-start">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          return (
            <React.Fragment key={label}>
              {/* Fix: Each step container uses w-1/4 to ensure they space out evenly. The text inside the <p> will wrap automatically, preventing overflow. */}
              <div className="flex flex-col items-center w-1/4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-300 ${
                    isActive || isCompleted ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <p className={`mt-2 text-sm text-center ${isActive ? 'text-primary font-semibold' : 'text-muted'}`}>{label}</p>
              </div>
              {stepNumber < steps.length && (
                <div className={`flex-grow h-1 mx-2 rounded mt-5 ${isCompleted ? 'bg-primary' : 'bg-gray-300'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const SetupWizardPage: React.FC = () => {
  const { addCard, user, uploadAsset } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [bannerPhotoFile, setBannerPhotoFile] = useState<File | null>(null);

  const [suggestions, setSuggestions] = useState<Record<number, string[]>>({});
  const [suggestionLoading, setSuggestionLoading] = useState<Record<number, boolean>>({});

  const [formData, setFormData] = useState<FormData>({
    profile_photo: `https://i.pravatar.cc/150?u=newuser_${Date.now()}`,
    banner_photo: `https://picsum.photos/seed/newuser_banner_${Date.now()}/800/200`,
    full_name: '',
    business_name: '',
    role: '',
    tagline: '',
    contact: { phone: '', whatsapp: '', email: user?.email || '', website: '' },
    socials: [],
    address: '',
    gallery: [],
    enabled_fields: {
      phone: true, whatsapp: true, email: true, website: true,
      address: true, gallery: user?.tier !== UserTier.Free
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setProfilePhotoFile(file);
          setFormData(prev => ({ ...prev, profile_photo: reader.result as string }));
        } else {
          setBannerPhotoFile(file);
          setFormData(prev => ({ ...prev, banner_photo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section: 'contact' | null = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSocialChange = (index: number, field: keyof Omit<SocialLink, 'id' | 'enabled'>, value: string) => {
    const newSocials = [...formData.socials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setFormData(prev => ({ ...prev, socials: newSocials }));
  };
  
  const addSocialLink = () => {
    setFormData(prev => ({ ...prev, socials: [...prev.socials, { id: `new_${Date.now()}`, platform: 'linkedin', username: '', enabled: true }] }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({ ...prev, socials: prev.socials.filter((_, i) => i !== index) }));
  };

  const handleSuggestUsernames = async (index: number) => {
    setSuggestionLoading(prev => ({ ...prev, [index]: true }));
    setSuggestions(prev => ({ ...prev, [index]: [] }));

    const platform = formData.socials[index].platform;
    
    try {
        const result = await suggestUsernames(
            formData.full_name,
            formData.role,
            formData.business_name,
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

  const handleNext = () => {
    if (step === 1 && !formData.full_name.trim()) {
        alert("Full name is mandatory.");
        return;
    }
    setStep(prev => Math.min(prev + 1, 4));
  };
  
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalData = { ...formData };
      
      if (profilePhotoFile) {
        const url = await uploadAsset(finalData.profile_photo);
        if (!url) throw new Error("Failed to upload profile photo.");
        finalData.profile_photo = url;
      }

      if (bannerPhotoFile) {
        const url = await uploadAsset(finalData.banner_photo);
        if (!url) throw new Error("Failed to upload banner photo.");
        finalData.banner_photo = url;
      }

      await addCard(finalData);
      
      // On success, navigate away. The component will unmount, so we don't need to set loading to false.
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Error during card creation:", err);
      setError(err.message || 'Failed to save card.');
      // On error, stop loading so the user can see the error and try again.
      setLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">{t('setup_progress_step1')}</h2>
            <div className="relative mb-12">
                <img src={formData.banner_photo} alt="Banner" className="w-full h-24 object-cover rounded-t-lg bg-slate-200" />
                <img src={formData.profile_photo} alt="Profile" className="absolute top-12 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white object-cover" />
                <div className="absolute top-2 right-2 space-x-2">
                    {/* Fix: Corrected typo in function call from handleFilechange to handleFileChange. */}
                    <label className="bg-white/80 px-3 py-1 rounded-md text-xs hover:bg-white cursor-pointer">Change Banner <input type="file" className="hidden" onChange={e => handleFileChange(e, 'banner')} accept="image/*" /></label>
                    {/* Fix: Corrected typo in function call from handleFilechange to handleFileChange. */}
                    <label className="bg-white/80 px-3 py-1 rounded-md text-xs hover:bg-white cursor-pointer">Change Photo <input type="file" className="hidden" onChange={e => handleFileChange(e, 'profile')} accept="image/*" /></label>
                </div>
            </div>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name (Mandatory)" required className="w-full p-2 border rounded-md"/>
            <input type="text" name="business_name" value={formData.business_name || ''} onChange={handleChange} placeholder="Business Name" className="w-full p-2 border rounded-md"/>
            <input type="text" name="role" value={formData.role || ''} onChange={handleChange} placeholder="Role / Designation" className="w-full p-2 border rounded-md"/>
            <textarea name="tagline" value={formData.tagline || ''} onChange={handleChange} placeholder="About / Tagline" className="w-full p-2 border rounded-md h-24"/>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">{t('setup_progress_step2')} Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="tel" name="phone" value={formData.contact.phone} onChange={(e) => handleChange(e, 'contact')} placeholder="Phone" className="p-2 border rounded-md"/>
              <input type="text" name="whatsapp" value={formData.contact.whatsapp} onChange={(e) => handleChange(e, 'contact')} placeholder="WhatsApp Number" className="p-2 border rounded-md"/>
              <input type="email" name="email" value={formData.contact.email} onChange={(e) => handleChange(e, 'contact')} placeholder="Email" className="p-2 border rounded-md col-span-2"/>
              <input type="url" name="website" value={formData.contact.website} onChange={(e) => handleChange(e, 'contact')} placeholder="Website" className="p-2 border rounded-md col-span-2"/>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">{t('setup_progress_step3')}</h2>
            <div className="space-y-3">
              {formData.socials.map((social, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <select
                      value={social.platform}
                      onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                      className="p-2 border rounded-md capitalize flex-shrink-0"
                    >
                      {PREDEFINED_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      <option value="Other">Other...</option>
                    </select>
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={social.username}
                        onChange={(e) => handleSocialChange(index, 'username', e.target.value)}
                        placeholder={social.platform === 'Other' ? "Full URL (e.g., https://...)" : "Username"}
                        className="w-full p-2 border rounded-md min-w-0 pr-24"
                      />
                      {social.platform !== 'Other' && (
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
                    <button type="button" onClick={() => removeSocialLink(index)} className="text-red-500 hover:text-red-700 p-2 flex-shrink-0 font-bold text-2xl leading-none">&times;</button>
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
        );
      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">{t('setup_progress_step4')}</h2>
            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address (Optional)" className="w-full p-2 border rounded-md"/>
            {user?.tier !== UserTier.Free && (
                <div>
                    <h3 className="text-lg font-semibold mt-4">Image Gallery (Pro)</h3>
                    <p className="text-sm text-muted mb-2">You can add up to 5 images to your card.</p>
                    <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600">Upload Images</button>
                </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-text mb-6 text-center">{t('setup_title')}</h1>
      <div className="bg-card p-8 rounded-lg shadow-lg border border-slate-200">
        <ProgressBar currentStep={step} t={t} />
        <form onSubmit={handleSubmit}>
          {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
          <div className="min-h-[350px]">{renderStep()}</div>
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <button type="button" onClick={handleBack} disabled={step === 1} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-md hover:bg-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed">{t('setup_back')}</button>
            {step < 4 ? (
              <button type="button" onClick={handleNext} className="bg-primary text-white font-bold py-2 px-6 rounded-md shadow-sm hover:bg-indigo-700 transition">{t('setup_next')}</button>
            ) : (
              <button type="submit" disabled={loading} className="bg-secondary text-white font-bold py-2 px-6 rounded-md shadow-sm hover:bg-emerald-600 transition disabled:bg-emerald-300">{loading ? <Spinner /> : t('setup_saveAndGenerate')}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupWizardPage;
