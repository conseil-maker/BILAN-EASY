/**
 * Tests du composant OfflineIndicator
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock du hook useOffline
const mockSyncNow = vi.fn().mockResolvedValue(true);
let mockIsOnline = true;
let mockPendingSyncCount = 0;

vi.mock('../hooks/useOffline', () => ({
  useOffline: () => ({
    isOnline: mockIsOnline,
    pendingSyncCount: mockPendingSyncCount,
    syncNow: mockSyncNow,
  }),
}));

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOnline = true;
    mockPendingSyncCount = 0;
  });

  describe('module import', () => {
    it('devrait pouvoir importer le composant', async () => {
      const module = await import('./OfflineIndicator');
      expect(module).toBeDefined();
      expect(module.OfflineIndicator).toBeDefined();
    });

    it('devrait exporter un composant par défaut', async () => {
      const module = await import('./OfflineIndicator');
      expect(module.default).toBeDefined();
      expect(module.default).toBe(module.OfflineIndicator);
    });

    it('devrait être un composant React valide', async () => {
      const { OfflineIndicator } = await import('./OfflineIndicator');
      expect(typeof OfflineIndicator).toBe('function');
    });
  });

  describe('rendu de base', () => {
    it('devrait ne rien afficher quand en ligne sans données en attente', async () => {
      mockIsOnline = true;
      mockPendingSyncCount = 0;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      const { container } = render(<OfflineIndicator />);
      
      expect(container.firstChild).toBeNull();
    });

    it('devrait accepter la prop showSyncButton', async () => {
      const { OfflineIndicator } = await import('./OfflineIndicator');
      
      expect(() => {
        render(<OfflineIndicator showSyncButton={false} />);
      }).not.toThrow();
    });

    it('devrait accepter showSyncButton=true', async () => {
      const { OfflineIndicator } = await import('./OfflineIndicator');
      
      expect(() => {
        render(<OfflineIndicator showSyncButton={true} />);
      }).not.toThrow();
    });

    it('devrait avoir showSyncButton=true par défaut', async () => {
      const { OfflineIndicator } = await import('./OfflineIndicator');
      
      expect(() => {
        render(<OfflineIndicator />);
      }).not.toThrow();
    });
  });

  describe('mode hors-ligne', () => {
    it('devrait afficher la bannière hors-ligne', async () => {
      mockIsOnline = false;
      mockPendingSyncCount = 0;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator />);
      
      expect(screen.getByText('Mode hors-ligne')).toBeInTheDocument();
    });

    it('devrait afficher le message de sauvegarde locale', async () => {
      mockIsOnline = false;
      mockPendingSyncCount = 0;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator />);
      
      expect(screen.getByText('Vos données sont sauvegardées localement')).toBeInTheDocument();
    });

    it('devrait afficher le nombre d\'éléments en attente', async () => {
      mockIsOnline = false;
      mockPendingSyncCount = 3;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator />);
      
      expect(screen.getByText('3 en attente')).toBeInTheDocument();
    });

    it('devrait ne pas afficher le compteur si 0 en attente', async () => {
      mockIsOnline = false;
      mockPendingSyncCount = 0;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator />);
      
      expect(screen.queryByText(/en attente/)).not.toBeInTheDocument();
    });
  });

  describe('bouton de synchronisation', () => {
    it('devrait afficher le bouton sync quand en ligne avec données en attente', async () => {
      mockIsOnline = true;
      mockPendingSyncCount = 2;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator showSyncButton={true} />);
      
      expect(screen.getByText(/Synchroniser/)).toBeInTheDocument();
    });

    it('devrait afficher le nombre dans le bouton sync', async () => {
      mockIsOnline = true;
      mockPendingSyncCount = 5;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator showSyncButton={true} />);
      
      expect(screen.getByText(/Synchroniser \(5\)/)).toBeInTheDocument();
    });

    it('devrait ne pas afficher le bouton si showSyncButton=false', async () => {
      mockIsOnline = true;
      mockPendingSyncCount = 2;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator showSyncButton={false} />);
      
      expect(screen.queryByText(/Synchroniser/)).not.toBeInTheDocument();
    });

    it('devrait appeler syncNow au clic', async () => {
      mockIsOnline = true;
      mockPendingSyncCount = 2;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator showSyncButton={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockSyncNow).toHaveBeenCalled();
    });
  });

  describe('styles et animations', () => {
    it('devrait inclure les styles d\'animation', async () => {
      mockIsOnline = false;
      mockPendingSyncCount = 0;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      const { container } = render(<OfflineIndicator />);
      
      const styleElement = container.querySelector('style');
      expect(styleElement).toBeInTheDocument();
    });

    it('devrait avoir la classe animate-pulse sur l\'indicateur', async () => {
      mockIsOnline = false;
      mockPendingSyncCount = 0;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      const { container } = render(<OfflineIndicator />);
      
      const pulseElement = container.querySelector('.animate-pulse');
      expect(pulseElement).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('devrait gérer pendingSyncCount = 1', async () => {
      mockIsOnline = false;
      mockPendingSyncCount = 1;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator />);
      
      expect(screen.getByText('1 en attente')).toBeInTheDocument();
    });

    it('devrait gérer un grand nombre en attente', async () => {
      mockIsOnline = false;
      mockPendingSyncCount = 999;
      
      const { OfflineIndicator } = await import('./OfflineIndicator');
      render(<OfflineIndicator />);
      
      expect(screen.getByText('999 en attente')).toBeInTheDocument();
    });
  });
});
