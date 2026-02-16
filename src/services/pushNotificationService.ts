/**
 * Service de Push Notifications
 * 
 * Gère les notifications push pour :
 * - Rappels de continuer le bilan
 * - Notifications de rendez-vous
 * - Alertes importantes
 */

import { organizationConfig } from '../config/organization';

// Types
export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Configuration
const NOTIFICATION_CONFIG = {
  icon: '/icon-192.png',
  badge: '/icon-72.png',
  defaultTag: 'bilan-easy',
};

/**
 * Vérifie si les notifications sont supportées
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Vérifie le statut de permission actuel
 */
export const getPermissionStatus = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Demande la permission pour les notifications
 */
export const requestPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    console.warn('[Push] Notifications non supportées');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Push] Permission:', permission);
    return permission;
  } catch (error) {
    console.error('[Push] Erreur demande permission:', error);
    return 'denied';
  }
};

/**
 * Envoie une notification locale
 */
export const sendLocalNotification = async (
  options: PushNotificationOptions
): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('[Push] Notifications non supportées');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[Push] Permission non accordée');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || NOTIFICATION_CONFIG.icon,
      badge: options.badge || NOTIFICATION_CONFIG.badge,
      tag: options.tag || NOTIFICATION_CONFIG.defaultTag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      ...(options.actions ? { actions: options.actions } as any : {}),
    });

    console.log('[Push] Notification envoyée:', options.title);
    return true;
  } catch (error) {
    console.error('[Push] Erreur envoi notification:', error);
    return false;
  }
};

/**
 * Notifications prédéfinies
 */
export const notifications = {
  // Rappel pour continuer le bilan
  continuerBilan: (questionsRestantes: number): PushNotificationOptions => ({
    title: 'Continuez votre bilan ! 📝',
    body: `Il vous reste ${questionsRestantes} questions. Reprenez où vous en étiez.`,
    icon: NOTIFICATION_CONFIG.icon,
    tag: 'rappel-bilan',
    data: { type: 'rappel-bilan', action: 'continuer' },
    requireInteraction: true,
    actions: [
      { action: 'continuer', title: 'Continuer' },
      { action: 'plus-tard', title: 'Plus tard' },
    ],
  }),

  // Rappel de rendez-vous
  rappelRendezVous: (date: string, heure: string, type: string): PushNotificationOptions => ({
    title: 'Rappel de rendez-vous 📅',
    body: `${type} prévu le ${date} à ${heure}`,
    icon: NOTIFICATION_CONFIG.icon,
    tag: 'rappel-rdv',
    data: { type: 'rappel-rdv', date, heure },
    requireInteraction: true,
    actions: [
      { action: 'voir', title: 'Voir détails' },
      { action: 'ok', title: 'OK' },
    ],
  }),

  // Bilan terminé
  bilanTermine: (): PushNotificationOptions => ({
    title: 'Félicitations ! 🎉',
    body: 'Votre bilan de compétences est terminé. Vos documents sont disponibles.',
    icon: NOTIFICATION_CONFIG.icon,
    tag: 'bilan-termine',
    data: { type: 'bilan-termine', action: 'voir-documents' },
    requireInteraction: true,
    actions: [
      { action: 'voir-documents', title: 'Voir mes documents' },
    ],
  }),

  // Documents disponibles
  documentsDisponibles: (): PushNotificationOptions => ({
    title: 'Documents disponibles 📄',
    body: 'Vos documents Qualiopi sont prêts à être téléchargés.',
    icon: NOTIFICATION_CONFIG.icon,
    tag: 'documents-prets',
    data: { type: 'documents-prets' },
    actions: [
      { action: 'telecharger', title: 'Télécharger' },
    ],
  }),

  // Message du consultant
  messageConsultant: (consultantName: string): PushNotificationOptions => ({
    title: `Message de ${consultantName} 💬`,
    body: 'Vous avez reçu un nouveau message de votre consultant.',
    icon: NOTIFICATION_CONFIG.icon,
    tag: 'message-consultant',
    data: { type: 'message', from: consultantName },
    requireInteraction: true,
    actions: [
      { action: 'lire', title: 'Lire' },
    ],
  }),

  // Bienvenue
  bienvenue: (userName: string): PushNotificationOptions => ({
    title: `Bienvenue ${userName} ! 👋`,
    body: `${organizationConfig.name} vous accompagne dans votre bilan de compétences.`,
    icon: NOTIFICATION_CONFIG.icon,
    tag: 'bienvenue',
    data: { type: 'bienvenue' },
  }),
};

/**
 * Planifie une notification pour plus tard
 */
export const scheduleNotification = (
  options: PushNotificationOptions,
  delayMs: number
): NodeJS.Timeout => {
  return setTimeout(() => {
    sendLocalNotification(options);
  }, delayMs);
};

/**
 * Planifie un rappel quotidien pour continuer le bilan
 */
export const scheduleRappelQuotidien = (
  questionsRestantes: number,
  heureRappel: number = 10 // 10h par défaut
): void => {
  const now = new Date();
  const rappelTime = new Date();
  rappelTime.setHours(heureRappel, 0, 0, 0);

  // Si l'heure est passée, planifier pour demain
  if (rappelTime <= now) {
    rappelTime.setDate(rappelTime.getDate() + 1);
  }

  const delayMs = rappelTime.getTime() - now.getTime();

  scheduleNotification(
    notifications.continuerBilan(questionsRestantes),
    delayMs
  );

  console.log('[Push] Rappel planifié pour:', rappelTime.toLocaleString('fr-FR'));
};

/**
 * Enregistre le service worker pour les notifications
 */
export const registerPushServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Push] Service Worker non supporté');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[Push] Service Worker enregistré:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[Push] Erreur enregistrement SW:', error);
    return null;
  }
};

export default {
  isNotificationSupported,
  getPermissionStatus,
  requestPermission,
  sendLocalNotification,
  notifications,
  scheduleNotification,
  scheduleRappelQuotidien,
  registerPushServiceWorker,
};
