/**
 * Tests du service de notifications push
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isNotificationSupported,
  getPermissionStatus,
  requestPermission,
  sendLocalNotification,
  notifications,
  scheduleNotification,
  scheduleRappelQuotidien,
  registerPushServiceWorker,
} from './pushNotificationService';

describe('pushNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isNotificationSupported', () => {
    it('devrait retourner true si Notification et serviceWorker sont disponibles', () => {
      expect(isNotificationSupported()).toBe(true);
    });

    it('devrait retourner un booléen', () => {
      expect(typeof isNotificationSupported()).toBe('boolean');
    });
  });

  describe('getPermissionStatus', () => {
    it('devrait retourner le statut de permission actuel', () => {
      const status = getPermissionStatus();
      expect(['default', 'granted', 'denied', 'unsupported']).toContain(status);
    });

    it('devrait retourner une chaîne de caractères', () => {
      const status = getPermissionStatus();
      expect(typeof status).toBe('string');
    });
  });

  describe('requestPermission', () => {
    it('devrait être une fonction async', () => {
      const result = requestPermission();
      expect(result).toBeInstanceOf(Promise);
    });

    it('devrait retourner une permission', async () => {
      const permission = await requestPermission();
      expect(['default', 'granted', 'denied']).toContain(permission);
    });
  });

  describe('sendLocalNotification', () => {
    it('devrait être une fonction async', () => {
      const result = sendLocalNotification({ title: 'Test', body: 'Test body' });
      expect(result).toBeInstanceOf(Promise);
    });

    it('devrait retourner un booléen', async () => {
      const result = await sendLocalNotification({ title: 'Test', body: 'Test' });
      expect(typeof result).toBe('boolean');
    });
  });

  describe('registerPushServiceWorker', () => {
    it('devrait être une fonction async', () => {
      const result = registerPushServiceWorker();
      expect(result).toBeInstanceOf(Promise);
    });

    it('devrait retourner une registration ou null', async () => {
      const registration = await registerPushServiceWorker();
      expect(registration === null || typeof registration === 'object').toBe(true);
    });
  });

  describe('scheduleRappelQuotidien', () => {
    it('devrait être une fonction', () => {
      expect(typeof scheduleRappelQuotidien).toBe('function');
    });

    it('devrait accepter un nombre de questions', () => {
      vi.useFakeTimers();
      expect(() => scheduleRappelQuotidien(5)).not.toThrow();
      vi.useRealTimers();
    });

    it('devrait accepter une heure de rappel optionnelle', () => {
      vi.useFakeTimers();
      expect(() => scheduleRappelQuotidien(10, 14)).not.toThrow();
      vi.useRealTimers();
    });
  });

  describe('notifications templates', () => {
    describe('bienvenue', () => {
      it('devrait créer une notification de bienvenue', () => {
        const notif = notifications.bienvenue('Jean');
        expect(notif.title).toContain('Jean');
        expect(notif.body).toBeDefined();
        expect(notif.tag).toBe('bienvenue');
      });

      it('devrait inclure le nom de l\'utilisateur dans le titre', () => {
        const notif = notifications.bienvenue('Marie');
        expect(notif.title).toContain('Marie');
      });

      it('devrait avoir une icône définie', () => {
        const notif = notifications.bienvenue('Test');
        expect(notif.icon).toBeDefined();
      });

      it('devrait inclure le nom de l\'organisation', () => {
        const notif = notifications.bienvenue('Test');
        expect(notif.body).toContain('NETZ INFORMATIQUE');
      });

      it('devrait avoir des données de type bienvenue', () => {
        const notif = notifications.bienvenue('Test');
        expect(notif.data?.type).toBe('bienvenue');
      });
    });

    describe('continuerBilan', () => {
      it('devrait créer une notification de rappel de bilan', () => {
        const notif = notifications.continuerBilan(5);
        expect(notif.title).toContain('Continuez');
        expect(notif.body).toContain('5');
        expect(notif.tag).toBe('rappel-bilan');
        expect(notif.actions).toHaveLength(2);
      });

      it('devrait afficher le bon nombre de questions', () => {
        const notif = notifications.continuerBilan(10);
        expect(notif.body).toContain('10');
      });

      it('devrait avoir requireInteraction à true', () => {
        const notif = notifications.continuerBilan(3);
        expect(notif.requireInteraction).toBe(true);
      });

      it('devrait avoir des actions définies', () => {
        const notif = notifications.continuerBilan(5);
        expect(notif.actions).toBeDefined();
        expect(notif.actions?.[0].action).toBe('continuer');
        expect(notif.actions?.[1].action).toBe('plus-tard');
      });

      it('devrait avoir des données avec type et action', () => {
        const notif = notifications.continuerBilan(5);
        expect(notif.data?.type).toBe('rappel-bilan');
        expect(notif.data?.action).toBe('continuer');
      });
    });

    describe('rappelRendezVous', () => {
      it('devrait créer une notification de rappel de rendez-vous', () => {
        const notif = notifications.rappelRendezVous('20/12/2025', '10:00', 'Entretien');
        expect(notif.title).toContain('Rappel');
        expect(notif.body).toContain('20/12/2025');
        expect(notif.body).toContain('10:00');
        expect(notif.tag).toBe('rappel-rdv');
      });

      it('devrait inclure le type de rendez-vous', () => {
        const notif = notifications.rappelRendezVous('21/12/2025', '14:00', 'Bilan final');
        expect(notif.body).toContain('Bilan final');
      });

      it('devrait avoir des données avec date et heure', () => {
        const notif = notifications.rappelRendezVous('22/12/2025', '09:00', 'Test');
        expect(notif.data?.date).toBe('22/12/2025');
        expect(notif.data?.heure).toBe('09:00');
      });

      it('devrait avoir requireInteraction à true', () => {
        const notif = notifications.rappelRendezVous('22/12/2025', '09:00', 'Test');
        expect(notif.requireInteraction).toBe(true);
      });

      it('devrait avoir des actions voir et ok', () => {
        const notif = notifications.rappelRendezVous('22/12/2025', '09:00', 'Test');
        expect(notif.actions).toHaveLength(2);
        expect(notif.actions?.[0].action).toBe('voir');
        expect(notif.actions?.[1].action).toBe('ok');
      });
    });

    describe('bilanTermine', () => {
      it('devrait créer une notification de bilan terminé', () => {
        const notif = notifications.bilanTermine();
        expect(notif.title).toContain('Félicitations');
        expect(notif.tag).toBe('bilan-termine');
      });

      it('devrait mentionner les documents', () => {
        const notif = notifications.bilanTermine();
        expect(notif.body).toContain('documents');
      });

      it('devrait avoir une action pour voir les documents', () => {
        const notif = notifications.bilanTermine();
        expect(notif.actions).toBeDefined();
        expect(notif.actions?.[0].action).toBe('voir-documents');
      });

      it('devrait avoir requireInteraction à true', () => {
        const notif = notifications.bilanTermine();
        expect(notif.requireInteraction).toBe(true);
      });

      it('devrait avoir des données avec type et action', () => {
        const notif = notifications.bilanTermine();
        expect(notif.data?.type).toBe('bilan-termine');
        expect(notif.data?.action).toBe('voir-documents');
      });
    });

    describe('documentsDisponibles', () => {
      it('devrait créer une notification de documents disponibles', () => {
        const notif = notifications.documentsDisponibles();
        expect(notif.title).toContain('Documents');
        expect(notif.tag).toBe('documents-prets');
      });

      it('devrait mentionner Qualiopi', () => {
        const notif = notifications.documentsDisponibles();
        expect(notif.body).toContain('Qualiopi');
      });

      it('devrait avoir une action télécharger', () => {
        const notif = notifications.documentsDisponibles();
        expect(notif.actions).toBeDefined();
        expect(notif.actions?.[0].action).toBe('telecharger');
      });

      it('devrait avoir des données avec type', () => {
        const notif = notifications.documentsDisponibles();
        expect(notif.data?.type).toBe('documents-prets');
      });
    });

    describe('messageConsultant', () => {
      it('devrait créer une notification de message du consultant', () => {
        const notif = notifications.messageConsultant('Mikail');
        expect(notif.title).toContain('Mikail');
        expect(notif.tag).toBe('message-consultant');
      });

      it('devrait avoir requireInteraction à true', () => {
        const notif = notifications.messageConsultant('Test');
        expect(notif.requireInteraction).toBe(true);
      });

      it('devrait avoir une action pour lire', () => {
        const notif = notifications.messageConsultant('Consultant');
        expect(notif.actions).toBeDefined();
        expect(notif.actions?.[0].action).toBe('lire');
      });

      it('devrait avoir des données avec type et from', () => {
        const notif = notifications.messageConsultant('Jean');
        expect(notif.data?.type).toBe('message');
        expect(notif.data?.from).toBe('Jean');
      });
    });
  });

  describe('scheduleNotification', () => {
    it('devrait retourner un timeout', () => {
      const notif = notifications.bilanTermine();
      const timeout = scheduleNotification(notif, 5000);
      expect(timeout).toBeDefined();
      clearTimeout(timeout);
    });

    it('devrait planifier avec le bon délai', () => {
      vi.useFakeTimers();
      const notif = notifications.documentsDisponibles();
      const timeout = scheduleNotification(notif, 1000);
      expect(timeout).toBeDefined();
      vi.advanceTimersByTime(1000);
      clearTimeout(timeout);
    });

    it('devrait accepter différents délais', () => {
      vi.useFakeTimers();
      const notif = notifications.bienvenue('Test');
      
      const timeout1 = scheduleNotification(notif, 100);
      const timeout2 = scheduleNotification(notif, 5000);
      const timeout3 = scheduleNotification(notif, 60000);
      
      expect(timeout1).toBeDefined();
      expect(timeout2).toBeDefined();
      expect(timeout3).toBeDefined();
      
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    });
  });

  describe('module exports', () => {
    it('devrait exporter toutes les fonctions nécessaires', async () => {
      const module = await import('./pushNotificationService');
      
      expect(module.isNotificationSupported).toBeDefined();
      expect(module.getPermissionStatus).toBeDefined();
      expect(module.requestPermission).toBeDefined();
      expect(module.sendLocalNotification).toBeDefined();
      expect(module.notifications).toBeDefined();
      expect(module.scheduleNotification).toBeDefined();
      expect(module.scheduleRappelQuotidien).toBeDefined();
      expect(module.registerPushServiceWorker).toBeDefined();
    });

    it('devrait avoir un export par défaut', async () => {
      const module = await import('./pushNotificationService');
      expect(module.default).toBeDefined();
    });

    it('devrait avoir toutes les fonctions dans l\'export par défaut', async () => {
      const module = await import('./pushNotificationService');
      
      expect(module.default.isNotificationSupported).toBeDefined();
      expect(module.default.getPermissionStatus).toBeDefined();
      expect(module.default.requestPermission).toBeDefined();
      expect(module.default.sendLocalNotification).toBeDefined();
      expect(module.default.notifications).toBeDefined();
      expect(module.default.scheduleNotification).toBeDefined();
      expect(module.default.scheduleRappelQuotidien).toBeDefined();
      expect(module.default.registerPushServiceWorker).toBeDefined();
    });
  });
});
