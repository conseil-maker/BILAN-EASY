import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/testUtils';
import HistoryScreen from '../../../components/HistoryScreen';

// Mock useApi hook
vi.mock('../../../services/apiClient', () => ({
  useApi: () => ({
    getAssessments: vi.fn().mockResolvedValue({
      data: [],
      pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
    }),
  }),
}));

describe('HistoryScreen', () => {
  const mockOnViewRecord = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render history screen', () => {
    render(<HistoryScreen onViewRecord={mockOnViewRecord} onBack={mockOnBack} />);
    
    expect(screen.getByText(/Historique des Bilans/i)).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<HistoryScreen onViewRecord={mockOnViewRecord} onBack={mockOnBack} />);
    
    // Loading skeleton should be visible initially
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

