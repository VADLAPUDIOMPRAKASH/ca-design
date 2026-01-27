'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Mail,
  Settings,
  ChevronRight,
  UserPlus,
  List,
  FileText,
  Send,
  Clock,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  icon: React.ElementType;
  href: string;
  submenu?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/',
  },
  {
    label: 'Clients',
    icon: Users,
    href: '/clients',
    submenu: [
      { label: 'Add New Client', href: '/clients/add' },
      { label: 'Client List', href: '/clients' },
    ],
  },
  {
    label: 'Email Management',
    icon: Mail,
    href: '/emails',
    submenu: [
      { label: 'Templates', href: '/emails/templates' },
      { label: 'Send Email', href: '/emails/send' },
      { label: 'Scheduled Emails', href: '/emails/scheduled' },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 z-40 transition-transform duration-300',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
            <h1 className="text-xl font-bold text-primary">CA Platform</h1>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isItemActive = isActive(item.href);
              const isSubmenuOpen = openSubmenus[item.label];

              return (
                <div key={item.label}>
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                          isItemActive
                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight
                          size={16}
                          className={cn(
                            'transition-transform',
                            isSubmenuOpen && 'rotate-90'
                          )}
                        />
                      </button>
                      {isSubmenuOpen && (
                        <div className="bg-gray-50">
                          {item.submenu?.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                  'block px-4 py-2.5 pl-12 text-sm transition-colors',
                                  isSubActive
                                    ? 'text-primary font-medium bg-primary/5'
                                    : 'text-gray-600 hover:bg-gray-100'
                                )}
                              >
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors',
                        isItemActive
                          ? 'bg-primary/10 text-primary border-r-2 border-primary'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
