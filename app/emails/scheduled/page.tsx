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
  Trash2,
  MessageSquare,
  Send,
  Inbox,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

const tabs = ['Upcoming', 'Recurring', 'Sent', 'Waiting for Reply', 'Drafts', 'Failed'];

export default function ScheduledEmailsPage() {
  const { scheduledEmails, updateScheduledEmail, deleteScheduledEmail } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });

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
      case 'Waiting for Reply':
        return scheduledEmails.filter((e) => e.status === 'Sent' && e.waitingForReply);
      case 'Drafts':
        return scheduledEmails.filter((e) => e.status === 'Pending' && new Date(e.scheduleDate) <= now);
      case 'Failed':
        return scheduledEmails.filter((e) => e.status === 'Failed');
      default:
        return [];
    }
  }, [scheduledEmails, activeTab]);

  const waitingForReplyCount = scheduledEmails.filter((e) => e.status === 'Sent' && e.waitingForReply).length;

  const handleDeleteClick = (id: number) => setDeleteModal({ open: true, id });
  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteScheduledEmail(deleteModal.id);
      showToast('Scheduled email deleted', 'success');
    }
    setDeleteModal({ open: false });
  };

  const handlePause = (id: number) => {
    updateScheduledEmail(id, { status: 'Pending' });
    showToast('Email schedule paused', 'success');
  };

  const toggleWaitingForReply = (id: number, current: boolean) => {
    updateScheduledEmail(id, { waitingForReply: !current });
    showToast(current ? 'Removed from waiting for reply' : 'Marked as waiting for reply', 'success');
  };

  const markAsReplied = (id: number) => {
    updateScheduledEmail(id, { waitingForReply: false });
    showToast('Marked as replied', 'success');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link href="/emails" className="inline-flex items-center text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft size={16} className="mr-2 shrink-0" />
          Back to Email Management
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Scheduled Emails</h1>
          {waitingForReplyCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning/10 text-warning">
              {waitingForReplyCount} waiting for reply
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card className="mb-4 sm:mb-6" padding="none">
        <div className="border-b border-border">
          <div className="flex overflow-x-auto overflow-y-hidden">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {tab}
                {tab === 'Waiting for Reply' && waitingForReplyCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
                    {waitingForReplyCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Email List */}
      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <Card>
            <EmptyState
              icon={Clock}
              title={`No ${activeTab.toLowerCase()} emails`}
              description={
                activeTab === 'Upcoming' ? 'Schedule emails to see them here' :
                activeTab === 'Recurring' ? 'Create recurring emails to see them here' :
                activeTab === 'Sent' ? 'Sent emails will appear here' :
                activeTab === 'Waiting for Reply' ? 'Mark sent emails as "Waiting for reply" in the Sent tab to track them here' :
                activeTab === 'Drafts' ? 'Draft emails will appear here' :
                'Failed emails will appear here'
              }
            />
          </Card>
        ) : (
          filteredEmails.map((email) => (
              <Card key={email.id}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Waiting for reply checkbox - only for Sent emails */}
                    {email.status === 'Sent' && activeTab === 'Sent' && (
                      <label className="flex items-center gap-2 mb-3 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          checked={!!email.waitingForReply}
                          onChange={() => toggleWaitingForReply(email.id, !!email.waitingForReply)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                          <MessageSquare size={16} className="text-warning" />
                          Waiting for reply
                        </span>
                      </label>
                    )}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">{email.subject}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          email.status === 'Pending'
                            ? 'bg-warning/10 text-warning'
                            : email.status === 'Sent'
                              ? 'bg-success/10 text-success'
                              : email.status === 'Failed'
                                ? 'bg-danger/10 text-danger'
                                : 'bg-surface-subtle text-text-muted'
                        }`}
                      >
                        {email.status}
                      </span>
                      {email.waitingForReply && (
                        <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full flex items-center gap-1">
                          <MessageSquare size={12} />
                          Awaiting reply
                        </span>
                      )}
                      {email.type === 'recurring' && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          Recurring
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-text-muted mb-3">
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
                      <div className="text-sm text-text-muted">
                        <p>Next send: {format(new Date(email.scheduleDate), 'MMM dd, yyyy h:mm a')}</p>
                        <p className="text-xs mt-1">
                          Recurring: {email.repeatFrequency}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Waiting for Reply tab - action buttons */}
                    {activeTab === 'Waiting for Reply' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => markAsReplied(email.id)}
                        >
                          <MessageSquare size={16} className="mr-2" />
                          Mark as Replied
                        </Button>
                        <Link href="/emails/send">
                          <Button variant="outline" size="sm">
                            <Send size={16} className="mr-2" />
                            Send Follow-up
                          </Button>
                        </Link>
                        <Link href="/emails/inbox">
                          <Button variant="outline" size="sm">
                            <Inbox size={16} className="mr-2" />
                            View Inbox
                          </Button>
                        </Link>
                      </>
                    )}
                    {email.type === 'recurring' && activeTab !== 'Waiting for Reply' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePause(email.id)}
                      >
                        <Pause size={16} className="mr-2" />
                        Pause
                      </Button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(email.id)}
                      className="p-2 hover:bg-danger/10 rounded-lg text-danger transition-colors"
                      aria-label={`Delete ${email.subject}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Scheduled Email"
        message="Are you sure you want to delete this scheduled email? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
