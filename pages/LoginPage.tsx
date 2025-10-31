import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserTier } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Spinner from '../components/Spinner';

const LoginPage: React.FC = () => {
  const { login, signUp } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isSigningUp, setIsSigningUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState<UserTier>(UserTier.Free);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    // Example hash: #/login?ref=12345
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(hash.split('?')[1]);
    const refCode = searchParams.get('ref');
    if (refCode) {
        localStorage.setItem('referralCode', refCode);
        console.log(`Referral code ${refCode} saved.`);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSigningUp) {
        await signUp(email, password, tier);
        setSignupSuccess(true);
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Provide more specific feedback for the most common login failure after signup.
      if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
        setError('Your email is not confirmed yet. Please click the link we sent to your inbox. It might take a moment for the confirmation to register.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
        setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-4 bg-card p-10 rounded-xl shadow-lg border border-slate-200 text-center">
                <h2 className="text-3xl font-extrabold text-secondary">Sign Up Successful!</h2>
                <p className="text-muted">We've sent a confirmation link to:</p>
                <p className="font-semibold text-text break-all">{email}</p>
                <p className="text-muted">Please click the link in the email to activate your account before signing in.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-xl shadow-lg border border-slate-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">
            {isSigningUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isSigningUp && (
            <div>
              <label htmlFor="tier" className="block text-sm font-medium text-gray-700">Choose your plan</label>
              <select
                id="tier"
                name="tier"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                value={tier}
                onChange={(e) => setTier(e.target.value as UserTier)}
              >
                <option value={UserTier.Free}>{t('login_freeUser')}</option>
                <option value={UserTier.Pro}>{t('login_proUser')}</option>
              </select>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {loading ? <Spinner /> : (isSigningUp ? 'Sign up' : 'Sign in')}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button
            onClick={() => setIsSigningUp(!isSigningUp)}
            className="font-medium text-primary hover:text-indigo-500"
          >
            {isSigningUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;