import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserTier } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Spinner from '../components/Spinner';

const DashboardPage: React.FC = () => {
  const { user, cards, loading } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  const maxCards = user?.tier === UserTier.Pro ? 5 : 2;

  const handleShare = (cardId: string) => {
    const url = `${window.location.origin}/#/card/${cardId}`;
    navigator.clipboard.writeText(url);
    alert(t('dashboard_share_success', { url }));
  };

  const ActionButton: React.FC<{ onClick: () => void; className: string; children: React.ReactNode; }> = ({ onClick, className, children }) => (
    <button onClick={onClick} className={`text-sm font-semibold py-2 px-4 rounded-md transition ${className}`}>
      {children}
    </button>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">{t('dashboard_welcome', { email: user?.email || '' })}</h1>
          <p className="text-muted">{t('dashboard_yourTier')} <span className="font-semibold text-primary">{user?.tier}</span></p>
        </div>
        {cards.length < maxCards && (
          <Link
            to="/setup"
            className="bg-primary text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 transition"
          >
            {t('dashboard_createNewCard')}
          </Link>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-2xl font-semibold text-gray-700">{t('dashboard_noCards_title')}</h2>
          <p className="text-muted mt-2">{t('dashboard_noCards_subtitle')}</p>
          <Link
            to="/setup"
            className="mt-6 inline-block bg-primary text-white font-bold py-3 px-6 rounded-md shadow-sm hover:bg-indigo-700 transition"
          >
            {t('dashboard_createFirstCard')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div key={card.id} className="bg-card rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex items-center space-x-4">
                  <img className="w-16 h-16 rounded-full" src={card.profile_photo} alt={card.full_name} />
                  <div>
                    <h3 className="text-xl font-bold text-text">{card.full_name}</h3>
                    <p className="text-muted">{card.role}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 border-t">
                <div className="grid grid-cols-3 gap-2">
                  <ActionButton onClick={() => navigate(`/card/${card.id}`)} className="bg-slate-100 text-slate-800 hover:bg-slate-200">{t('dashboard_card_preview')}</ActionButton>
                  <ActionButton onClick={() => handleShare(card.id)} className="bg-purple-100 text-purple-800 hover:bg-purple-200">{t('dashboard_card_share')}</ActionButton>
                  <ActionButton onClick={() => window.open(card.qr_code_url, '_blank')} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{t('dashboard_card_qr')}</ActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
