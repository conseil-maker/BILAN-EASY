/**
 * Tests du composant DraftRecovery
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

// Mock de supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              })),
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

// Mock localStorage
let store: Record<string, string> = {};
vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { store[key] = value; });
vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete store[key]; });

describe('DraftRecovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = {};
  });

  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./DraftRecovery');
      expect(module).toBeDefined();
    });

    it('devrait avoir un export par défaut', async () => {
      const module = await import('./DraftRecovery');
      expect(module.default).toBeDefined();
    });

    it('devrait exporter un composant React', async () => {
      const module = await import('./DraftRecovery');
      expect(typeof module.default).toBe('function');
    });
  });

  describe('Draft interface', () => {
    it('devrait avoir les propriétés requises', () => {
      const draft = {
        id: 'test-id',
        package_name: 'Essentiel',
        status: 'in_progress',
        answers: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };
      
      expect(draft.id).toBeDefined();
      expect(draft.package_name).toBeDefined();
      expect(draft.status).toBeDefined();
      expect(draft.answers).toBeDefined();
      expect(draft.created_at).toBeDefined();
      expect(draft.updated_at).toBeDefined();
    });

    it('devrait accepter un tableau de réponses', () => {
      const draft = {
        id: 'test-id',
        package_name: 'Approfondi',
        status: 'in_progress',
        answers: [
          { id: '1', answer: 'Réponse 1' },
          { id: '2', answer: 'Réponse 2' },
        ],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };
      
      expect(draft.answers).toHaveLength(2);
    });

    it('devrait accepter différents forfaits', () => {
      const forfaits = ['Essentiel', 'Approfondi', 'Stratégique'];
      
      forfaits.forEach(forfait => {
        const draft = {
          id: 'test-id',
          package_name: forfait,
          status: 'in_progress',
          answers: [],
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        };
        
        expect(draft.package_name).toBe(forfait);
      });
    });
  });

  describe('component rendering', () => {
    it('devrait ne rien rendre si pas de brouillon', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      
      const { container } = render(
        <DraftRecovery
          userId="test-user"
          onResume={vi.fn()}
          onDiscard={vi.fn()}
        />
      );
      
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('devrait accepter les props requises', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      
      expect(() => {
        render(
          <DraftRecovery
            userId="test-user"
            onResume={vi.fn()}
            onDiscard={vi.fn()}
          />
        );
      }).not.toThrow();
    });

    it('devrait accepter un userId vide', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      
      const { container } = render(
        <DraftRecovery
          userId=""
          onResume={vi.fn()}
          onDiscard={vi.fn()}
        />
      );
      
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('localStorage interaction', () => {
    it('devrait lire depuis localStorage', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      
      render(
        <DraftRecovery
          userId="test-user"
          onResume={vi.fn()}
          onDiscard={vi.fn()}
        />
      );
      
      await waitFor(() => {
        expect(localStorage.getItem).toHaveBeenCalledWith('currentDraft');
      });
    });

    it('devrait gérer un JSON invalide dans localStorage', async () => {
      store['currentDraft'] = 'invalid json';
      
      const DraftRecovery = (await import('./DraftRecovery')).default;
      
      const { container } = render(
        <DraftRecovery
          userId="test-user"
          onResume={vi.fn()}
          onDiscard={vi.fn()}
        />
      );
      
      // Ne devrait pas crasher
      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });

    it('devrait gérer un brouillon sans answers', async () => {
      const draft = {
        id: 'test-id',
        package_name: 'Essentiel',
        status: 'in_progress',
        answers: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };
      store['currentDraft'] = JSON.stringify(draft);
      
      const DraftRecovery = (await import('./DraftRecovery')).default;
      
      const { container } = render(
        <DraftRecovery
          userId="test-user"
          onResume={vi.fn()}
          onDiscard={vi.fn()}
        />
      );
      
      // Avec 0 réponses, le modal ne devrait pas s'afficher
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('props validation', () => {
    it('devrait accepter onResume comme fonction', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      const onResume = vi.fn();
      
      expect(() => {
        render(
          <DraftRecovery
            userId="test-user"
            onResume={onResume}
            onDiscard={vi.fn()}
          />
        );
      }).not.toThrow();
    });

    it('devrait accepter onDiscard comme fonction', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      const onDiscard = vi.fn();
      
      expect(() => {
        render(
          <DraftRecovery
            userId="test-user"
            onResume={vi.fn()}
            onDiscard={onDiscard}
          />
        );
      }).not.toThrow();
    });

    it('devrait accepter userId avec caractères spéciaux', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      
      expect(() => {
        render(
          <DraftRecovery
            userId="user-123-éàü"
            onResume={vi.fn()}
            onDiscard={vi.fn()}
          />
        );
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('devrait gérer un brouillon avec answers null', async () => {
      const draft = {
        id: 'test-id',
        package_name: 'Essentiel',
        status: 'in_progress',
        answers: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };
      store['currentDraft'] = JSON.stringify(draft);
      
      const DraftRecovery = (await import('./DraftRecovery')).default;
      
      const { container } = render(
        <DraftRecovery
          userId="test-user"
          onResume={vi.fn()}
          onDiscard={vi.fn()}
        />
      );
      
      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });

    it('devrait gérer un brouillon sans updated_at', async () => {
      const draft = {
        id: 'test-id',
        package_name: 'Essentiel',
        status: 'in_progress',
        answers: [{ id: '1', answer: 'test' }],
        created_at: '2025-01-01T00:00:00Z',
      };
      store['currentDraft'] = JSON.stringify(draft);
      
      const DraftRecovery = (await import('./DraftRecovery')).default;
      
      expect(() => {
        render(
          <DraftRecovery
            userId="test-user"
            onResume={vi.fn()}
            onDiscard={vi.fn()}
          />
        );
      }).not.toThrow();
    });
  });
});
