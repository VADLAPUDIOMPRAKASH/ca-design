'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Settings, Search } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

interface HeaderProps {
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed = false }) => {
  const leftOffset = isSidebarCollapsed ? 'lg:left-16' : 'lg:left-60';

  return (
    <header className={`h-12 sm:h-14 bg-surface border-b border-border fixed top-0 left-0 ${leftOffset} right-0 z-30 flex items-center justify-between gap-2 px-3 sm:px-4 lg:px-5 transition-[left] duration-300`}>
      {/* Breadcrumb - dynamic based on route */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <Breadcrumb />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Search - min 44px for touch, hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-subtle rounded-lg border border-border min-w-[120px] lg:min-w-[160px]">
          <Search size={16} className="text-text-muted shrink-0" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search clients, templates..."
            className="bg-transparent border-none outline-none text-sm w-full focus:ring-0"
            aria-label="Search"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-surface-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="View notifications (2 unread)"
        >
          <Bell size={18} className="text-text-muted shrink-0" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" aria-hidden="true"></span>
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-surface-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Go to settings"
        >
          <Settings size={18} className="text-text-muted shrink-0" />
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-border shrink-0" role="img" aria-label="User profile: John Doe, CA">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium text-xs shrink-0">
            JD
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-text-primary">John Doe</p>
            <p className="text-xs text-text-muted">CA</p>
          </div>
        </div>
      </div>
    </header>
  );
};
