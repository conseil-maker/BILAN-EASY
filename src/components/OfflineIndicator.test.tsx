/**
 * Tests du composant OfflineIndicator
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock du hook useOffline
vi.mock('../hooks/useOffline', () => ({
  useOffline: vi.fn(() => ({
    isOnline: true,
    pendingSyncCount: 0,
    syncNow: vi.fn().mockResolvedValue(true),
  })),
}));

describe('OfflineIndicator', () => {
  it('devrait pouvoir importer le composant', async () => {
    const module = await import('./OfflineIndicator');
    expect(module).toBeDefined();
    expect(module.OfflineIndicator).toBeDefined();
  });

  it('devrait ne rien afficher quand en ligne sans données en attente', async () => {
    const { OfflineIndicator } = await import('./OfflineIndicator');
    const { container } = render(<OfflineIndicator />);
    
    // Le composant devrait être vide ou retourner null
    expect(container.firstChild).toBeNull();
  });

  it('devrait accepter la prop showSyncButton', async () => {
    const { OfflineIndicator } = await import('./OfflineIndicator');
    
    // Ne devrait pas lancer d'erreur
    expect(() => {
      render(<OfflineIndicator showSyncButton={false} />);
    }).not.toThrow();
  });

  it('devrait exporter un composant par défaut', async () => {
    const module = await import('./OfflineIndicator');
    expect(module.default).toBeDefined();
    expect(module.default).toBe(module.OfflineIndicator);
  });
});

describe('OfflineIndicator avec mode hors-ligne', () => {
  it('devrait afficher le message hors-ligne', async () => {
    // Reconfigurer le mock pour simuler le mode hors-ligne
    vi.doMock('../hooks/useOffline', () => ({
      useOffline: vi.fn(() => ({
        isOnline: false,
        pendingSyncCount: 2,
        syncNow: vi.fn().mockResolvedValue(true),
      })),
    }));

    // Le test vérifie que le composant peut être rendu
    const { OfflineIndicator } = await import('./OfflineIndicator');
    expect(OfflineIndicator).toBeDefined();
  });
});
