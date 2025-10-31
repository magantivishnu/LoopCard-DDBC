import React, { createContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'te';

const translationsData: Record<Locale, Record<string, string>> = {
  en: {
    appName: "LoopCard",
    home_title: "Your Network, Reinvented.",
    home_subtitle: "Create and share stunning digital business cards in seconds. LoopCard is the modern way to connect, share, and grow your professional circle.",
    home_getStarted: "Get Started",
    header_signIn: "Sign In",
    header_dashboard: "Dashboard",
    header_settings: "Settings",
    header_logout: "Logout",
    login_title: "Choose your experience",
    login_subtitle: "Select a user type to simulate the login process.",
    login_freeUser: "Free User",
    login_proUser: "Pro User",
    login_freeDescription: "Perfect for individuals getting started. Create up to 2 cards with basic analytics.",
    login_proDescription: "For power networkers. Up to 5 cards, advanced AI analytics, image galleries, and more.",
    login_signInWithEmail: "Sign in with Email",
    dashboard_welcome: "Welcome, {{email}}",
    dashboard_yourTier: "Your tier: ",
    dashboard_createNewCard: "+ Create New Card",
    dashboard_noCards_title: "No cards yet!",
    dashboard_noCards_subtitle: "Get started by creating your first digital business card.",
    dashboard_createFirstCard: "Create Your First Card",
    dashboard_card_analytics: "Analytics",
    dashboard_card_edit: "Edit",
    dashboard_card_share: "Share",
    dashboard_card_qr: "QR",
    dashboard_card_delete: "Delete",
    dashboard_card_preview: "Preview",
    dashboard_share_success: "Link copied to clipboard: {{url}}",
    dashboard_delete_confirm: "Are you sure?",
    setup_title: "Create Your LoopCard",
    setup_progress_step1: "Basic Info",
    setup_progress_step2: "Contact",
    setup_progress_step3: "Digital Presence",
    setup_progress_step4: "Final Touches",
    setup_back: "Back",
    setup_next: "Next",
    setup_saveAndGenerate: "Save & Generate Card",
    settings_title: "Settings",
    settings_account: "Account",
    settings_email: "Email",
    settings_currentTier: "Current Tier",
    settings_changePassword: "Change Password",
    settings_customization: "Card Customization",
    settings_theme: "Theme",
    settings_layout: "Layout",
    settings_language: "Language",
    settings_dangerZone: "Danger Zone",
    settings_dangerZone_text: "These actions are permanent and cannot be undone.",
    settings_deleteAccount: "Delete Account",
    settings_deleteAccount_confirm: "Are you sure you want to delete your account? This action is irreversible.",
    publicCard_notFound_title: "Card not found",
    publicCard_notFound_subtitle: "This LoopCard may have been moved or deleted.",
    publicCard_saveContact: "Save to Contacts",
    publicCard_call: "Call",
    publicCard_whatsapp: "WhatsApp",
    publicCard_email: "Email",
    publicCard_website: "Website",
    publicCard_gallery: "Gallery"
  },
  te: {
    appName: "లూప్‌కార్డ్",
    home_title: "మీ నెట్‌వర్క్, పునఃరూపకల్పన చేయబడింది.",
    home_subtitle: "సెకన్లలో అద్భుతమైన డిజిటల్ వ్యాపార కార్డులను సృష్టించండి మరియు పంచుకోండి. లూప్‌కార్డ్ మీ వృత్తిపరమైన సర్కిల్‌ను కనెక్ట్ చేయడానికి, పంచుకోవడానికి మరియు పెంచుకోవడానికి ఆధునిక మార్గం.",
    home_getStarted: "ప్రారంభించండి",
    header_signIn: "సైన్ ఇన్ చేయండి",
    header_dashboard: "డాష్‌బోర్డ్",
    header_settings: "సెట్టింగ్‌లు",
    header_logout: "లాగ్ అవుట్",
    login_title: "మీ అనుభవాన్ని ఎంచుకోండి",
    login_subtitle: "లాగిన్ ప్రక్రియను అనుకరించడానికి వినియోగదారు రకాన్ని ఎంచుకోండి.",
    login_freeUser: "ఉచిత వినియోగదారు",
    login_proUser: "ప్రో వినియోగదారు",
    login_freeDescription: "ప్రారంభించే వ్యక్తులకు సరైనది. ప్రాథమిక విశ్లేషణలతో 2 కార్డుల వరకు సృష్టించండి.",
    login_proDescription: "పవర్ నెట్‌వర్కర్‌ల కోసం. 5 కార్డుల వరకు, అధునాతన AI విశ్లేషణలు, చిత్ర గ్యాలరీలు మరియు మరిన్ని.",
    login_signInWithEmail: "ఇమెయిల్‌తో సైన్ ఇన్ చేయండి",
    dashboard_welcome: "స్వాగతం, {{email}}",
    dashboard_yourTier: "మీ శ్రేణి: ",
    dashboard_createNewCard: "+ కొత్త కార్డును సృష్టించండి",
    dashboard_noCards_title: "ఇంకా కార్డులు లేవు!",
    dashboard_noCards_subtitle: "మీ మొదటి డిజిటల్ వ్యాపార కార్డును సృష్టించడం ద్వారా ప్రారంభించండి.",
    dashboard_createFirstCard: "మీ మొదటి కార్డును సృష్టించండి",
    dashboard_card_analytics: "విశ్లేషణలు",
    dashboard_card_edit: "సవరించు",
    dashboard_card_share: "పంచుకోండి",
    dashboard_card_qr: "QR",
    dashboard_card_delete: "తొలగించు",
    dashboard_card_preview: "ప్రివ్యూ",
    dashboard_share_success: "లింక్ క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది: {{url}}",
    dashboard_delete_confirm: "మీరు ఖచ్చితంగా ఉన్నారా?",
    setup_title: "మీ లూప్‌కార్డ్‌ను సృష్టించండి",
    setup_progress_step1: "ప్రాథమిక సమాచారం",
    setup_progress_step2: "సంప్రదింపు",
    setup_progress_step3: "డిజిటల్ ఉనికి",
    setup_progress_step4: "తుది మెరుగులు",
    setup_back: "వెనుకకు",
    setup_next: "తదుపరి",
    setup_saveAndGenerate: "సేవ్ చేసి & కార్డ్ ఉత్పత్తి చేయండి",
    settings_title: "సెట్టింగ్‌లు",
    settings_account: "ఖాతా",
    settings_email: "ఇమెయిల్",
    settings_currentTier: "ప్రస్తుత శ్రేణి",
    settings_changePassword: "పాస్‌వర్డ్ మార్చండి",
    settings_customization: "కార్డ్ అనుకూలీకరణ",
    settings_theme: "థీమ్",
    settings_layout: "లేఅవుట్",
    settings_language: "భాష",
    settings_dangerZone: "ప్రమాదకర జోన్",
    settings_dangerZone_text: "ఈ చర్యలు శాశ్వతమైనవి మరియు రద్దు చేయబడవు.",
    settings_deleteAccount: "ఖాతాను తొలగించండి",
    settings_deleteAccount_confirm: "మీరు మీ ఖాతాను తొలగించాలనుకుంటున్నారని ఖచ్చితంగా ఉన్నారా? ఈ చర్య మార్చలేనిది.",
    publicCard_notFound_title: "కార్డ్ కనుగొనబడలేదు",
    publicCard_notFound_subtitle: "ఈ లూప్‌కార్డ్ తరలించబడి ఉండవచ్చు లేదా తొలగించబడి ఉండవచ్చు.",
    publicCard_saveContact: "పరిచయాలకు సేవ్ చేయండి",
    publicCard_call: "కాల్",
    publicCard_whatsapp: "వాట్సాప్",
    publicCard_email: "ఇమెయిల్",
    publicCard_website: "వెబ్‌సైట్",
    publicCard_gallery: "గ్యాలరీ"
  }
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Record<string, string>;
}

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('loopcard_locale') as Locale) || 'en');
  
  useEffect(() => {
    localStorage.setItem('loopcard_locale', locale);
  }, [locale]);

  const translations = translationsData[locale] || translationsData.en;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, translations }}>
      {children}
    </LocaleContext.Provider>
  );
};