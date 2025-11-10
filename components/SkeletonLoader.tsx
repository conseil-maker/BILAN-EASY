import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  width?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  lines = 1, 
  width = '100%' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-200 rounded h-4 mb-2"
          style={{ width: i === lines - 1 ? width : '100%' }}
        />
      ))}
    </div>
  );
};

export const MessageSkeleton: React.FC = () => {
  return (
    <div className="flex gap-3 p-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  );
};

export const HistoryItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
        </div>
        <div className="h-10 bg-slate-200 rounded w-24" />
      </div>
    </div>
  );
};

