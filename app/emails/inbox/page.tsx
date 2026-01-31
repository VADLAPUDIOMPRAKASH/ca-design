'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Mail,
  Search,
  Paperclip,
  User,
  Reply,
  ChevronRight,
  Star,
  Archive,
  ArchiveRestore,
  Trash2,
  MailOpen,
  MailX,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import type { ReceivedEmail } from '@/context/AppContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/lib/toast';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'starred', label: 'Starred' },
  { id: 'from-clients', label: 'From Clients' },
  { id: 'archived', label: 'Archived' },
];

const sortOptions = [
  { id: 'date-desc', label: 'Newest first' },
  { id: 'date-asc', label: 'Oldest first' },
  { id: 'sender', label: 'Sender A–Z' },
  { id: 'subject', label: 'Subject A–Z' },
];

export default function InboxPage() {
  const {
    receivedEmails,
    markReceivedEmailRead,
    updateReceivedEmail,
    deleteReceivedEmail,
    bulkUpdateReceivedEmails,
  } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedEmail, setSelectedEmail] = useState<ReceivedEmail | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number; bulk?: number[] }>({
    open: false,
  });

  const filteredEmails = useMemo(() => {
    let result = [...receivedEmails];

    if (activeTab === 'unread') {
      result = result.filter((e) => !e.isRead && !e.isArchived);
    } else if (activeTab === 'starred') {
      result = result.filter((e) => e.isStarred && !e.isArchived);
    } else if (activeTab === 'from-clients') {
      result = result.filter((e) => e.clientId != null && !e.isArchived);
    } else if (activeTab === 'archived') {
      result = result.filter((e) => e.isArchived);
    } else {
      result = result.filter((e) => !e.isArchived);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.fromName.toLowerCase().includes(q) ||
          e.from.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
        case 'sender':
          return a.fromName.localeCompare(b.fromName);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      }
    });

    return result;
  }, [receivedEmails, activeTab, search, sortBy]);

  const unreadCount = receivedEmails.filter((e) => !e.isRead && !e.isArchived).length;
  const starredCount = receivedEmails.filter((e) => e.isStarred && !e.isArchived).length;
  const archivedCount = receivedEmails.filter((e) => e.isArchived).length;

  const handleSelectEmail = (email: ReceivedEmail) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      markReceivedEmailRead(email.id);
    }
  };

  const toggleSelect = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEmails.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmails.map((e) => e.id)));
    }
  };

  const handleBulkMarkRead = () => {
    bulkUpdateReceivedEmails(Array.from(selectedIds), { isRead: true });
    setSelectedIds(new Set());
    showToast('Marked as read', 'success');
  };

  const handleBulkMarkUnread = () => {
    bulkUpdateReceivedEmails(Array.from(selectedIds), { isRead: false });
    setSelectedIds(new Set());
    showToast('Marked as unread', 'success');
  };

  const handleBulkArchive = () => {
    bulkUpdateReceivedEmails(Array.from(selectedIds), { isArchived: true });
    setSelectedIds(new Set());
    if (selectedEmail && selectedIds.has(selectedEmail.id)) setSelectedEmail(null);
    showToast('Archived', 'success');
  };

  const handleBulkUnarchive = () => {
    bulkUpdateReceivedEmails(Array.from(selectedIds), { isArchived: false });
    setSelectedIds(new Set());
    showToast('Restored from archive', 'success');
  };

  const handleBulkDelete = () => {
    setDeleteModal({ open: true, bulk: Array.from(selectedIds) });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteReceivedEmail(deleteModal.id);
      if (selectedEmail?.id === deleteModal.id) setSelectedEmail(null);
      showToast('Email deleted', 'success');
    } else if (deleteModal.bulk?.length) {
      deleteModal.bulk.forEach((id) => deleteReceivedEmail(id));
      setSelectedIds(new Set());
      if (selectedEmail && deleteModal.bulk.includes(selectedEmail.id)) setSelectedEmail(null);
      showToast(`${deleteModal.bulk.length} email(s) deleted`, 'success');
    }
    setDeleteModal({ open: false });
  };


  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/emails"
          className="inline-flex items-center text-sm text-text-muted hover:text-text-primary mb-4"
        >
          <ArrowLeft size={16} className="mr-2 shrink-0" />
          Back to Email Management
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Inbox</h1>
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                {unreadCount} unread
              </span>
            )}
            {starredCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning/10 text-warning">
                {starredCount} starred
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Email List */}
        <div className="lg:col-span-1">
          <Card padding="none">
            {/* Tabs */}
            <div className="border-b border-border">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Sort */}
            <div className="p-3 border-b border-border space-y-2">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  placeholder="Search by sender or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface"
                />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface appearance-none cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>
            </div>

            {/* Bulk actions toolbar */}
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/5 border-b border-border">
                <span className="text-sm font-medium text-text-primary">
                  {selectedIds.size} selected
                </span>
                <div className="flex flex-wrap gap-1">
                  <Button variant="outline" size="sm" onClick={handleBulkMarkRead}>
                    <MailOpen size={14} className="mr-1" />
                    Read
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkMarkUnread}>
                    <MailX size={14} className="mr-1" />
                    Unread
                  </Button>
                  {activeTab === 'archived' ? (
                    <Button variant="outline" size="sm" onClick={handleBulkUnarchive}>
                      <ArchiveRestore size={14} className="mr-1" />
                      Restore
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                      <Archive size={14} className="mr-1" />
                      Archive
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-danger hover:bg-danger/10">
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Select all (when list has items) */}
            {filteredEmails.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface-subtle">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredEmails.length}
                  ref={(el) => {
                    if (el) (el as HTMLInputElement).indeterminate = selectedIds.size > 0 && selectedIds.size < filteredEmails.length;
                  }}
                  onChange={toggleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-muted">
                  {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Email list */}
            <div className="max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto">
              {filteredEmails.length === 0 ? (
                <EmptyState
                  icon={Mail}
                  title="No emails"
                  description={
                    activeTab === 'unread'
                      ? 'All caught up! No unread emails.'
                      : activeTab === 'starred'
                        ? 'No starred emails. Click the star to mark important emails.'
                        : activeTab === 'from-clients'
                          ? 'No emails from clients yet.'
                          : activeTab === 'archived'
                            ? 'No archived emails.'
                            : 'No emails match your search.'
                  }
                  className="py-12"
                />
              ) : (
                <div className="divide-y divide-border">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`flex items-start gap-2 w-full text-left px-4 py-3 hover:bg-surface-subtle transition-colors cursor-pointer ${
                        selectedEmail?.id === email.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      } ${!email.isRead ? 'bg-primary/[0.03]' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(email.id)}
                        onChange={() => {}}
                        onClick={(e) => toggleSelect(email.id, e)}
                        className="rounded border-border text-primary focus:ring-primary mt-1 shrink-0"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateReceivedEmail(email.id, { isStarred: !email.isStarred });
                          showToast(email.isStarred ? 'Removed from starred' : 'Added to starred', 'info');
                        }}
                        className="shrink-0 p-0.5 rounded hover:bg-surface-subtle mt-0.5"
                        aria-label={email.isStarred ? 'Unstar' : 'Star'}
                      >
                        <Star
                          size={16}
                          className={email.isStarred ? 'fill-warning text-warning' : 'text-text-muted'}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate ${
                              !email.isRead ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'
                            }`}
                          >
                            {email.fromName}
                          </p>
                          <span className="text-xs text-text-muted shrink-0">
                            {format(new Date(email.receivedAt), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted truncate mt-0.5">{email.subject}</p>
                        {email.hasAttachment && (
                          <Paperclip size={12} className="inline text-text-muted mt-1" />
                        )}
                      </div>
                      <ChevronRight
                        size={16}
                        className={`shrink-0 text-text-muted ${
                          selectedEmail?.id === email.id ? 'text-primary' : ''
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            <Card>
              <div className="flex flex-col h-full">
                {/* Email header */}
                <div className="border-b border-border pb-4 mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-text-primary flex-1">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          updateReceivedEmail(selectedEmail.id, { isStarred: !selectedEmail.isStarred });
                          showToast(selectedEmail.isStarred ? 'Removed from starred' : 'Added to starred', 'info');
                        }}
                        className="p-2 rounded-lg hover:bg-surface-subtle"
                        aria-label={selectedEmail.isStarred ? 'Unstar' : 'Star'}
                      >
                        <Star
                          size={18}
                          className={selectedEmail.isStarred ? 'fill-warning text-warning' : 'text-text-muted'}
                        />
                      </button>
                      <button
                        onClick={() => {
                          updateReceivedEmail(selectedEmail.id, {
                            isArchived: !selectedEmail.isArchived,
                          });
                          showToast(
                            selectedEmail.isArchived ? 'Restored from archive' : 'Archived',
                            'success'
                          );
                          setSelectedEmail(null);
                        }}
                        className="p-2 rounded-lg hover:bg-surface-subtle"
                        aria-label={selectedEmail.isArchived ? 'Restore' : 'Archive'}
                      >
                        {selectedEmail.isArchived ? (
                          <ArchiveRestore size={18} className="text-text-muted" />
                        ) : (
                          <Archive size={18} className="text-text-muted" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: selectedEmail.id })}
                        className="p-2 rounded-lg hover:bg-danger/10 text-danger"
                        aria-label="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold">
                        {selectedEmail.fromName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{selectedEmail.fromName}</p>
                        <p className="text-sm text-text-muted">{selectedEmail.from}</p>
                      </div>
                    </div>
                    {selectedEmail.clientId && (
                      <Link href={`/clients?client=${selectedEmail.clientId}`}>
                        <Button variant="outline" size="sm" className="shrink-0">
                          <User size={14} className="mr-1" />
                          View Client
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
                    <span>To: {selectedEmail.to}</span>
                    <span>
                      {format(new Date(selectedEmail.receivedAt), 'PPpp')}
                    </span>
                    {selectedEmail.hasAttachment && (
                      <span className="inline-flex items-center gap-1">
                        <Paperclip size={14} />
                        Attachment
                      </span>
                    )}
                  </div>
                </div>

                {/* Email body */}
                <div
                  className="flex-1 prose prose-sm max-w-none text-text-primary whitespace-pre-wrap"
                  style={{ lineHeight: 1.65 }}
                >
                  {selectedEmail.body}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                  <Button size="sm">
                    <Reply size={16} className="mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    Forward
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
                <Mail size={32} className="text-text-muted" />
              </div>
              <p className="text-text-muted font-medium">Select an email to view</p>
              <p className="text-sm text-text-muted mt-1">
                Choose an email from the list to read its contents
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete email(s)?"
        message={
          deleteModal.bulk?.length
            ? `This will permanently delete ${deleteModal.bulk.length} email(s). This action cannot be undone.`
            : 'This will permanently delete this email. This action cannot be undone.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
