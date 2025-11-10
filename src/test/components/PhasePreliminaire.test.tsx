import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/testUtils';
import PhasePreliminaire from '../../../components/PhasePreliminaire';
import { PACKAGES } from '../../../constants';

describe('PhasePreliminaire', () => {
  const mockOnConfirm = vi.fn();
  const mockOnGoBack = vi.fn();
  const mockSetCoachingStyle = vi.fn();

  it('should render phase information', () => {
    render(
      <PhasePreliminaire
        pkg={PACKAGES[0]}
        userName="Test User"
        onConfirm={mockOnConfirm}
        onGoBack={mockOnGoBack}
        coachingStyle="collaborative"
        setCoachingStyle={mockSetCoachingStyle}
      />
    );

    expect(screen.getByText(/Prêt à commencer, Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Choisissez votre style de coaching/i)).toBeInTheDocument();
  });

  it('should call onConfirm when button is clicked', () => {
    render(
      <PhasePreliminaire
        pkg={PACKAGES[0]}
        userName="Test User"
        onConfirm={mockOnConfirm}
        onGoBack={mockOnGoBack}
        coachingStyle="collaborative"
        setCoachingStyle={mockSetCoachingStyle}
      />
    );

    const button = screen.getByText(/Commencer le Bilan/i);
    fireEvent.click(button);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should call setCoachingStyle when style is selected', () => {
    render(
      <PhasePreliminaire
        pkg={PACKAGES[0]}
        userName="Test User"
        onConfirm={mockOnConfirm}
        onGoBack={mockOnGoBack}
        coachingStyle="collaborative"
        setCoachingStyle={mockSetCoachingStyle}
      />
    );

    const analyticButton = screen.getByText(/Analytique/i);
    fireEvent.click(analyticButton);

    expect(mockSetCoachingStyle).toHaveBeenCalledWith('analytic');
  });
});

