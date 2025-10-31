import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { CardData } from '../types';
import SocialIcon from '../components/SocialIcon';
import { useTranslation } from '../hooks/useTranslation';
import Spinner from '../components/Spinner';

const PublicCardViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCardById, trackClick } = useAppContext();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCard = async () => {
      if (id) {
        setLoading(true);
        const foundCard = await getCardById(id);
        setCard(foundCard);
        setLoading(false);
      }
    };
    fetchCard();
  }, [id, getCardById]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('publicCard_notFound_title')}</h1>
          <p className="text-muted">{t('publicCard_notFound_subtitle')}</p>
        </div>
      </div>
    );
  }

  const vCardData = `BEGIN:VCARD
VERSION:3.0
N:${card.full_name.split(' ').slice(-1).join(' ')};${card.full_name.split(' ').slice(0, -1).join(' ')}
FN:${card.full_name}
ORG:${card.business_name}
TITLE:${card.role}
TEL;TYPE=WORK,VOICE:${card.contact.phone}
EMAIL:${card.contact.email}
URL:${card.contact.website}
PHOTO;TYPE=JPEG:${card.profile_photo}
END:VCARD`;

  const handleSaveContact = () => {
    trackClick(card.id, 'save_contact', 'vcard.vcf');
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.full_name.replace(' ', '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const SaveContactIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  const CONTACT_COLORS = {
    phone: 'text-blue-600 bg-blue-100 hover:bg-blue-200',
    whatsapp: 'text-green-600 bg-green-100 hover:bg-green-200',
    email: 'text-red-600 bg-red-100 hover:bg-red-200',
    website: 'text-slate-600 bg-slate-100 hover:bg-slate-200',
  };
  
  const ContactButton: React.FC<{ href: string, icon: 'phone' | 'whatsapp' | 'email' | 'website', label: string, enabled: boolean }> = ({ href, icon, label, enabled }) => {
    if (!enabled || !href) return null;

    const handleClick = () => {
      if (card) {
        trackClick(card.id, icon, href);
      }
    };

    return (
        <a href={href} onClick={handleClick} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center justify-center p-4 rounded-lg transition space-y-2 ${CONTACT_COLORS[icon]}`}>
            <SocialIcon platform={icon} className="w-7 h-7" />
            <span className="font-semibold text-sm">{label}</span>
        </a>
    )
  }

  const PREDEFINED_PLATFORMS: Record<string, { baseUrl: string }> = {
    linkedin: { baseUrl: 'https://linkedin.com/in/' },
    twitter: { baseUrl: 'https://twitter.com/' },
    instagram: { baseUrl: 'https://instagram.com/' },
    github: { baseUrl: 'https://github.com/' },
    facebook: { baseUrl: 'https://facebook.com/' },
    youtube: { baseUrl: 'https://youtube.com/' },
    tiktok: { baseUrl: 'https://tiktok.com/@' },
  };
  
  const SocialLink: React.FC<{ platform: string, username: string }> = ({ platform, username }) => {
    let url = '';
    let displayPlatform = platform.toLowerCase();
    
    const platformInfo = PREDEFINED_PLATFORMS[displayPlatform];
    
    if (platformInfo) {
      url = platformInfo.baseUrl + username;
    } else {
      url = username.startsWith('http') ? username : `https://${username}`;
      displayPlatform = 'link';
    }
    
    const handleClick = () => {
      if (card) {
        trackClick(card.id, platform.toLowerCase(), url);
      }
    };

    return (
      <a href={url} onClick={handleClick} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition">
        <SocialIcon platform={displayPlatform} className="w-7 h-7" />
      </a>
    );
  };

  return (
    <div className="bg-background min-h-screen py-10 px-4">
      <div className="max-w-md mx-auto bg-card shadow-lg rounded-2xl overflow-hidden">
          <div className="relative">
              <img src={card.banner_photo} alt="Banner" className="w-full h-32 object-cover" />
              <img src={card.profile_photo} alt={card.full_name} className="w-28 h-28 rounded-full ring-4 ring-card absolute top-16 left-1/2 -translate-x-1/2" />
              <button onClick={handleSaveContact} className="absolute top-3 right-3 text-white bg-black/30 hover:bg-black/50 transition p-2 rounded-full" aria-label={t('publicCard_saveContact')}>
                  <span className="sr-only">{t('publicCard_saveContact')}</span>
                  <SaveContactIcon />
              </button>
          </div>
          
          <div className="p-6 pt-16 text-center">
              <h1 className="text-3xl font-bold text-text">{card.full_name}</h1>
              <p className="text-lg text-muted">{card.role}{card.business_name && ` at ${card.business_name}`}</p>
              {card.tagline && <p className="text-md text-muted mt-2 max-w-xs mx-auto">{card.tagline}</p>}
          </div>

          <div className="px-6 pb-6 space-y-6">
              <div className="grid grid-cols-4 gap-3">
                  <ContactButton href={`tel:${card.contact.phone}`} icon="phone" label={t('publicCard_call')} enabled={card.enabled_fields.phone && !!card.contact.phone} />
                  <ContactButton href={`https://wa.me/${card.contact.whatsapp}`} icon="whatsapp" label={t('publicCard_whatsapp')} enabled={card.enabled_fields.whatsapp && !!card.contact.whatsapp} />
                  <ContactButton href={`mailto:${card.contact.email}`} icon="email" label={t('publicCard_email')} enabled={card.enabled_fields.email && !!card.contact.email} />
                  <ContactButton href={card.contact.website} icon="website" label={t('publicCard_website')} enabled={card.enabled_fields.website && !!card.contact.website} />
              </div>

              {card.socials.some(s => s.enabled && s.username) && (
                <div className="flex justify-center items-center space-x-6 pt-4 border-t">
                    {card.socials.map(social => (
                        social.enabled && social.username && <SocialLink key={social.id} platform={social.platform} username={social.username} />
                    ))}
                </div>
              )}
              
              {card.enabled_fields.gallery && card.gallery.length > 0 && (
                   <div className="pt-6 border-t">
                      <h2 className="text-xl font-bold text-center mb-4">{t('publicCard_gallery')}</h2>
                      <div className="grid grid-cols-2 gap-2">
                          {card.gallery.map((imgUrl, index) => (
                              <img key={index} src={imgUrl} alt={`Gallery image ${index+1}`} className="w-full h-auto object-cover rounded-lg" />
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default PublicCardViewPage;