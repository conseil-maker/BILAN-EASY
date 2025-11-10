import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import WelcomeScreen from '../../../components/WelcomeScreen';
import * as historyService from '../../../services/historyService';

vi.mock('../../../services/historyService');

describe('WelcomeScreen', () => {
  const mockOnStart = vi.fn();
  const mockOnShowHistory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (historyService.getAssessmentHistory as any).mockReturnValue([]);
  });

  it('should render welcome screen', () => {
    render(<WelcomeScreen onStart={mockOnStart} onShowHistory={mockOnShowHistory} />);
    
    expect(screen.getByText(/Bilan de Compétences/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Entrez votre prénom/i)).toBeInTheDocument();
  });

  it('should call onStart when form is submitted with name', () => {
    render(<WelcomeScreen onStart={mockOnStart} onShowHistory={mockOnShowHistory} />);
    
    const input = screen.getByPlaceholderText(/Entrez votre prénom/i);
    const button = screen.getByRole('button', { name: /Commencer/i });
    
    fireEvent.change(input, { target: { value: 'John Doe' } });
    fireEvent.click(button);
    
    expect(mockOnStart).toHaveBeenCalledWith('John Doe');
  });

  it('should not call onStart with empty name', () => {
    render(<WelcomeScreen onStart={mockOnStart} onShowHistory={mockOnShowHistory} />);
    
    const button = screen.getByRole('button', { name: /Commencer/i });
    fireEvent.click(button);
    
    expect(mockOnStart).not.toHaveBeenCalled();
  });

  it('should show history button when history exists', async () => {
    (historyService.getAssessmentHistory as any).mockReturnValue([
      { id: '1', userName: 'Test', packageName: 'Découverte' }
    ]);
    
    render(<WelcomeScreen onStart={mockOnStart} onShowHistory={mockOnShowHistory} />);
    
    // Wait for useEffect to run
    await waitFor(() => {
      const historyButton = screen.queryByText(/Consulter l'historique/i);
      expect(historyButton).toBeInTheDocument();
    });
  });

  it('should call onShowHistory when history button is clicked', async () => {
    (historyService.getAssessmentHistory as any).mockReturnValue([
      { id: '1', userName: 'Test', packageName: 'Découverte' }
    ]);
    
    render(<WelcomeScreen onStart={mockOnStart} onShowHistory={mockOnShowHistory} />);
    
    await waitFor(() => {
      const historyButton = screen.getByText(/Consulter l'historique/i);
      fireEvent.click(historyButton);
      expect(mockOnShowHistory).toHaveBeenCalled();
    });
  });
});

