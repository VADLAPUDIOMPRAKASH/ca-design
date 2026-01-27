'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbMap: Record<string, string> = {
    'clients': 'Clients',
    'add': 'Add New Client',
    'emails': 'Email Management',
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
      return {
        label: breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href,
      };
    }),
  ];

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index === 0 ? (
            <Link href={crumb.href} className="hover:text-gray-900">
              <Home size={16} />
            </Link>
          ) : (
            <>
              <ChevronRight size={16} className="text-gray-400" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-gray-900">
                  {crumb.label}
                </Link>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
