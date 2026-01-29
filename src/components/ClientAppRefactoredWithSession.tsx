/**
 * ClientAppRefactoredWithSession - Wrapper qui intègre le SessionProvider autour de ClientAppRefactored
 * 
 * Ce composant permet de tester la version refactorisée de ClientApp
 * avec le SessionContext correctement initialisé.
 * 
 * @author Manus AI
 * @date 29 janvier 2026
 */

import React, { Suspense, lazy } from 'react';
import { User } from '@supabase/supabase-js';
import { SessionProvider } from '../contexts/SessionContext';
import { FullPageLoader } from './LazyComponents';

// Lazy load ClientAppRefactored pour optimiser le chargement
const ClientAppRefactored = lazy(() => import('./ClientAppRefactored'));

interface ClientAppRefactoredWithSessionProps {
  user: User;
}

/**
 * Wrapper qui fournit le SessionContext à ClientAppRefactored
 * 
 * Usage dans App.tsx:
 * ```tsx
 * <ClientAppRefactoredWithSession user={user} />
 * ```
 */
export const ClientAppRefactoredWithSession: React.FC<ClientAppRefactoredWithSessionProps> = ({ user }) => {
  return (
    <SessionProvider user={user}>
      <Suspense fallback={<FullPageLoader message="Chargement de votre espace..." />}>
        <ClientAppRefactored user={user} />
      </Suspense>
    </SessionProvider>
  );
};

export default ClientAppRefactoredWithSession;
