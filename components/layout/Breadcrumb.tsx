'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbMap: Record<string, string> = {
    'clients': 'Client Management',
    'add': 'Add New Client',
    'emails': 'Email Management',
    'inbox': 'Inbox',
    'templates': 'Templates',
    'send': 'Send Email',
    'scheduled': 'Scheduled Emails',
    'create': 'Create Template',
    'login': 'Create Login',
    'settings': 'Settings',
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      let label = breadcrumbMap[segment];
      if (!label && index > 0 && pathSegments[0] === 'clients' && /^\d+$/.test(segment)) {
        label = 'Client Details';
      }
      if (!label) label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, href };
    }),
  ];

  /* On mobile, show only last 2 segments or Home > Current */
  const displayCrumbs = breadcrumbs.length > 3
    ? [breadcrumbs[0], ...breadcrumbs.slice(-2)]
    : breadcrumbs;

  return (
    <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-text-muted overflow-x-auto overflow-y-hidden min-h-[24px] -mx-1 px-1" aria-label="Breadcrumb">
      {displayCrumbs.map((crumb, idx) => {
        const originalIndex = breadcrumbs.indexOf(crumb);
        const isFirst = originalIndex === 0;
        const isLast = originalIndex === breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.href}>
            {!isFirst && <ChevronRight size={14} className="shrink-0 text-text-muted/70" />}
            {isFirst ? (
              <Link href={crumb.href} className="hover:text-text-primary shrink-0 flex items-center">
                <Home size={16} />
              </Link>
            ) : isLast ? (
              <span className="text-text-primary font-medium truncate">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-text-primary truncate">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
