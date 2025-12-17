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
  });

  describe('getUserProfile', () => {
    it('devrait être une fonction async', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.getUserProfile).toBe('function');
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
  });

  describe('updateProfile', () => {
    it('devrait être une fonction async', async () => {
      const { authService } = await import('./authService');
      expect(typeof authService.updateProfile).toBe('function');
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
  });
});
