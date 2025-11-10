import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../utils/testUtils';
import { ToastProvider, useToast } from '../../../components/Toast';
import { act } from '@testing-library/react';

const TestComponent = () => {
  const { showToast } = useToast();
  
  return (
    <button onClick={() => showToast('Test message', 'success')}>
      Show Toast
    </button>
  );
};

describe('Toast', () => {
  it('should render toast provider', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    expect(screen.getByText('Show Toast')).toBeInTheDocument();
  });

  it('should show toast when called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Toast');
    
    await act(async () => {
      button.click();
    });
    
    // Toast should appear
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});

