/**
 * Tests du composant NotificationManager
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

// Mock du service de notifications
vi.mock('../services/pushNotificationService', () => ({
  isNotificationSupported: vi.fn(() => true),
  getPermissionStatus: vi.fn(() => 'default'),
  requestPermission: vi.fn().mockResolvedValue('granted'),
  sendLocalNotification: vi.fn().mockResolvedValue(true),
  notifications: {
    bienvenue: vi.fn(() => ({ title: 'Bienvenue', body: 'Test' })),
    continuerBilan: vi.fn(() => ({ title: 'Continuez', body: 'Test' })),
    bilanTermine: vi.fn(() => ({ title: 'Terminé', body: 'Test' })),
  },
}));

// Mock du ToastProvider
vi.mock('./ToastProvider', () => ({
  useToast: vi.fn(() => ({
    showSuccess: vi.fn(),
    showInfo: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
  })),
}));

// Mock localStorage
let store: Record<string, string> = {};
vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { store[key] = value; });
vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete store[key]; });

describe('NotificationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = {};
  });

  describe('module import', () => {
    it('devrait pouvoir importer le composant', async () => {
      const module = await import('./NotificationManager');
      expect(module).toBeDefined();
      expect(module.NotificationManager).toBeDefined();
    });

    it('devrait exporter useNotifications', async () => {
      const module = await import('./NotificationManager');
      expect(module.useNotifications).toBeDefined();
      expect(typeof module.useNotifications).toBe('function');
    });

    it('devrait exporter un composant par défaut', async () => {
      const module = await import('./NotificationManager');
      expect(module.default).toBeDefined();
      expect(module.default).toBe(module.NotificationManager);
    });
  });

  describe('component rendering', () => {
    it('devrait accepter les props userName et onPermissionChange', async () => {
      const { NotificationManager } = await import('./NotificationManager');
      const onPermissionChange = vi.fn();
      
      expect(() => {
        render(
          <NotificationManager 
            userName="Test User" 
            onPermissionChange={onPermissionChange}
          />
        );
      }).not.toThrow();
    });

    it('devrait ne rien afficher initialement (avant le délai)', async () => {
      const { NotificationManager } = await import('./NotificationManager');
      const { container } = render(<NotificationManager />);
      
      expect(container.firstChild).toBeNull();
    });

    it('devrait accepter userName vide', async () => {
      const { NotificationManager } = await import('./NotificationManager');
      
      expect(() => {
        render(<NotificationManager userName="" />);
      }).not.toThrow();
    });

    it('devrait accepter userName avec caractères spéciaux', async () => {
      const { NotificationManager } = await import('./NotificationManager');
      
      expect(() => {
        render(<NotificationManager userName="Jean-Pierre Éléonore" />);
      }).not.toThrow();
    });

    it('devrait accepter onPermissionChange optionnel', async () => {
      const { NotificationManager } = await import('./NotificationManager');
      
      expect(() => {
        render(<NotificationManager userName="Test" />);
      }).not.toThrow();
    });
  });

  describe('permission handling', () => {
    it('devrait vérifier le support des notifications', async () => {
      const pushService = await import('../services/pushNotificationService');
      const { NotificationManager } = await import('./NotificationManager');
      
      render(<NotificationManager userName="Test" />);
      
      await waitFor(() => {
        expect(pushService.isNotificationSupported).toHaveBeenCalled();
      });
    });

    it('devrait vérifier le statut de permission', async () => {
      const pushService = await import('../services/pushNotificationService');
      const { NotificationManager } = await import('./NotificationManager');
      
      render(<NotificationManager userName="Test" />);
      
      await waitFor(() => {
        expect(pushService.getPermissionStatus).toHaveBeenCalled();
      });
    });
  });
});

describe('useNotifications hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hook structure', () => {
    it('devrait retourner les propriétés attendues', async () => {
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(hookResult).toHaveProperty('permission');
      expect(hookResult).toHaveProperty('isSupported');
      expect(hookResult).toHaveProperty('isGranted');
      expect(hookResult).toHaveProperty('request');
      expect(hookResult).toHaveProperty('send');
      expect(hookResult).toHaveProperty('notifications');
    });

    it('devrait avoir request comme fonction', async () => {
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(typeof hookResult.request).toBe('function');
    });

    it('devrait avoir send comme fonction', async () => {
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(typeof hookResult.send).toBe('function');
    });
  });

  describe('hook values', () => {
    it('devrait retourner isSupported comme booléen', async () => {
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(typeof hookResult.isSupported).toBe('boolean');
    });

    it('devrait retourner isGranted comme booléen', async () => {
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(typeof hookResult.isGranted).toBe('boolean');
    });

    it('devrait retourner permission comme string', async () => {
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(typeof hookResult.permission).toBe('string');
    });

    it('devrait retourner notifications comme objet', async () => {
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(typeof hookResult.notifications).toBe('object');
    });
  });

  describe('hook functions', () => {
    it('devrait pouvoir appeler request sans erreur', async () => {
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      await expect(hookResult.request()).resolves.not.toThrow();
    });

    it('devrait pouvoir appeler send sans erreur', async () => {
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      await expect(hookResult.send({ title: 'Test', body: 'Test' })).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('devrait gérer le cas où les notifications ne sont pas supportées', async () => {
      const pushService = await import('../services/pushNotificationService');
      vi.mocked(pushService.isNotificationSupported).mockReturnValue(false);
      
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(hookResult.isSupported).toBe(false);
    });

    it('devrait gérer le cas où la permission est denied', async () => {
      const pushService = await import('../services/pushNotificationService');
      vi.mocked(pushService.getPermissionStatus).mockReturnValue('denied');
      
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(hookResult.isGranted).toBe(false);
    });

    it('devrait gérer le cas où la permission est granted', async () => {
      const pushService = await import('../services/pushNotificationService');
      vi.mocked(pushService.getPermissionStatus).mockReturnValue('granted');
      
      const { useNotifications } = await import('./NotificationManager');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useNotifications();
        return null;
      };
      
      render(<TestComponent />);
      
      expect(hookResult.isGranted).toBe(true);
    });
  });
});
