import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export type { CardProps };

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    none: '',
  };
  
  return (
    <div className={cn(
      'bg-surface rounded-card shadow-sm border-border',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};
