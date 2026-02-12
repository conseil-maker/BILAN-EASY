import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('documents');
  const packageInfo = useUserPackage(user.id);

  // Afficher un loader pendant le chargement du forfait
  if (packageInfo.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <GlobalNavbar 
          user={user} 
          userRole={userRole} 
          showBackButton={true} 
          title={pageType === 'documents' ? t('title') : pageType === 'library' ? t('library') : t('myDocuments')} 
        />
        <LoadingSpinner message={t('loadingInfo')} />
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
        <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title={t('title')} />
        <div className="p-6">
          <Suspense fallback={<LoadingSpinner message={t('loadingDocs')} />}>
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
        <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title={t('library')} />
        <Suspense fallback={<LoadingSpinner message={t('loadingLibrary')} />}>
          <DocumentLibrary
            userId={user.id}
            userName={user.email?.split('@')[0] || t('defaultUser')}
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
      <GlobalNavbar user={user} userRole={userRole} showBackButton={true} title={t('myDocuments')} />
      <Suspense fallback={<LoadingSpinner message={t('loadingMyDocs')} />}>
        <MyDocuments
          user={user}
          {...commonProps}
        />
      </Suspense>
    </div>
  );
};

export default DocumentsWithPackage;
