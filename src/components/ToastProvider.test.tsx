/**
 * Tests du composant ToastProvider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./ToastProvider');
      expect(module).toBeDefined();
    });

    it('devrait exporter ToastProvider', async () => {
      const { ToastProvider } = await import('./ToastProvider');
      expect(ToastProvider).toBeDefined();
    });

    it('devrait exporter useToast', async () => {
      const { useToast } = await import('./ToastProvider');
      expect(useToast).toBeDefined();
      expect(typeof useToast).toBe('function');
    });
  });

  describe('ToastProvider rendering', () => {
    it('devrait rendre les enfants', async () => {
      const { ToastProvider } = await import('./ToastProvider');
      
      render(
        <ToastProvider>
          <div data-testid="child">Test Child</div>
        </ToastProvider>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('devrait accepter plusieurs enfants', async () => {
      const { ToastProvider } = await import('./ToastProvider');
      
      render(
        <ToastProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ToastProvider>
      );
      
      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });

  describe('useToast hook', () => {
    it('devrait retourner les fonctions de toast', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return null;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(hookResult).toHaveProperty('showSuccess');
      expect(hookResult).toHaveProperty('showError');
      expect(hookResult).toHaveProperty('showInfo');
      expect(hookResult).toHaveProperty('showWarning');
    });

    it('devrait avoir showSuccess comme fonction', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return null;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(typeof hookResult.showSuccess).toBe('function');
    });

    it('devrait avoir showError comme fonction', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return null;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(typeof hookResult.showError).toBe('function');
    });

    it('devrait avoir showInfo comme fonction', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return null;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(typeof hookResult.showInfo).toBe('function');
    });

    it('devrait avoir showWarning comme fonction', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return null;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(typeof hookResult.showWarning).toBe('function');
    });
  });

  describe('toast functions', () => {
    it('devrait pouvoir appeler showSuccess sans erreur', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return null;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(() => hookResult.showSuccess('Test')).not.toThrow();
    });

    it('devrait pouvoir appeler showError sans erreur', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return null;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(() => hookResult.showError('Test')).not.toThrow();
    });

    it('devrait pouvoir appeler showInfo sans erreur', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return null;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(() => hookResult.showInfo('Test')).not.toThrow();
    });

    it('devrait pouvoir appeler showWarning sans erreur', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return null;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(() => hookResult.showWarning('Test')).not.toThrow();
    });
  });

  describe('context error', () => {
    it('devrait vérifier que useToast est une fonction', async () => {
      const { useToast } = await import('./ToastProvider');
      
      // useToast devrait être une fonction
      expect(typeof useToast).toBe('function');
    });

    it('devrait avoir un provider fonctionnel', async () => {
      const { ToastProvider, useToast } = await import('./ToastProvider');
      
      let hookResult: any;
      const TestComponent = () => {
        hookResult = useToast();
        return <div>Test</div>;
      };
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      // Le hook devrait fonctionner dans le provider
      expect(hookResult).toBeDefined();
      expect(hookResult.showSuccess).toBeDefined();
    });
  });
});
