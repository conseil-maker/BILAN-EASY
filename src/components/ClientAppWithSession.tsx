/**
 * ClientAppWithSession - Wrapper qui intègre le SessionProvider autour de ClientApp
 * 
 * Ce composant permet une migration progressive vers le SessionContext
 * sans modifier le code existant de ClientApp.
 * 
 * @author Manus AI
 * @date 27 janvier 2026
 */

import React, { Suspense, lazy } from 'react';
import { User } from '@supabase/supabase-js';
import { SessionProvider } from '../contexts/SessionContext';
import { FullPageLoader } from './LazyComponents';

// Lazy load ClientApp pour optimiser le chargement
const ClientApp = lazy(() => import('./ClientApp'));

interface ClientAppWithSessionProps {
  user: User;
}

/**
 * Wrapper qui fournit le SessionContext à ClientApp
 * 
 * Usage dans App.tsx:
 * ```tsx
 * <ClientAppWithSession user={user} />
 * ```
 */
export const ClientAppWithSession: React.FC<ClientAppWithSessionProps> = ({ user }) => {
  return (
    <SessionProvider user={user}>
      <Suspense fallback={<FullPageLoader message="Chargement de votre espace..." />}>
        <ClientApp user={user} />
      </Suspense>
    </SessionProvider>
  );
};

export default ClientAppWithSession;
