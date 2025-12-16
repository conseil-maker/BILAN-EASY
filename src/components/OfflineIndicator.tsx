import React, { useState, useEffect } from 'react';
import { useOffline } from '../hooks/useOffline';

interface OfflineIndicatorProps {
  showSyncButton?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ showSyncButton = true }) => {
  const { isOnline, pendingSyncCount, syncNow } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Afficher brièvement le message "Connexion rétablie"
      setTimeout(() => {
        setShowBanner(false);
        setWasOffline(false);
      }, 3000);
    }
  }, [isOnline, wasOffline]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncNow();
    setIsSyncing(false);
  };

  if (!showBanner && isOnline && pendingSyncCount === 0) {
    return null;
  }

  return (
    <>
      {/* Barre de statut hors-ligne */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white py-3 px-4 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="font-medium">Mode hors-ligne</span>
              <span className="text-amber-100 text-sm">
                Vos données sont sauvegardées localement
              </span>
            </div>
            {pendingSyncCount > 0 && (
              <span className="bg-amber-600 px-3 py-1 rounded-full text-sm">
                {pendingSyncCount} en attente
              </span>
            )}
          </div>
        </div>
      )}

      {/* Message de connexion rétablie */}
      {isOnline && wasOffline && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white py-3 px-4 z-50 shadow-lg animate-slide-up">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Connexion rétablie</span>
              {pendingSyncCount > 0 && (
                <span className="text-green-100 text-sm">
                  Synchronisation en cours...
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de synchronisation en attente (quand en ligne) */}
      {isOnline && !wasOffline && pendingSyncCount > 0 && showSyncButton && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full shadow-lg transition-all disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Synchronisation...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Synchroniser ({pendingSyncCount})</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Styles pour l'animation */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default OfflineIndicator;
