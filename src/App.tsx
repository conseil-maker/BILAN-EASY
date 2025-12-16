import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import AuthWrapper from './components/AuthWrapper';
import ClientApp from './components/ClientApp';
import { AdminDashboard } from './components/AdminDashboard';
import { ConsultantDashboard } from './components/ConsultantDashboard';
import { CGU, CGV, Privacy, CookiesPolicy } from './components/legal';
import { CookieConsent } from './components/CookieConsent';
import { SatisfactionSurvey } from './components/SatisfactionSurvey';
import { DocumentsQualiopi } from './components/DocumentsQualiopi';
import { DocumentLibrary } from './components/DocumentLibrary';
import { MetiersFormationsExplorer } from './components/MetiersFormationsExplorer';

// Simple router based on hash
const useHashRouter = () => {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.slice(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
};

// Footer with legal links
const Footer: React.FC = () => (
  <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <a href="#/legal/cgu" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          CGU
        </a>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <a href="#/legal/cgv" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          CGV
        </a>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <a href="#/legal/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Politique de confidentialité
        </a>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <a href="#/legal/cookies" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Cookies
        </a>
      </div>
      <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-500">
        © {new Date().getFullYear()} Bilan-Easy - Organisme certifié Qualiopi
      </div>
    </div>
  </footer>
);

// Back to home button for legal pages
const BackButton: React.FC = () => (
  <div className="fixed top-4 left-4 z-40">
    <a
      href="#/"
      className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow text-gray-700 dark:text-gray-300"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Retour
    </a>
  </div>
);

const App: React.FC = () => {
  const route = useHashRouter();

  // Legal pages (accessible without auth)
  const renderLegalPage = () => {
    switch (route) {
      case '/legal/cgu':
        return (
          <>
            <BackButton />
            <CGU />
            <Footer />
          </>
        );
      case '/legal/cgv':
        return (
          <>
            <BackButton />
            <CGV />
            <Footer />
          </>
        );
      case '/legal/privacy':
        return (
          <>
            <BackButton />
            <Privacy />
            <Footer />
          </>
        );
      case '/legal/cookies':
        return (
          <>
            <BackButton />
            <CookiesPolicy />
            <Footer />
          </>
        );
      default:
        return null;
    }
  };

  // Check if current route is a legal page
  if (route.startsWith('/legal/')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {renderLegalPage()}
        <CookieConsent />
      </div>
    );
  }

  const renderByRole = (user: User, userRole: string) => {
    const handleBack = () => {
      window.location.reload();
    };

    // Check for special routes
    if (route === '/satisfaction') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <BackButton />
          <SatisfactionSurvey 
            userId={user.id} 
            assessmentId="current" 
            onComplete={() => window.location.hash = '#/'}
          />
        </div>
      );
    }

    if (route === '/documents') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <BackButton />
          <DocumentsQualiopi
            userId={user.id}
            packageName="Essentiel"
            packageDuration={12}
            packagePrice={1200}
            startDate={new Date().toLocaleDateString('fr-FR')}
            isCompleted={false}
          />
        </div>
      );
    }

    if (route === '/library') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <BackButton />
          <DocumentLibrary
            userId={user.id}
            userName={user.email?.split('@')[0] || 'Utilisateur'}
            userEmail={user.email || ''}
            packageName="Essentiel"
            packageDuration={12}
            packagePrice={1200}
            startDate={new Date().toLocaleDateString('fr-FR')}
            isCompleted={false}
          />
        </div>
      );
    }

    if (route === '/metiers') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <BackButton />
          <MetiersFormationsExplorer
            userCompetences={['Management', 'Communication', 'Gestion de projet']}
          />
        </div>
      );
    }

    switch (userRole) {
      case 'admin':
        return <AdminDashboard onBack={handleBack} />;
      case 'consultant':
        return <ConsultantDashboard onBack={handleBack} />;
      case 'client':
      default:
        return <ClientApp user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <AuthWrapper>
        {(user, userRole) => (
          <>
            <div className="flex-grow">
              {renderByRole(user, userRole)}
            </div>
            <Footer />
          </>
        )}
      </AuthWrapper>
      <CookieConsent />
    </div>
  );
};

export default App;
