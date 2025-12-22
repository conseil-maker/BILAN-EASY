/**
 * Composant de gestion des notifications push
 * 
 * Affiche une bannière pour demander la permission
 * et gère les préférences de notification
 */

import React, { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  getPermissionStatus,
  requestPermission,
  sendLocalNotification,
  notifications,
} from '../services/pushNotificationService';
import { useToast } from './ToastProvider';

interface NotificationManagerProps {
  userName?: string;
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  userName,
  onPermissionChange,
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    // Vérifier le statut initial
    const status = getPermissionStatus();
    setPermission(status);

    // Afficher la bannière si pas encore décidé (sessionStorage pour cette session uniquement)
    const hasSeenBanner = sessionStorage.getItem('notification-banner-dismissed');
    if (status === 'default' && !hasSeenBanner) {
      // Attendre un peu avant d'afficher
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    setPermission(result);
    setShowBanner(false);
    sessionStorage.setItem('notification-banner-dismissed', 'true');

    if (result === 'granted') {
      showSuccess('Notifications activées !');
      
      // Envoyer une notification de bienvenue
      if (userName) {
        setTimeout(() => {
          sendLocalNotification(notifications.bienvenue(userName));
        }, 1000);
      }
    } else if (result === 'denied') {
      showInfo('Vous pouvez activer les notifications plus tard dans les paramètres');
    }

    onPermissionChange?.(result);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    sessionStorage.setItem('notification-banner-dismissed', 'true');
  };

  // Ne pas afficher si non supporté ou déjà décidé
  if (!isNotificationSupported() || permission !== 'default' || dismissed || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="text-white">
              <h3 className="font-semibold">Restez informé</h3>
              <p className="text-sm text-white/80">Activez les notifications</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Recevez des rappels pour continuer votre bilan et des alertes pour vos rendez-vous.
          </p>

          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 mb-4">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Rappels de rendez-vous
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Progression du bilan
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Documents disponibles
            </li>
          </ul>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleRequestPermission}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Activer
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
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
    </div>
  );
};

/**
 * Hook pour utiliser les notifications
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setPermission(getPermissionStatus());
  }, []);

  const request = async () => {
    const result = await requestPermission();
    setPermission(result);
    return result;
  };

  const send = async (title: string, body: string, options?: Partial<Parameters<typeof sendLocalNotification>[0]>) => {
    return sendLocalNotification({
      title,
      body,
      ...options,
    });
  };

  return {
    permission,
    isSupported: isNotificationSupported(),
    isGranted: permission === 'granted',
    request,
    send,
    notifications,
  };
};

export default NotificationManager;
