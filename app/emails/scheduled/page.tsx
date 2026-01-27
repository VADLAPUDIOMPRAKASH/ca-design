'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Mail,
  Pause,
  Play,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';

const tabs = ['Upcoming', 'Recurring', 'Sent', 'Drafts', 'Failed'];

export default function ScheduledEmailsPage() {
  const { scheduledEmails, updateScheduledEmail, deleteScheduledEmail } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Upcoming');

  const filteredEmails = useMemo(() => {
    const now = new Date();
    switch (activeTab) {
      case 'Upcoming':
        return scheduledEmails.filter(
          (e) => e.status === 'Pending' && new Date(e.scheduleDate) > now
        );
      case 'Recurring':
        return scheduledEmails.filter((e) => e.type === 'recurring');
      case 'Sent':
        return scheduledEmails.filter((e) => e.status === 'Sent');
      case 'Drafts':
        return scheduledEmails.filter((e) => e.status === 'Pending' && new Date(e.scheduleDate) <= now);
      case 'Failed':
        return scheduledEmails.filter((e) => e.status === 'Failed');
      default:
        return [];
    }
  }, [scheduledEmails, activeTab]);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this scheduled email?')) {
      deleteScheduledEmail(id);
      showToast('Scheduled email deleted', 'success');
    }
  };

  const handlePause = (id: number) => {
    updateScheduledEmail(id, { status: 'Pending' });
    showToast('Email schedule paused', 'success');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/emails" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to Email Management
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Scheduled Emails</h1>
      </div>

      {/* Tabs */}
      <Card className="mb-6" padding="none">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Email List */}
      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Clock className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-500 text-lg font-medium mb-2">
                No {activeTab.toLowerCase()} emails
              </p>
              <p className="text-gray-400 text-sm">
                {activeTab === 'Upcoming' && 'Schedule emails to see them here'}
                {activeTab === 'Recurring' && 'Create recurring emails to see them here'}
                {activeTab === 'Sent' && 'Sent emails will appear here'}
                {activeTab === 'Drafts' && 'Draft emails will appear here'}
                {activeTab === 'Failed' && 'Failed emails will appear here'}
              </p>
            </div>
          </Card>
        ) : (
          filteredEmails.map((email) => (
              <Card key={email.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{email.subject}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          email.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {email.status}
                      </span>
                      {email.type === 'recurring' && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Recurring
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Mail size={16} />
                        {email.recipientsCount} recipients
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {format(new Date(email.scheduleDate), 'MMM dd, yyyy h:mm a')}
                      </span>
                    </div>
                    {email.type === 'recurring' && email.repeatFrequency && (
                      <div className="text-sm text-gray-600">
                        <p>Next send: {format(new Date(email.scheduleDate), 'MMM dd, yyyy h:mm a')}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Recurring: {email.repeatFrequency}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {email.type === 'recurring' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePause(email.id)}
                        >
                          <Pause size={16} className="mr-2" />
                          Pause
                        </Button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(email.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-danger"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
          ))
        )}
      </div>
    </div>
  );
}
