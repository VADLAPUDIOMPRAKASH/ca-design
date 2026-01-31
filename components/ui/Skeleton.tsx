import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={cn('animate-pulse bg-gray-200 rounded', className)}
    aria-hidden="true"
  />
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-12 w-12 rounded-lg" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 7 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton
            key={j}
            className={cn(
              'h-10 flex-1',
              j === 0 && 'flex-[0.5]',
              j === cols - 1 && 'flex-[0.3]'
            )}
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonClientCard: React.FC = () => (
  <div className="bg-white rounded-card shadow-sm border border-gray-100 p-4">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);
