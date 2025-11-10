import { describe, it, expect } from 'vitest';
import { render } from '../utils/testUtils';
import { MessageSkeleton, HistoryItemSkeleton, SkeletonLoader } from '../../../components/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('should render MessageSkeleton', () => {
    const { container } = render(<MessageSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render HistoryItemSkeleton', () => {
    const { container } = render(<HistoryItemSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render SkeletonLoader with custom props', () => {
    const { container } = render(<SkeletonLoader lines={3} width="50%" />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });
});

