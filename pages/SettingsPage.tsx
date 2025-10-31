import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import Spinner from '../components/Spinner';
import { UserTier } from '../types';

const SettingsPage: React.FC = () => {
    const { user, logout, loading, updateUserTier } = useAppContext();
    const navigate = useNavigate();
    const { t, locale, setLocale } = useTranslation();
    const [copyButtonText, setCopyButtonText] = useState(t('settings_invite_copyLink'));
    const [isUpdatingTier, setIsUpdatingTier] = useState(false);

    const inviteLink = user ? `${window.location.origin}${window.location.pathname}#/login?ref=${user.id}` : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopyButtonText(t('settings_invite_copied'));
        setTimeout(() => {
            setCopyButtonText(t('settings_invite_copyLink'));
        }, 2000);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    const handleTierChange = async () => {
        if (!user) return;
        setIsUpdatingTier(true);
        const newTier = user.tier === UserTier.Pro ? UserTier.Free : UserTier.Pro;
        try {
            await updateUserTier(newTier);
        } catch (error) {
            console.error("Failed to update tier", error);
            alert("Failed to update tier.");
        } finally {
            setIsUpdatingTier(false);
        }
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
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-primary font-semibold">{user?.tier === UserTier.Pro ? "Pro" : "Free"}</p>
                                <button 
                                    onClick={handleTierChange} 
                                    disabled={isUpdatingTier}
                                    className="bg-secondary text-white text-sm font-bold py-2 px-4 rounded-md shadow-sm hover:bg-emerald-600 transition disabled:bg-emerald-300 w-40 text-center"
                                >
                                    {isUpdatingTier ? <Spinner /> : (user?.tier === UserTier.Pro ? t('settings_downgradeToFree') : t('settings_upgradeToPro'))}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 pt-2">
                             <button className="text-sm text-indigo-600 hover:underline">{t('settings_changePassword')}</button>
                             <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">{t('header_logout')}</button>
                        </div>
                    </div>
                </div>

                {/* Invite Link Section */}
                <div className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4 text-text">{t('settings_invite_title')}</h2>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                        <p className="text-sm text-muted mb-4">{t('settings_invite_subtitle')}</p>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                readOnly
                                value={inviteLink}
                                className="flex-grow p-2 border rounded-md bg-white text-sm text-slate-600 focus:outline-none"
                                aria-label="Invite Link"
                            />
                            <button
                                onClick={handleCopy}
                                className="bg-primary text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 transition w-28 text-center"
                            >
                                {copyButtonText}
                            </button>
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