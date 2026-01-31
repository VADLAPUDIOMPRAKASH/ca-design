'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Search,
  Edit,
  Copy,
  Eye,
  Trash2,
  Mail,
  Bell,
  Clock,
  FileText,
  AlertCircle,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';
import { format } from 'date-fns';

const templateCategories = [
  'Login Credentials',
  'Notifications',
  'Follow-ups',
  'Reminders',
  'General',
  'Custom',
];

export default function EmailTemplatesPage() {
  const { templates, deleteTemplate } = useApp();
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    let result = templates;

    if (selectedCategory !== 'All') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [templates, selectedCategory, searchQuery]);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
      showToast('Template deleted successfully', 'success');
    }
  };

  const handleDuplicate = (template: typeof templates[0]) => {
    // In a real app, this would create a copy
    showToast('Template duplicated (feature coming soon)', 'info');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Email Templates</h1>
          <p className="text-text-muted mt-1">Manage your email templates</p>
        </div>
        <Link href="/emails/templates/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Create New Template
          </Button>
        </Link>
      </div>

      {/* Search and Categories */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search templates by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'All'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {templateCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </Card>

      {/* Pre-built Templates Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pre-built Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Welcome & Login Credentials', icon: Mail },
            { name: 'Document Request Reminder', icon: FileText },
            { name: 'Tax Filing Deadline Reminder', icon: Calendar },
            { name: 'GST Return Follow-up', icon: AlertCircle },
            { name: 'Payment Reminder', icon: Bell },
            { name: 'Annual Compliance Notification', icon: Clock },
            { name: 'Meeting Schedule Confirmation', icon: Calendar },
          ].map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="text-primary" size={20} />
                  </div>
                  <Button variant="outline" size="sm">
                    Use Template
                  </Button>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500">Click to customize and use</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Templates */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Templates</h2>
        {filteredTemplates.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Mail className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-500 text-lg font-medium mb-2">No templates yet</p>
              <p className="text-gray-400 text-sm mb-4">
                Create your first email template to get started
              </p>
              <Button>
                <Plus size={18} className="mr-2" />
                Create Template
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {template.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Used {template.usageCount} times</span>
                  <span>Modified {format(new Date(template.lastModified), 'MMM dd, yyyy')}</span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <Link href={`/emails/templates/create?id=${template.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy size={16} className="mr-2" />
                    Copy
                  </Button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-danger"
                    title="Delete template"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
