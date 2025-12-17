/**
 * Tests du composant Toast et ToastProvider
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastProvider';
import React from 'react';

// Composant de test pour utiliser le hook
const TestComponent: React.FC = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return (
    <div>
      <button onClick={() => showSuccess('Success message')}>Show Success</button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showInfo('Info message')}>Show Info</button>
      <button onClick={() => showWarning('Warning message')}>Show Warning</button>
    </div>
  );
};

describe('ToastProvider', () => {
  it('devrait rendre les enfants', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Child content</div>
      </ToastProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('devrait afficher un toast de succès', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('devrait afficher un toast d\'erreur', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Error'));

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('devrait afficher un toast d\'info', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Info'));

    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  it('devrait afficher un toast d\'avertissement', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Warning'));

    await waitFor(() => {
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });
  });
});

describe('useToast hook', () => {
  it('devrait fonctionner dans le provider', () => {
    const TestInsideProvider = () => {
      const toast = useToast();
      return <div>Hook works: {toast ? 'yes' : 'no'}</div>;
    };

    render(
      <ToastProvider>
        <TestInsideProvider />
      </ToastProvider>
    );
    
    expect(screen.getByText('Hook works: yes')).toBeInTheDocument();
  });
});
