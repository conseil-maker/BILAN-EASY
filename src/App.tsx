import React, { useEffect, useState, Suspense, lazy } from 'react';
import { User } from '@supabase/supabase-js';
import AuthWrapper from './components/AuthWrapper';
import { ToastProvider } from './components/ToastProvider';
// OfflineIndicator supprimé - application 100% online
import { CookieConsent } from './components/CookieConsent';
import { GlobalNavbar } from './components/GlobalNavbar';
import { LoadingSpinner, FullPageLoader } from './components/LazyComponents';

// ============================================
// LAZY IMPORTS - Chargement à la demande
// ============================================

// Composants principaux
const ClientApp = lazy(() => import('./components/ClientApp'));

// Dashboards Admin/Consultant
const AdminDashboard = lazy(() => 
  import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const AdminDashboardPro = lazy(() => 
  import('./components/AdminDashboardPro').then(m => ({ default: m.AdminDashboardPro }))
);
const ConsultantDashboard = lazy(() => 
  import('./components/ConsultantDashboard').then(m => ({ default: m.ConsultantDashboard }))
);
const ConsultantDashboardPro = lazy(() => 
  import('./components/ConsultantDashboardPro').then(m => ({ default: m.ConsultantDashboardPro }))
);

// Pages légales
const CGU = lazy(() => import('./components/legal').then(m => ({ default: m.CGU })));
const CGV = lazy(() => import('./components/legal').then(m => ({ default: m.CGV })));
const Privacy = lazy(() => import('./components/legal').then(m => ({ default: m.Privacy })));
const CookiesPolicy = lazy(() => import('./components/legal').then(m => ({ default: m.CookiesPolicy })));

// Fonctionnalités
const SatisfactionSurvey = lazy(() => 
  import('./components/SatisfactionSurvey').then(m => ({ default: m.SatisfactionSurvey }))
);
const DocumentsQualiopi = lazy(() => 
  import('./components/DocumentsQualiopi').then(m => ({ default: m.DocumentsQualiopi }))
);
const DocumentLibrary = lazy(() => 
  import('./components/DocumentLibrary').then(m => ({ default: m.DocumentLibrary }))
);
const MetiersFormationsExplorer = lazy(() => 
  import('./components/MetiersFormationsExplorer').then(m => ({ default: m.MetiersFormationsExplorer }))
);
const MyDocuments = lazy(() => 
  import('./components/MyDocuments').then(m => ({ default: m.MyDocuments }))
);
const ClientDashboard = lazy(() => 
  import('./components/ClientDashboard').then(m => ({ default: m.ClientDashboard }))
);
const AppointmentSystem = lazy(() => 
  import('./components/AppointmentSystem').then(m => ({ default: m.AppointmentSystem }))
);
const AboutPage = lazy(() => 
  import('./components/AboutPage').then(m => ({ default: m.AboutPage }))
);

// ============================================
// ROUTER
// ============================================

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

// ============================================
// COMPOSANTS UI
// ============================================

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

// ============================================
// APP PRINCIPALE
// ============================================

const App: React.FC = () => {
  const route = useHashRouter();
  const [useProDashboards] = useState(true);

  // Pages légales (sans auth)
  const renderLegalPage = () => {
    switch (route) {
      case '/legal/cgu':
        return (
          <>
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <CGU />
            </Suspense>
            <Footer />
          </>
        );
      case '/legal/cgv':
        return (
          <>
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <CGV />
            </Suspense>
            <Footer />
          </>
        );
      case '/legal/privacy':
        return (
          <>
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <Privacy />
            </Suspense>
            <Footer />
          </>
        );
      case '/legal/cookies':
        return (
          <>
            <BackButton />
            <Suspense fallback={<LoadingSpinner />}>
              <CookiesPolicy />
            </Suspense>
            <Footer />
          </>
        );
      default:
        return null;
    }
  };

  // Routes légales
  if (route.startsWith('/legal/')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {renderLegalPage()}
        <CookieConsent />
      </div>
    );
  }

  // Page À propos
  if (route === '/about') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <BackButton />
        <Suspense fallback={<LoadingSpinner />}>
          <AboutPage />
        </Suspense>
        <Footer />
        <CookieConsent />
      </div>
    );
  }

  const renderByRole = (user: User, userRole: string) => {
    const handleBack = () => {
      window.location.hash = '#/';
    };

    // Routes spéciales avec lazy loading
    if (route === '/satisfaction') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Satisfaction" />
          <Suspense fallback={<LoadingSpinner message="Chargement du questionnaire..." />}>
            <SatisfactionSurvey 
              userId={user.id} 
              assessmentId="current" 
              onComplete={() => window.location.hash = '#/'}
            />
          </Suspense>
        </div>
      );
    }

    if (route === '/documents') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Documents" />
          <div className="p-6">
            <Suspense fallback={<LoadingSpinner message="Chargement des documents..." />}>
              <DocumentsQualiopi
                userId={user.id}
                packageName="Essentiel"
                packageDuration={12}
                packagePrice={1200}
                startDate={new Date().toLocaleDateString('fr-FR')}
                isCompleted={false}
              />
            </Suspense>
          </div>
        </div>
      );
    }

    if (route === '/library') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Bibliothèque" />
          <Suspense fallback={<LoadingSpinner message="Chargement de la bibliothèque..." />}>
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
          </Suspense>
        </div>
      );
    }

    if (route === '/metiers') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Métiers & Formations" />
          <Suspense fallback={<LoadingSpinner message="Chargement de l'explorateur..." />}>
            <MetiersFormationsExplorer
              userCompetences={['Management', 'Communication', 'Gestion de projet']}
            />
          </Suspense>
        </div>
      );
    }

    if (route === '/mes-documents') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Mes Documents" />
          <Suspense fallback={<LoadingSpinner message="Chargement de vos documents..." />}>
            <MyDocuments
              user={user}
              packageName="Essentiel"
              packageDuration={12}
              packagePrice={1200}
              startDate={new Date().toLocaleDateString('fr-FR')}
              isCompleted={false}
            />
          </Suspense>
        </div>
      );
    }

    if (route === '/dashboard') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Mon Tableau de Bord" />
          <Suspense fallback={<LoadingSpinner message="Chargement du tableau de bord..." />}>
            <ClientDashboard
              user={user}
              onStartBilan={() => window.location.hash = '#/'}
            />
          </Suspense>
        </div>
      );
    }

    if (route === '/rendez-vous') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Mes Rendez-vous" />
          <Suspense fallback={<LoadingSpinner message="Chargement des rendez-vous..." />}>
            <AppointmentSystem
              userId={user.id}
              userName={user.email?.split('@')[0] || 'Utilisateur'}
              userEmail={user.email || ''}
              mode="client"
            />
          </Suspense>
        </div>
      );
    }

    // Routes Admin
    if (route === '/admin' || route === '/admin/dashboard') {
      return (
        <Suspense fallback={<FullPageLoader message="Chargement du dashboard admin..." />}>
          {useProDashboards 
            ? <AdminDashboardPro onBack={handleBack} />
            : <AdminDashboard onBack={handleBack} />}
        </Suspense>
      );
    }

    // Routes Consultant
    if (route === '/consultant' || route === '/consultant/dashboard') {
      return (
        <Suspense fallback={<FullPageLoader message="Chargement du dashboard consultant..." />}>
          {useProDashboards
            ? <ConsultantDashboardPro onBack={handleBack} />
            : <ConsultantDashboard onBack={handleBack} />}
        </Suspense>
      );
    }

    // Vue par défaut selon le rôle
    switch (userRole) {
      case 'admin':
        return (
          <Suspense fallback={<FullPageLoader message="Chargement du dashboard admin..." />}>
            {useProDashboards 
              ? <AdminDashboardPro onBack={handleBack} />
              : <AdminDashboard onBack={handleBack} />}
          </Suspense>
        );
      case 'consultant':
        return (
          <Suspense fallback={<FullPageLoader message="Chargement du dashboard consultant..." />}>
            {useProDashboards
              ? <ConsultantDashboardPro onBack={handleBack} />
              : <ConsultantDashboard onBack={handleBack} />}
          </Suspense>
        );
      case 'client':
      default:
        return (
          <Suspense fallback={<FullPageLoader message="Chargement de l'application..." />}>
            <ClientApp user={user} />
          </Suspense>
        );
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <AuthWrapper>
          {(user, userRole) => (
            <>
              <div className="flex-grow">
                {renderByRole(user, userRole)}
              </div>
              {/* Footer supprimé pour les clients - le Questionnaire a son propre footer intégré */}
            </>
          )}
        </AuthWrapper>
        <CookieConsent />
      </div>
    </ToastProvider>
  );
};

export default App;
