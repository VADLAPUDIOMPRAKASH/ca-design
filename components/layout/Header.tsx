'use client';

import React from 'react';
import { Bell, Settings, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from './Breadcrumb';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-60 right-0 z-30 flex items-center justify-between px-6">
      {/* Breadcrumb - dynamic based on route */}
      <Breadcrumb />

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-48"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Settings size={20} className="text-gray-600" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium text-sm">
            JD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">CA</p>
          </div>
        </div>
      </div>
    </header>
  );
};
