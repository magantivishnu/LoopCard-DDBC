import { useContext } from 'react';
import { LocaleContext } from '../context/LocaleContext';

export const useTranslation = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LocaleProvider');
  }

  const { translations, setLocale, locale } = context;

  const t = (key: string, replacements: Record<string, string> = {}): string => {
    let translation = translations[key] || key;
    Object.keys(replacements).forEach(placeholder => {
      translation = translation.replace(`{{${placeholder}}}`, replacements[placeholder]);
    });
    return translation;
  };

  return { t, setLocale, locale };
};
