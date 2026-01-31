'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Mail,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

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
      { label: 'Inbox', href: '/emails/inbox' },
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

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggle,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  // Auto-expand submenu for active section on load (only when expanded)
  useEffect(() => {
    if (isCollapsed) return;
    const activeItem = menuItems.find((item) => {
      if (item.href === '/') return pathname === '/';
      return pathname.startsWith(item.href);
    });
    if (activeItem?.submenu) {
      setOpenSubmenus((prev) => ({ ...prev, [activeItem.label]: true }));
    }
  }, [pathname, isCollapsed]);

  const toggleSubmenu = (label: string) => {
    if (isCollapsed) return;
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
      {/* Mobile menu button - min 44px touch target */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-surface shadow-md hover:bg-surface-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-surface border-r border-border z-40 transition-all duration-300',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-60 lg:w-16' : 'w-60 lg:w-60'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            'h-12 flex items-center border-b border-border transition-all duration-300',
            isCollapsed ? 'justify-center px-0' : 'justify-center px-3'
          )}>
            {isCollapsed ? (
              <LayoutDashboard size={20} className="text-primary shrink-0" />
            ) : (
              <h1 className="text-base font-bold text-primary whitespace-nowrap">CA Platform</h1>
            )}
          </div>

          {/* Collapse toggle - between logo and menu */}
          {onToggle && (
            <div className="hidden lg:block border-b border-border">
              <button
                onClick={onToggle}
                className={cn(
                  'w-full flex items-center gap-1.5 py-2 transition-colors text-text-muted hover:bg-surface-subtle hover:text-text-primary',
                  isCollapsed ? 'justify-center px-0' : 'px-3'
                )}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight size={16} className="shrink-0" />
                ) : (
                  <>
                    <ChevronLeft size={16} className="shrink-0" />
                    <span className="text-xs font-medium">Collapse</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-2 overflow-x-hidden">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isItemActive = isActive(item.href);
              const isSubmenuOpen = openSubmenus[item.label];
              const isSubmenuHovered = hoveredSubmenu === item.label;

              if (isCollapsed) {
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => hasSubmenu && setHoveredSubmenu(item.label)}
                    onMouseLeave={() => setHoveredSubmenu(null)}
                  >
                    {hasSubmenu ? (
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.label)}
                          className={cn(
                            'w-full flex items-center justify-center py-2.5 transition-colors',
                            isItemActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-text-primary hover:bg-surface-subtle'
                          )}
                          aria-label={item.label}
                        >
                          <Icon size={22} />
                        </button>
                        {/* Flyout submenu when collapsed */}
                        {isSubmenuHovered && (
                          <div
                            className="absolute left-full top-0 ml-0 min-w-[180px] py-1 bg-surface border border-border rounded-r-lg shadow-elevated z-50"
                            role="menu"
                          >
                            <p className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                              {item.label}
                            </p>
                            {item.submenu?.map((subItem) => {
                              const isSubActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setIsMobileOpen(false)}
                                  className={cn(
                                    'block px-4 py-2.5 text-sm transition-colors',
                                    isSubActive
                                      ? 'text-primary font-medium bg-primary/5'
                                      : 'text-text-primary hover:bg-surface-subtle'
                                  )}
                                  role="menuitem"
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
                          'flex items-center justify-center py-2.5 transition-colors',
                          isItemActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-primary hover:bg-surface-subtle'
                        )}
                        aria-label={item.label}
                      >
                        <Icon size={22} />
                      </Link>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.label}>
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        aria-expanded={isSubmenuOpen}
                        aria-controls={`submenu-${item.label}`}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors rounded-r-lg',
                          isItemActive
                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                            : 'text-text-primary hover:bg-surface-subtle'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={18} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <ChevronRight
                          size={16}
                          className={cn(
                            'transition-transform shrink-0',
                            isSubmenuOpen && 'rotate-90'
                          )}
                        />
                      </button>
                      {isSubmenuOpen && (
                        <div id={`submenu-${item.label}`} className="bg-surface-subtle" role="region" aria-label={`${item.label} submenu`}>
                          {item.submenu?.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                  'block px-3 py-2 pl-10 text-sm transition-colors',
                                  isSubActive
                                    ? 'text-primary font-medium bg-primary/5'
                                    : 'text-text-muted hover:bg-surface/80'
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
                        'flex items-center gap-2 px-3 py-2.5 transition-colors',
                        isItemActive
                          ? 'bg-primary/10 text-primary border-r-2 border-primary'
                          : 'text-text-primary hover:bg-surface-subtle'
                      )}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium">{item.label}</span>
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
