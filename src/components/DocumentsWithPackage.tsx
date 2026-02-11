import React, { Suspense, lazy } from 'react';
import { User } from '@supabase/supabase-js';
import { useUserPackage } from '../hooks/useUserPackage';
import { LoadingSpinner } from './LazyComponents';
import { GlobalNavbar } from './GlobalNavbar';

// Lazy load des composants documents
const DocumentsQualiopi = lazy(() => 
  import('./DocumentsQualiopi').then(m => ({ default: m.DocumentsQualiopi }))
);
const DocumentLibrary = lazy(() => 
  import('./DocumentLibrary').then(m => ({ default: m.DocumentLibrary }))
);
const MyDocuments = lazy(() => 
  import('./MyDocuments').then(m => ({ default: m.MyDocuments }))
);

interface DocumentsPageProps {
  user: User;
  userRole: string;
  pageType: 'documents' | 'library' | 'mes-documents';
}

/**
 * Composant wrapper qui récupère dynamiquement le forfait de l'utilisateur
 * et le passe aux composants de documents
 */
export const DocumentsWithPackage: React.FC<DocumentsPageProps> = ({ user, userRole, pageType }) => {
  const packageInfo = useUserPackage(user.id);

  // Afficher un loader pendant le chargement du forfait
  if (packageInfo.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <GlobalNavbar 
          user={user} 
          userRole={userRole} 
          showBackButton={true} 
          title={pageType === 'documents' ? 'Documents' : pageType === 'library' ? 'Bibliothèque' : 'Mes Documents'} 
        />
        <LoadingSpinner message="Chargement de vos informations..." />
      </div>
    );
  }

  const commonProps = {
    packageName: packageInfo.packageName,
    packageDuration: packageInfo.packageDuration,
    packagePrice: packageInfo.packagePrice,
    startDate: packageInfo.startDate,
    endDate: packageInfo.endDate,
    isCompleted: packageInfo.isCompleted,
    summary: packageInfo.summary,
    answers: packageInfo.answers,
  };

  if (pageType === 'documents') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Documents" />
        <div className="p-6">
          <Suspense fallback={<LoadingSpinner message="Chargement des documents..." />}>
            <DocumentsQualiopi
              userId={user.id}
              {...commonProps}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  if (pageType === 'library') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Bibliothèque" />
        <Suspense fallback={<LoadingSpinner message="Chargement de la bibliothèque..." />}>
          <DocumentLibrary
            userId={user.id}
            userName={user.email?.split('@')[0] || 'Utilisateur'}
            userEmail={user.email || ''}
            {...commonProps}
          />
        </Suspense>
      </div>
    );
  }

  // mes-documents
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title="Mes Documents" />
      <Suspense fallback={<LoadingSpinner message="Chargement de vos documents..." />}>
        <MyDocuments
          user={user}
          {...commonProps}
        />
      </Suspense>
    </div>
  );
};

export default DocumentsWithPackage;
