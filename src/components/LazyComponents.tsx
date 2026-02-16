/**
 * Lazy Loading des composants lourds
 * 
 * Ce fichier centralise les imports lazy pour optimiser le bundle.
 * Les composants sont chargés à la demande, réduisant le temps de chargement initial.
 */

import React, { Suspense, lazy, ComponentType } from 'react';

// Composant de chargement
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = '' }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
    <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
  </div>
);

// Composant de chargement pleine page
export const FullPageLoader: React.FC<{ message?: string }> = ({ message = '' }) => (
  <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4 mx-auto" />
      <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
    </div>
  </div>
);

// HOC pour wrapper les composants lazy avec Suspense
export function withSuspense<P extends object>(
  LazyComponent: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// ============================================
// COMPOSANTS LAZY - Dashboards Admin/Consultant
// ============================================

export const LazyAdminDashboard = lazy(() => 
  import('./AdminDashboard').then(module => ({ default: module.AdminDashboard }))
);

export const LazyAdminDashboardPro = lazy(() => 
  import('./AdminDashboardPro').then(module => ({ default: module.AdminDashboardPro }))
);

export const LazyConsultantDashboard = lazy(() => 
  import('./ConsultantDashboard').then(module => ({ default: module.ConsultantDashboard }))
);

export const LazyConsultantDashboardPro = lazy(() => 
  import('./ConsultantDashboardPro').then(module => ({ default: module.ConsultantDashboardPro }))
);

// ============================================
// COMPOSANTS LAZY - Documents et PDF
// ============================================

export const LazyDocumentsQualiopi = lazy(() => 
  import('./DocumentsQualiopi').then(module => ({ default: module.DocumentsQualiopi }))
);

export const LazyDocumentLibrary = lazy(() => 
  import('./DocumentLibrary').then(module => ({ default: module.DocumentLibrary }))
);

export const LazyMyDocuments = lazy(() => 
  import('./MyDocuments').then(module => ({ default: module.MyDocuments }))
);

// ============================================
// COMPOSANTS LAZY - Fonctionnalités avancées
// ============================================


export const LazySatisfactionSurvey = lazy(() => 
  import('./SatisfactionSurvey').then(module => ({ default: module.SatisfactionSurvey }))
);

export const LazyAppointmentSystem = lazy(() => 
  import('./AppointmentRequest').then(module => ({ default: module.default }))
);

// ============================================
// COMPOSANTS LAZY - Pages légales
// ============================================

export const LazyCGU = lazy(() => 
  import('./legal').then(module => ({ default: module.CGU }))
);

export const LazyCGV = lazy(() => 
  import('./legal').then(module => ({ default: module.CGV }))
);

export const LazyPrivacy = lazy(() => 
  import('./legal').then(module => ({ default: module.Privacy }))
);

export const LazyCookiesPolicy = lazy(() => 
  import('./legal').then(module => ({ default: module.CookiesPolicy }))
);

// ============================================
// COMPOSANTS LAZY - Client App
// ============================================

export const LazyClientApp = lazy(() => 
  import('./ClientApp')
);

export const LazyClientDashboard = lazy(() => 
  import('./ClientDashboard').then(module => ({ default: module.ClientDashboard }))
);

export const LazyAboutPage = lazy(() => 
  import('./AboutPage').then(module => ({ default: module.AboutPage }))
);

// ============================================
// EXPORTS AVEC SUSPENSE PRÉ-CONFIGURÉ
// ============================================

export const AdminDashboardLazy = withSuspense(LazyAdminDashboard, <LoadingSpinner />);
export const AdminDashboardProLazy = withSuspense(LazyAdminDashboardPro, <LoadingSpinner />);
export const ConsultantDashboardLazy = withSuspense(LazyConsultantDashboard, <LoadingSpinner />);
export const ConsultantDashboardProLazy = withSuspense(LazyConsultantDashboardPro, <LoadingSpinner />);
export const DocumentsQualiopiLazy = withSuspense(LazyDocumentsQualiopi, <LoadingSpinner />);
export const DocumentLibraryLazy = withSuspense(LazyDocumentLibrary, <LoadingSpinner />);
export const MyDocumentsLazy = withSuspense(LazyMyDocuments, <LoadingSpinner />);
export const SatisfactionSurveyLazy = withSuspense(LazySatisfactionSurvey, <LoadingSpinner />);
export const AppointmentSystemLazy = withSuspense(LazyAppointmentSystem, <LoadingSpinner />);
export const CGULazy = withSuspense(LazyCGU, <LoadingSpinner />);
export const CGVLazy = withSuspense(LazyCGV, <LoadingSpinner />);
export const PrivacyLazy = withSuspense(LazyPrivacy, <LoadingSpinner />);
export const CookiesPolicyLazy = withSuspense(LazyCookiesPolicy, <LoadingSpinner />);
export const ClientAppLazy = withSuspense(LazyClientApp, <FullPageLoader />);
export const ClientDashboardLazy = withSuspense(LazyClientDashboard, <LoadingSpinner />);
export const AboutPageLazy = withSuspense(LazyAboutPage, <LoadingSpinner />);
