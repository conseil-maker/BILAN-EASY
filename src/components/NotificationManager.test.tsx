/**
 * Tests du composant NotificationManager
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Mock du service de notifications
vi.mock('../services/pushNotificationService', () => ({
  isNotificationSupported: vi.fn(() => true),
  getPermissionStatus: vi.fn(() => 'default'),
  requestPermission: vi.fn().mockResolvedValue('granted'),
  sendLocalNotification: vi.fn(),
  notifications: {
    bienvenue: vi.fn(() => ({ title: 'Bienvenue', body: 'Test' })),
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

describe('NotificationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('devrait accepter les props userName et onPermissionChange', async () => {
    const { NotificationManager } = await import('./NotificationManager');
    const onPermissionChange = vi.fn();
    
    // Ne devrait pas lancer d'erreur
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
    
    // Le composant devrait être vide initialement
    expect(container.firstChild).toBeNull();
  });
});

describe('useNotifications hook', () => {
  it('devrait retourner les propriétés attendues', async () => {
    const { useNotifications } = await import('./NotificationManager');
    
    // Simuler l'utilisation du hook dans un composant
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
