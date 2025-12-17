/**
 * Tests du service Gmail
 */

import { describe, it, expect } from 'vitest';
import { gmailTemplates, prepareWelcomeEmail } from './gmailService';

describe('gmailService', () => {
  describe('gmailTemplates', () => {
    it('devrait créer un template de bienvenue', () => {
      const template = gmailTemplates.welcome('Jean Dupont', 'Bilan Approfondi');
      
      expect(template.subject).toContain('Bienvenue');
      expect(template.content).toContain('Jean Dupont');
      expect(template.content).toContain('Bilan Approfondi');
      expect(template.content).toContain('NETZ INFORMATIQUE');
    });

    it('devrait créer un template de confirmation de rendez-vous', () => {
      const template = gmailTemplates.appointmentConfirmation(
        'Marie Martin',
        '20/12/2025',
        '14:00',
        'Entretien de suivi',
        'Mikail LEKESIZ'
      );
      
      expect(template.subject).toContain('Confirmation');
      expect(template.content).toContain('Marie Martin');
      expect(template.content).toContain('20/12/2025');
      expect(template.content).toContain('14:00');
      expect(template.content).toContain('Mikail LEKESIZ');
    });

    it('devrait créer un template de rappel de rendez-vous', () => {
      const template = gmailTemplates.appointmentReminder(
        'Pierre Durand',
        '21/12/2025',
        '10:00',
        'Entretien final'
      );
      
      expect(template.subject).toContain('Rappel');
      expect(template.content).toContain('Pierre Durand');
      expect(template.content).toContain('21/12/2025');
      expect(template.content).toContain('DEMAIN'); // En majuscules dans le template
    });

    it('devrait créer un template de bilan terminé', () => {
      const template = gmailTemplates.bilanCompleted('Sophie Bernard');
      
      expect(template.subject.toLowerCase()).toContain('terminé');
      expect(template.content).toContain('Sophie Bernard');
      expect(template.content).toContain('Félicitations');
    });

    it('devrait créer un template de suivi', () => {
      const template = gmailTemplates.followUp6Months('Lucas Petit');
      
      expect(template.subject.toLowerCase()).toContain('suivi');
      expect(template.content).toContain('Lucas Petit');
    });
  });

  describe('prepareWelcomeEmail', () => {
    it('devrait préparer un email de bienvenue complet', () => {
      const email = prepareWelcomeEmail(
        'test@example.com',
        'Jean Dupont',
        'Bilan Essentiel'
      );
      
      expect(email.to).toContain('test@example.com');
      expect(email.subject).toContain('Bienvenue');
      expect(email.content).toContain('Jean Dupont');
      expect(email.content).toContain('Bilan Essentiel');
    });
  });
});
