import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import Spinner from '../components/Spinner';

const SettingsPage: React.FC = () => {
    const { user, logout, loading } = useAppContext();
    const navigate = useNavigate();
    const { t, locale, setLocale } = useTranslation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleDeleteAccount = () => {
        if (window.confirm(t('settings_deleteAccount_confirm'))) {
            alert("Simulating account deletion... This would call a Supabase Edge Function in a real app.");
            handleLogout();
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-text mb-8">{t('settings_title')}</h1>

            <div className="bg-card p-6 rounded-lg shadow-lg border border-slate-200 space-y-8">
                {/* Account Settings */}
                <div className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4 text-text">{t('settings_account')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted">{t('settings_email')}</label>
                            <p className="text-text font-semibold">{user?.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted">{t('settings_currentTier')}</label>
                            <p className="text-primary font-semibold">{user?.tier}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                             <button className="text-sm text-indigo-600 hover:underline">{t('settings_changePassword')}</button>
                             <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">{t('header_logout')}</button>
                        </div>
                    </div>
                </div>

                {/* Theme & Layout */}
                <div className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4 text-text">{t('settings_customization')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted" htmlFor="language-select">{t('settings_language')}</label>
                            <select
                                id="language-select"
                                value={locale}
                                onChange={(e) => setLocale(e.target.value as 'en' | 'te')}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="en">English</option>
                                <option value="te">తెలుగు (Telugu)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted">{t('settings_theme')}</label>
                            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option>Default</option>
                                <option>Dark Mode</option>
                                <option>Minimalist</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted">{t('settings_layout')}</label>
                            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option>Standard</option>
                                <option>Centered</option>
                                <option>Compact</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* Danger Zone */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-red-600">{t('settings_dangerZone')}</h2>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p className="text-sm text-red-700">{t('settings_dangerZone_text')}</p>
                        <div className="mt-4">
                            <button
                                onClick={handleDeleteAccount}
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 transition"
                            >
                                {t('settings_deleteAccount')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
