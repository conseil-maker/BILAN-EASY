/**
 * Tests du service de notifications push
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isNotificationSupported,
  getPermissionStatus,
  notifications,
  scheduleNotification,
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
  });
});
