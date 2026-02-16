import React, { useEffect, useState, Suspense, lazy } from 'react';
import { User } from '@supabase/supabase-js';
import AuthWrapper from './components/AuthWrapper';
import { ToastProvider } from './components/ToastProvider';
import { ErrorBoundary, QuestionnaireErrorBoundary, DashboardErrorBoundary } from './components/ErrorBoundary';
// OfflineIndicator supprimé - application 100% online
import { CookieConsent } from './components/CookieConsent';
import { GlobalNavbar } from './components/GlobalNavbar';
import { LoadingSpinner, FullPageLoader } from './components/LazyComponents';
import { useUserPackage } from './hooks/useUserPackage';
import { useTranslation } from 'react-i18next';

// ============================================
// LAZY IMPORTS - Chargement à la demande
// ============================================

// Composants principaux
const ClientApp = lazy(() => import('./components/ClientApp'));
const ClientAppWithSession = lazy(() => import('./components/ClientAppWithSession'));

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


const MyDocuments = lazy(() => 
  import('./components/MyDocuments').then(m => ({ default: m.MyDocuments }))
);
const DocumentsWithPackage = lazy(() => 
  import('./components/DocumentsWithPackage').then(m => ({ default: m.DocumentsWithPackage }))
);
const ClientDashboard = lazy(() => 
  import('./components/ClientDashboard').then(m => ({ default: m.ClientDashboard }))
);
const AppointmentRequest = lazy(() => 
  import('./components/AppointmentRequest').then(m => ({ default: m.default }))
);
const AboutPage = lazy(() => 
  import('./components/AboutPage').then(m => ({ default: m.AboutPage }))
);
const UserProfile = lazy(() => 
  import('./components/UserProfile').then(m => ({ default: m.UserProfile }))
);
const SummaryDashboard = lazy(() => 
  import('./components/SummaryDashboard')
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

const Footer: React.FC = () => {
  const { t: tCommon } = useTranslation('common');
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <a href="#/legal/cgu" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {tCommon('footer.cgu', 'CGU')}
          </a>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <a href="#/legal/cgv" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {tCommon('footer.cgv', 'CGV')}
          </a>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <a href="#/legal/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {tCommon('footer.privacy', 'Politique de confidentialité')}
          </a>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <a href="#/legal/cookies" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {tCommon('footer.cookies', 'Cookies')}
          </a>
        </div>
        <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} Bilan-Easy - {tCommon('footer.certified', 'Organisme certifié Qualiopi')}
        </div>
      </div>
    </footer>
  );
};

const BackButton: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="fixed top-4 left-4 z-40">
      <a
        href="#/"
        className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow text-gray-700 dark:text-gray-300"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t('back')}
      </a>
    </div>
  );
};

// ============================================
// APP PRINCIPALE
// ============================================

const App: React.FC = () => {
  const route = useHashRouter();
  const [useProDashboards] = useState(true);
  const { t } = useTranslation('common');

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
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title={t('satisfaction', 'Satisfaction')} />
          <Suspense fallback={<LoadingSpinner message={t('loadingQuestionnaire')} />}>
            <SatisfactionSurvey 
              userId={user.id} 
              assessmentId={crypto.randomUUID()} 
              onComplete={() => window.location.hash = '#/dashboard'}
            />
          </Suspense>
        </div>
      );
    }

    // Routes documents avec récupération dynamique du forfait
    if (route === '/documents') {
      return (
        <Suspense fallback={<LoadingSpinner message={t('loadingDocuments')} />}>
          <DocumentsWithPackage user={user} userRole={userRole} pageType="documents" />
        </Suspense>
      );
    }

    if (route === '/library') {
      return (
        <Suspense fallback={<LoadingSpinner message={t('loadingLibrary')} />}>
          <DocumentsWithPackage user={user} userRole={userRole} pageType="library" />
        </Suspense>
      );
    }

    if (route === '/mes-documents') {
      return (
        <Suspense fallback={<LoadingSpinner message={t('loadingYourDocuments')} />}>
          <DocumentsWithPackage user={user} userRole={userRole} pageType="mes-documents" />
        </Suspense>
      );
    }

    if (route === '/dashboard') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={false} title={t('userMenu.dashboard', 'Mon Tableau de Bord')} />
          <DashboardErrorBoundary>
            <Suspense fallback={<LoadingSpinner message={t('loadingDashboard')} />}>
              <ClientDashboard
                user={user}
                onStartNewBilan={() => window.location.hash = '#/bilan'}
                onContinueBilan={() => window.location.hash = '#/bilan'}
                onViewHistory={(record) => {
                  // Stocker le record dans sessionStorage pour le récupérer dans la page de résultats
                  sessionStorage.setItem('viewingHistoryRecord', JSON.stringify(record));
                  window.location.hash = '#/bilan/results';
                }}
              />
            </Suspense>
          </DashboardErrorBoundary>
        </div>
      );
    }

    // Route pour afficher les résultats d'un bilan historique
    if (route === '/bilan/results') {
      const storedRecord = sessionStorage.getItem('viewingHistoryRecord');
      if (!storedRecord) {
        window.location.hash = '#/dashboard';
        return null;
      }
      const record = JSON.parse(storedRecord);
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title={t('bilanResults')} />
          <Suspense fallback={<LoadingSpinner message={t('loadingResults')} />}>
            <SummaryDashboard
              summary={record.summary}
              answers={record.answers || []}
              userName={record.userName}
              packageName={record.packageName}
              onRestart={() => window.location.hash = '#/dashboard'}
              onViewHistory={() => window.location.hash = '#/dashboard'}
              isHistoryView={true}
            />
          </Suspense>
        </div>
      );
    }

    // Route pour démarrer un nouveau bilan
    if (route === '/bilan') {
      return (
        <QuestionnaireErrorBoundary>
          <Suspense fallback={<FullPageLoader message={t('loadingBilan')} />}>
            <ClientApp user={user} />
          </Suspense>
        </QuestionnaireErrorBoundary>
      );
    }

    if (route === '/rendez-vous') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title={t('userMenu.appointments', 'Mes Rendez-vous')} />
          <Suspense fallback={<LoadingSpinner message={t('loadingAppointments')} />}>
            <AppointmentRequest user={user} userName={user.email?.split('@')[0] || ''} />
          </Suspense>
        </div>
      );
    }

    if (route === '/profile') {
      return (
        <Suspense fallback={<LoadingSpinner message={t('loadingProfile')} />}>
          <UserProfile
            user={user}
            onBack={handleBack}
          />
        </Suspense>
      );
    }

    // Routes Admin
    if (route === '/admin' || route === '/admin/dashboard') {
      return (
        <Suspense fallback={<FullPageLoader message={t('loadingAdminDashboard')} />}>
          {useProDashboards 
            ? <AdminDashboardPro onBack={handleBack} />
            : <AdminDashboard onBack={handleBack} />}
        </Suspense>
      );
    }

    // Routes Consultant
    if (route === '/consultant' || route === '/consultant/dashboard') {
      return (
        <Suspense fallback={<FullPageLoader message={t('loadingConsultantDashboard')} />}>
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
          <Suspense fallback={<FullPageLoader message={t('loadingAdminDashboard')} />}>
            {useProDashboards 
              ? <AdminDashboardPro onBack={handleBack} />
              : <AdminDashboard onBack={handleBack} />}
          </Suspense>
        );
      case 'consultant':
        return (
          <Suspense fallback={<FullPageLoader message={t('loadingConsultantDashboard')} />}>
            {useProDashboards
              ? <ConsultantDashboardPro onBack={handleBack} />
              : <ConsultantDashboard onBack={handleBack} />}
          </Suspense>
        );
      case 'client':
      default:
        // Rediriger vers le dashboard si on est sur la route racine
        if (route === '/' || route === '') {
          window.location.hash = '#/dashboard';
          return <FullPageLoader message={t('redirectToDashboard', 'Redirection vers votre tableau de bord...')} />;
        }
        return (
          <Suspense fallback={<FullPageLoader message={t('loadingApp')} />}>
            <ClientAppWithSession user={user} />
          </Suspense>
        );
    }
  };

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default App;
