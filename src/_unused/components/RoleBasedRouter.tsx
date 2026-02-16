import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '@supabase/supabase-js';
import ClientApp from './ClientApp';
import ConsultantDashboardPro from './ConsultantDashboardPro';
import AdminDashboardPro from './AdminDashboardPro';

interface RoleBasedRouterProps {
  user: User;
  userRole: string;
}

/**
 * Composant de routage basé sur les rôles
 * Redirige automatiquement vers le bon dashboard selon le rôle de l'utilisateur
 */
const RoleBasedRouter: React.FC<RoleBasedRouterProps> = ({ user, userRole }) => {
  // Vérifier si une route spécifique est demandée via le hash
  const hash = window.location.hash;
  
  // Routes accessibles à tous les rôles
  const publicRoutes = [
    '#/legal/cgu',
    '#/legal/cgv',
    '#/legal/privacy',
    '#/legal/cookies',
    '#/about',
  ];
  
  // Si c'est une route publique, laisser App.tsx gérer
  if (publicRoutes.some(route => hash.startsWith(route))) {
    return null; // Sera géré par App.tsx
  }

  // Routage basé sur le rôle
  switch (userRole) {
    case 'admin':
      // Admin peut accéder au dashboard admin ou forcer une autre vue
      if (hash === '#/client') {
        return <ClientApp user={user} />;
      }
      if (hash === '#/consultant') {
        return <ConsultantDashboardPro />;
      }
      return <AdminDashboardPro />;
      
    case 'consultant':
      // Consultant peut accéder au dashboard consultant ou voir un client
      if (hash === '#/client') {
        return <ClientApp user={user} />;
      }
      return <ConsultantDashboardPro />;
      
    case 'client':
    default:
      // Client accède toujours à l'application client
      return <ClientApp user={user} />;
  }
};

export default RoleBasedRouter;

/**
 * Hook pour obtenir les permissions basées sur le rôle
 */
export const useRolePermissions = (userRole: string) => {
  const permissions = {
    canAccessAdmin: userRole === 'admin',
    canAccessConsultant: userRole === 'admin' || userRole === 'consultant',
    canAccessClient: true,
    canManageUsers: userRole === 'admin',
    canViewAllClients: userRole === 'admin' || userRole === 'consultant',
    canGenerateReports: userRole === 'admin' || userRole === 'consultant',
    canExportData: userRole === 'admin',
  };
  
  return permissions;
};

/**
 * Composant de navigation basé sur les rôles
 */
interface RoleNavigationProps {
  userRole: string;
  currentView: 'admin' | 'consultant' | 'client';
  onViewChange: (view: 'admin' | 'consultant' | 'client') => void;
}

export const RoleNavigation: React.FC<RoleNavigationProps> = ({
  userRole,
  currentView,
  onViewChange,
}) => {
  const permissions = useRolePermissions(userRole);
  const { t } = useTranslation('common');
  
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {permissions.canAccessAdmin && (
        <button
          onClick={() => onViewChange('admin')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            currentView === 'admin'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          {t('nav.administration', 'Administration')}
        </button>
      )}
      {permissions.canAccessConsultant && (
        <button
          onClick={() => onViewChange('consultant')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            currentView === 'consultant'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          {t('nav.consultant', 'Consultant')}
        </button>
      )}
      <button
        onClick={() => onViewChange('client')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
          currentView === 'client'
            ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
        }`}
      >
        {t('nav.clientView', 'Vue Client')}
      </button>
    </div>
  );
};
