import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import PersonalizationStep from '../../../components/PersonalizationStep';
import * as geminiService from '../../../services/geminiService';

vi.mock('../../../services/geminiService');

describe('PersonalizationStep', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render personalization form', () => {
    render(<PersonalizationStep onComplete={mockOnComplete} />);
    
    expect(screen.getByText(/Hyper-Personnalisation/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Collez ici le texte de votre CV/i)).toBeInTheDocument();
  });

  it('should call onComplete when skip button is clicked', () => {
    render(<PersonalizationStep onComplete={mockOnComplete} />);
    
    // Use getByRole to find the button specifically
    const skipButton = screen.getByRole('button', { name: /Passer cette étape/i });
    fireEvent.click(skipButton);
    
    // Should be called immediately with null
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
    expect(mockOnComplete).toHaveBeenCalledWith(null);
  });

  it('should disable submit button when text is empty', () => {
    render(<PersonalizationStep onComplete={mockOnComplete} />);
    
    const submitButton = screen.getByText(/Personnaliser le bilan/i);
    
    // Button should be disabled when text is empty
    expect(submitButton).toBeDisabled();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});

