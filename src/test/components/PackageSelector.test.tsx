import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/testUtils';
import PackageSelector from '../../../components/PackageSelector';
import { PACKAGES } from '../../../constants';

describe('PackageSelector', () => {
  const mockOnSelect = vi.fn();

  it('should render all packages', () => {
    render(<PackageSelector packages={PACKAGES} onSelect={mockOnSelect} />);
    
    expect(screen.getByText(/Choisissez Votre Parcours/i)).toBeInTheDocument();
    PACKAGES.forEach(pkg => {
      expect(screen.getByText(pkg.name)).toBeInTheDocument();
    });
  });

  it('should call onSelect when package is selected', () => {
    render(<PackageSelector packages={PACKAGES} onSelect={mockOnSelect} />);
    
    const buttons = screen.getAllByText(/Sélectionner ce Forfait/i);
    fireEvent.click(buttons[0]);
    
    expect(mockOnSelect).toHaveBeenCalledWith(PACKAGES[0]);
  });

  it('should show loading state when isLoading is true', () => {
    render(<PackageSelector packages={PACKAGES} onSelect={mockOnSelect} isLoading={true} />);
    
    const loadingButtons = screen.getAllByText(/Création en cours/i);
    expect(loadingButtons.length).toBeGreaterThan(0);
  });

  it('should disable buttons when loading', () => {
    render(<PackageSelector packages={PACKAGES} onSelect={mockOnSelect} isLoading={true} />);
    
    const buttons = screen.getAllByText(/Création en cours/i);
    buttons.forEach(button => {
      expect(button.closest('button')).toBeDisabled();
    });
  });
});

