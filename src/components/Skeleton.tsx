import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
  );
};

export const HeroSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 lg:py-0">
      <div className="space-y-8">
        <Skeleton className="h-10 w-48 rounded-full" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full max-w-md" />
          <Skeleton className="h-16 w-3/4 max-w-sm" />
        </div>
        <Skeleton className="h-24 w-full max-w-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-14 w-40 rounded-xl" />
          <Skeleton className="h-14 w-40 rounded-xl" />
        </div>
      </div>
      <div className="hidden lg:flex justify-center">
        <Skeleton className="w-[400px] h-[400px] rounded-full" />
      </div>
    </div>
  );
};
