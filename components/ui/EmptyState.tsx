'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  children,
}) => (
  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
    <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center mb-3 text-text-muted">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
    <p className="text-sm text-text-muted max-w-sm mb-4">{description}</p>
    {children}
    {actionLabel && (onAction || actionHref) && (
      <div className="mt-4">
        {actionHref ? (
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </div>
    )}
  </div>
);
