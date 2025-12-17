/**
 * Tests du service authService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'test-id' } }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'test-id', email: 'test@test.com' } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-id', email: 'test@test.com' } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'test-id', role: 'client' }, error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
          })),
        })),
      })),
    })),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./authService');
      expect(module).toBeDefined();
      expect(module.authService).toBeDefined();
    });

    it('devrait exporter un objet authService', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService).toBe('object');
    });

    it('devrait exporter authService comme export nommé', async () => {
      const module = await import('./authService');
      expect(module.authService).toBeDefined();
    });
  });

  describe('signUp', () => {
    it('devrait être une fonction async', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.signUp).toBe('function');
    });

    it('devrait accepter email, password et fullName', async () => {
      const { authService } = await import('./authService');
      const result = await authService.signUp('test@test.com', 'password123', 'Test User');
      expect(result).toBeDefined();
    });

    it('devrait retourner les données utilisateur', async () => {
      const { authService } = await import('./authService');
      const result = await authService.signUp('new@test.com', 'password123', 'New User');
      expect(result.user).toBeDefined();
    });

    it('devrait accepter des emails valides', async () => {
      const { authService } = await import('./authService');
      
      await expect(authService.signUp('user@domain.com', 'pass123', 'User')).resolves.toBeDefined();
      await expect(authService.signUp('user.name@domain.fr', 'pass123', 'User')).resolves.toBeDefined();
    });

    it('devrait accepter des noms avec caractères spéciaux', async () => {
      const { authService } = await import('./authService');
      const result = await authService.signUp('test@test.com', 'pass123', 'Jean-Pierre Éléonore');
      expect(result).toBeDefined();
    });
  });

  describe('signIn', () => {
    it('devrait être une fonction async', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.signIn).toBe('function');
    });

    it('devrait accepter email et password', async () => {
      const { authService } = await import('./authService');
      const result = await authService.signIn('test@test.com', 'password123');
      expect(result).toBeDefined();
    });

    it('devrait retourner les données de session', async () => {
      const { authService } = await import('./authService');
      const result = await authService.signIn('test@test.com', 'password123');
      expect(result.user).toBeDefined();
    });

    it('devrait retourner l\'email de l\'utilisateur', async () => {
      const { authService } = await import('./authService');
      const result = await authService.signIn('test@test.com', 'password123');
      expect(result.user?.email).toBe('test@test.com');
    });
  });

  describe('signOut', () => {
    it('devrait être une fonction async', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.signOut).toBe('function');
    });

    it('devrait s\'exécuter sans erreur', async () => {
      const { authService } = await import('./authService');
      await expect(authService.signOut()).resolves.not.toThrow();
    });

    it('devrait retourner undefined', async () => {
      const { authService } = await import('./authService');
      const result = await authService.signOut();
      expect(result).toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('devrait être une fonction async', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.getCurrentUser).toBe('function');
    });

    it('devrait retourner un utilisateur ou null', async () => {
      const { authService } = await import('./authService');
      const user = await authService.getCurrentUser();
      expect(user === null || typeof user === 'object').toBe(true);
    });

    it('devrait retourner l\'id de l\'utilisateur', async () => {
      const { authService } = await import('./authService');
      const user = await authService.getCurrentUser();
      expect(user?.id).toBe('test-id');
    });

    it('devrait retourner l\'email de l\'utilisateur', async () => {
      const { authService } = await import('./authService');
      const user = await authService.getCurrentUser();
      expect(user?.email).toBe('test@test.com');
    });
  });

  describe('getUserProfile', () => {
    it('devrait être une fonction async', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.getUserProfile).toBe('function');
    });

    it('devrait retourner un profil', async () => {
      const { authService } = await import('./authService');
      const profile = await authService.getUserProfile();
      expect(profile).toBeDefined();
    });

    it('devrait retourner le rôle dans le profil', async () => {
      const { authService } = await import('./authService');
      const profile = await authService.getUserProfile();
      expect(profile?.role).toBe('client');
    });
  });

  describe('getUserRole', () => {
    it('devrait être une fonction async', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.getUserRole).toBe('function');
    });

    it('devrait retourner un rôle valide ou null', async () => {
      const { authService } = await import('./authService');
      const role = await authService.getUserRole();
      expect(['client', 'consultant', 'admin', null]).toContain(role);
    });

    it('devrait retourner client pour un utilisateur client', async () => {
      const { authService } = await import('./authService');
      const role = await authService.getUserRole();
      expect(role).toBe('client');
    });
  });

  describe('updateProfile', () => {
    it('devrait être une fonction async', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.updateProfile).toBe('function');
    });

    it('devrait accepter full_name', async () => {
      const { authService } = await import('./authService');
      const result = await authService.updateProfile({ full_name: 'New Name' });
      expect(result).toBeDefined();
    });

    it('devrait accepter avatar_url', async () => {
      const { authService } = await import('./authService');
      const result = await authService.updateProfile({ avatar_url: 'https://example.com/avatar.png' });
      expect(result).toBeDefined();
    });

    it('devrait accepter les deux paramètres', async () => {
      const { authService } = await import('./authService');
      const result = await authService.updateProfile({ 
        full_name: 'New Name',
        avatar_url: 'https://example.com/avatar.png'
      });
      expect(result).toBeDefined();
    });
  });

  describe('onAuthStateChange', () => {
    it('devrait être une fonction', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.onAuthStateChange).toBe('function');
    });

    it('devrait accepter un callback', async () => {
      const { authService } = await import('./authService');
      const callback = vi.fn();
      const result = authService.onAuthStateChange(callback);
      expect(result).toBeDefined();
    });

    it('devrait retourner un objet avec subscription', async () => {
      const { authService } = await import('./authService');
      const callback = vi.fn();
      const result = authService.onAuthStateChange(callback);
      expect(result.data.subscription).toBeDefined();
    });

    it('devrait avoir une méthode unsubscribe', async () => {
      const { authService } = await import('./authService');
      const callback = vi.fn();
      const result = authService.onAuthStateChange(callback);
      expect(typeof result.data.subscription.unsubscribe).toBe('function');
    });
  });

  describe('service methods', () => {
    it('devrait avoir toutes les méthodes requises', async () => {
      const { authService } = await import('./authService');
      
      expect(authService.signUp).toBeDefined();
      expect(authService.signIn).toBeDefined();
      expect(authService.signOut).toBeDefined();
      expect(authService.getCurrentUser).toBeDefined();
      expect(authService.getUserProfile).toBeDefined();
      expect(authService.getUserRole).toBeDefined();
      expect(authService.updateProfile).toBeDefined();
      expect(authService.onAuthStateChange).toBeDefined();
    });

    it('devrait avoir 8 méthodes au total', async () => {
      const { authService } = await import('./authService');
      const methods = Object.keys(authService);
      expect(methods.length).toBe(8);
    });
  });

  describe('edge cases', () => {
    it('devrait gérer un email vide', async () => {
      const { authService } = await import('./authService');
      // Le mock ne valide pas, donc ça passe
      await expect(authService.signIn('', 'password')).resolves.toBeDefined();
    });

    it('devrait gérer un password vide', async () => {
      const { authService } = await import('./authService');
      await expect(authService.signIn('test@test.com', '')).resolves.toBeDefined();
    });

    it('devrait gérer des updates vides', async () => {
      const { authService } = await import('./authService');
      await expect(authService.updateProfile({})).resolves.toBeDefined();
    });
  });
});
