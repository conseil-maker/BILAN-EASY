/**
 * Tests du service de notifications push
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isNotificationSupported,
  getPermissionStatus,
  notifications,
} from './pushNotificationService';

describe('pushNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isNotificationSupported', () => {
    it('devrait retourner true si Notification et serviceWorker sont disponibles', () => {
      expect(isNotificationSupported()).toBe(true);
    });
  });

  describe('getPermissionStatus', () => {
    it('devrait retourner le statut de permission actuel', () => {
      const status = getPermissionStatus();
      expect(['default', 'granted', 'denied']).toContain(status);
    });
  });

  describe('notifications templates', () => {
    it('devrait créer une notification de bienvenue', () => {
      const notif = notifications.bienvenue('Jean');
      expect(notif.title).toContain('Jean');
      expect(notif.body).toBeDefined();
      expect(notif.tag).toBe('bienvenue');
    });

    it('devrait créer une notification de rappel de bilan', () => {
      const notif = notifications.continuerBilan(5);
      expect(notif.title).toContain('Continuez');
      expect(notif.body).toContain('5');
      expect(notif.tag).toBe('rappel-bilan');
      expect(notif.actions).toHaveLength(2);
    });

    it('devrait créer une notification de rappel de rendez-vous', () => {
      const notif = notifications.rappelRendezVous('20/12/2025', '10:00', 'Entretien');
      expect(notif.title).toContain('Rappel');
      expect(notif.body).toContain('20/12/2025');
      expect(notif.body).toContain('10:00');
      expect(notif.tag).toBe('rappel-rdv');
    });

    it('devrait créer une notification de bilan terminé', () => {
      const notif = notifications.bilanTermine();
      expect(notif.title).toContain('Félicitations');
      expect(notif.tag).toBe('bilan-termine');
    });

    it('devrait créer une notification de documents disponibles', () => {
      const notif = notifications.documentsDisponibles();
      expect(notif.title).toContain('Documents');
      expect(notif.tag).toBe('documents-prets');
    });

    it('devrait créer une notification de message du consultant', () => {
      const notif = notifications.messageConsultant('Mikail');
      expect(notif.title).toContain('Mikail');
      expect(notif.tag).toBe('message-consultant');
    });
  });
});
