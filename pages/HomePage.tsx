import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-card">
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-text leading-tight">
            {t('home_title')}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted">
            {t('home_subtitle')}
          </p>
          <div className="mt-10 flex justify-center items-center">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-primary text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              {t('home_getStarted')}
            </Link>
          </div>
        </div>
      </div>
      
      <div className="py-16 bg-background">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-text">Why LoopCard?</h2>
                <p className="text-muted mt-2">Everything you need to make a great first impression.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-card p-8 rounded-lg shadow-sm border border-slate-200 text-center">
                    <h3 className="text-xl font-semibold text-primary mb-2">Always Accessible</h3>
                    <p className="text-muted">Your card is always with you on your phone. Share via QR code, link, email, or social media.</p>
                </div>
                <div className="bg-card p-8 rounded-lg shadow-sm border border-slate-200 text-center">
                    <h3 className="text-xl font-semibold text-primary mb-2">Track Your Reach</h3>
                    <p className="text-muted">Get real-time analytics on who's viewing your card and how they're engaging.</p>
                </div>
                <div className="bg-card p-8 rounded-lg shadow-sm border border-slate-200 text-center">
                    <h3 className="text-xl font-semibold text-primary mb-2">Eco-Friendly</h3>
                    <p className="text-muted">Reduce paper waste and make a positive impact on the environment with every connection.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;