/**
 * Tests du service Gmail
 */

import { describe, it, expect } from 'vitest';
import { gmailTemplates, prepareWelcomeEmail } from './gmailService';

describe('gmailService', () => {
  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./gmailService');
      expect(module).toBeDefined();
    });

    it('devrait exporter gmailTemplates', async () => {
      const module = await import('./gmailService');
      expect(module.gmailTemplates).toBeDefined();
    });

    it('devrait exporter prepareWelcomeEmail', async () => {
      const module = await import('./gmailService');
      expect(module.prepareWelcomeEmail).toBeDefined();
    });
  });

  describe('gmailTemplates', () => {
    describe('welcome', () => {
      it('devrait créer un template de bienvenue', () => {
        const template = gmailTemplates.welcome('Jean Dupont', 'Bilan Approfondi');
        
        expect(template.subject).toContain('Bienvenue');
        expect(template.content).toContain('Jean Dupont');
        expect(template.content).toContain('Bilan Approfondi');
        expect(template.content).toContain('NETZ INFORMATIQUE');
      });

      it('devrait inclure le nom de l\'utilisateur', () => {
        const template = gmailTemplates.welcome('Marie Martin', 'Essentiel');
        expect(template.content).toContain('Marie Martin');
      });

      it('devrait inclure le nom du forfait', () => {
        const template = gmailTemplates.welcome('Test', 'Stratégique');
        expect(template.content).toContain('Stratégique');
      });

      it('devrait avoir un sujet défini', () => {
        const template = gmailTemplates.welcome('Test', 'Test');
        expect(template.subject).toBeDefined();
        expect(template.subject.length).toBeGreaterThan(0);
      });

      it('devrait avoir un contenu défini', () => {
        const template = gmailTemplates.welcome('Test', 'Test');
        expect(template.content).toBeDefined();
        expect(template.content.length).toBeGreaterThan(0);
      });
    });

    describe('appointmentConfirmation', () => {
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

      it('devrait inclure le type de rendez-vous', () => {
        const template = gmailTemplates.appointmentConfirmation(
          'Test',
          '01/01/2026',
          '09:00',
          'Entretien initial',
          'Consultant'
        );
        expect(template.content).toContain('Entretien initial');
      });

      it('devrait inclure le nom du consultant', () => {
        const template = gmailTemplates.appointmentConfirmation(
          'Test',
          '01/01/2026',
          '09:00',
          'Test',
          'Jean-Pierre Dupont'
        );
        expect(template.content).toContain('Jean-Pierre Dupont');
      });
    });

    describe('appointmentReminder', () => {
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
      });

      it('devrait mentionner DEMAIN', () => {
        const template = gmailTemplates.appointmentReminder(
          'Test',
          '22/12/2025',
          '15:00',
          'Test'
        );
        expect(template.content).toContain('DEMAIN');
      });

      it('devrait inclure l\'heure du rendez-vous', () => {
        const template = gmailTemplates.appointmentReminder(
          'Test',
          '22/12/2025',
          '16:30',
          'Test'
        );
        expect(template.content).toContain('16:30');
      });
    });

    describe('bilanCompleted', () => {
      it('devrait créer un template de bilan terminé', () => {
        const template = gmailTemplates.bilanCompleted('Sophie Bernard');
        
        expect(template.subject.toLowerCase()).toContain('terminé');
        expect(template.content).toContain('Sophie Bernard');
        expect(template.content).toContain('Félicitations');
      });

      it('devrait féliciter l\'utilisateur', () => {
        const template = gmailTemplates.bilanCompleted('Test User');
        expect(template.content).toContain('Félicitations');
      });

      it('devrait mentionner les documents', () => {
        const template = gmailTemplates.bilanCompleted('Test');
        expect(template.content.toLowerCase()).toContain('document');
      });
    });

    describe('followUp6Months', () => {
      it('devrait créer un template de suivi', () => {
        const template = gmailTemplates.followUp6Months('Lucas Petit');
        
        expect(template.subject.toLowerCase()).toContain('suivi');
        expect(template.content).toContain('Lucas Petit');
      });

      it('devrait mentionner les 6 mois', () => {
        const template = gmailTemplates.followUp6Months('Test');
        expect(template.content).toContain('6 mois');
      });

      it('devrait avoir un sujet approprié', () => {
        const template = gmailTemplates.followUp6Months('Test');
        expect(template.subject.length).toBeGreaterThan(0);
      });
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

    it('devrait avoir un destinataire valide', () => {
      const email = prepareWelcomeEmail(
        'user@domain.com',
        'Test',
        'Test'
      );
      expect(email.to).toContain('user@domain.com');
    });

    it('devrait utiliser le template welcome', () => {
      const email = prepareWelcomeEmail(
        'test@test.com',
        'Marie',
        'Approfondi'
      );
      expect(email.subject).toContain('Bienvenue');
    });

    it('devrait inclure le nom dans le contenu', () => {
      const email = prepareWelcomeEmail(
        'test@test.com',
        'Pierre Martin',
        'Test'
      );
      expect(email.content).toContain('Pierre Martin');
    });

    it('devrait inclure le forfait dans le contenu', () => {
      const email = prepareWelcomeEmail(
        'test@test.com',
        'Test',
        'Stratégique'
      );
      expect(email.content).toContain('Stratégique');
    });
  });

  describe('template structure', () => {
    it('tous les templates devraient avoir subject et content', () => {
      const templates = [
        gmailTemplates.welcome('Test', 'Test'),
        gmailTemplates.appointmentConfirmation('Test', '01/01/2026', '09:00', 'Test', 'Test'),
        gmailTemplates.appointmentReminder('Test', '01/01/2026', '09:00', 'Test'),
        gmailTemplates.bilanCompleted('Test'),
        gmailTemplates.followUp6Months('Test'),
      ];

      templates.forEach(template => {
        expect(template.subject).toBeDefined();
        expect(template.content).toBeDefined();
        expect(typeof template.subject).toBe('string');
        expect(typeof template.content).toBe('string');
      });
    });

    it('tous les templates devraient avoir un contenu non vide', () => {
      const templates = [
        gmailTemplates.welcome('Test', 'Test'),
        gmailTemplates.appointmentConfirmation('Test', '01/01/2026', '09:00', 'Test', 'Test'),
        gmailTemplates.appointmentReminder('Test', '01/01/2026', '09:00', 'Test'),
        gmailTemplates.bilanCompleted('Test'),
        gmailTemplates.followUp6Months('Test'),
      ];

      templates.forEach(template => {
        expect(template.subject.length).toBeGreaterThan(0);
        expect(template.content.length).toBeGreaterThan(0);
      });
    });
  });

  describe('edge cases', () => {
    it('devrait gérer des noms avec caractères spéciaux', () => {
      const template = gmailTemplates.welcome('Jean-Pierre Éléonore', 'Test');
      expect(template.content).toContain('Jean-Pierre Éléonore');
    });

    it('devrait gérer des noms vides', () => {
      const template = gmailTemplates.welcome('', 'Test');
      expect(template.content).toBeDefined();
    });

    it('devrait gérer des forfaits vides', () => {
      const template = gmailTemplates.welcome('Test', '');
      expect(template.content).toBeDefined();
    });
  });
});
