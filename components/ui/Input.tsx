import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'default' | 'compact';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  size = 'default',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isCompact = size === 'compact';
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block font-medium text-text-primary',
            isCompact ? 'text-xs mb-0.5' : 'text-sm mb-1'
          )}
        >
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus-visible:ring-2 transition-all',
          isCompact ? 'px-3 py-2 text-sm min-h-[36px]' : 'px-4 py-2.5 min-h-[44px]',
          error
            ? 'border-danger focus:ring-danger focus:border-danger'
            : 'border-border focus:ring-primary/40 focus:border-transparent focus-visible:ring-2',
          className
        )}
        {...props}
      />
      {error && (
        <p className={cn('mt-0.5 text-danger', isCompact ? 'text-xs' : 'text-sm')}>{error}</p>
      )}
      {helperText && !error && (
        <p className={cn('mt-0.5 text-text-muted', isCompact ? 'text-xs' : 'text-sm')}>{helperText}</p>
      )}
    </div>
  );
};
