import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTranslation } from '../hooks/useTranslation';

const BackButton: React.FC = () => {
    const navigate = useNavigate();
    return (
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    );
};

const Header: React.FC = () => {
  const { user } = useAppContext();
  const { t } = useTranslation();
  const location = useLocation();
  
  const noBackButtonPaths = ['/', '/dashboard'];
  const showBackButton = !noBackButtonPaths.includes(location.pathname);

  return (
    <header className="bg-card border-b border-slate-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left side: Back button or placeholder for alignment */}
          <div className="w-1/3 flex justify-start">
            {showBackButton && <BackButton />}
          </div>

          {/* Center: App name */}
          <div className="w-1/3 flex justify-center">
            <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold text-primary whitespace-nowrap">
              {t('appName')}
            </Link>
          </div>

          {/* Right side: Actions or placeholder for alignment */}
          <div className="w-1/3 flex justify-end">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/scanner" className="text-muted hover:text-primary p-2 rounded-full" aria-label="Scan QR Code">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6.5 6.5v-1.5m-6.5 0V20m1-6.5H4m16.5 0h-1.5m-6.5-6.5v1.5m0-6.5V4M6 6h2v2H6V6zm10 10h2v2h-2v-2zm-5 0h2v2h-2v-2zm0-5h2v2h-2v-2zm-5 0h2v2H6v-2zm10 0h2v2h-2v-2zm0-5h2v2h-2V6zM6 11h2v2H6v-2zm5-5h2v2h-2V6z" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link to="/login" className="text-muted hover:text-primary px-2 sm:px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                  {t('header_signIn')}
                </Link>
              </div>
            )}
          </div>

        </div>
      </nav>
    </header>
  );
};

export default Header;