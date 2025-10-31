import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LocaleProvider } from './context/LocaleContext';
import { useAppContext } from './hooks/useAppContext';

// Layout
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import Spinner from './components/Spinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SetupWizardPage from './pages/SetupWizardPage';
import EditCardPage from './pages/EditCardPage';
import PublicCardViewPage from './pages/PublicCardViewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsLandingPage from './pages/AnalyticsLandingPage';
import EditLandingPage from './pages/EditLandingPage';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow pb-20"> {/* Padding bottom for the nav bar */}
      {children}
    </main>
    <BottomNavBar />
  </div>
);

const AppRouter = () => {
  const { user, loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <HashRouter>
      {user ? (
        <MainLayout>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/setup" element={<SetupWizardPage />} />
            <Route path="/edit" element={<EditLandingPage />} />
            <Route path="/edit/:id" element={<EditCardPage />} />
            <Route path="/analytics" element={<AnalyticsLandingPage />} />
            <Route path="/analytics/:id" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/card/:id" element={<PublicCardViewPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </MainLayout>
      ) : (
        <>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/card/:id" element={<PublicCardViewPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      )}
    </HashRouter>
  );
};

export default function App() {
  return (
    <AppProvider>
      <LocaleProvider>
        <AppRouter />
      </LocaleProvider>
    </AppProvider>
  );
}