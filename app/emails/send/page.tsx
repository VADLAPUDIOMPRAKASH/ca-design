'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  Send,
  Clock,
  Calendar,
  Users,
  FileText,
  X,
  Eye,
  Mail,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';
import {
  replaceTemplateVariables,
  buildVariableDataFromClient,
  SAMPLE_TEMPLATE_DATA,
} from '@/lib/templateUtils';

const CATEGORIES = ['Individual', 'Company', 'Startup', 'Partnership', 'LLP'];
const STATUSES = ['Active', 'Inactive', 'Pending'];

export default function SendEmailPage() {
  const router = useRouter();
  const { clients, templates, addScheduledEmail, updateTemplate } = useApp();
  const { showToast } = useToast();
  const [sendOption, setSendOption] = useState<'now' | 'later' | 'recurring'>('now');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [recipientSearch, setRecipientSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ subject: string; body: string; onUse?: () => void } | null>(null);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [addNCount, setAddNCount] = useState(30); // For "Add N from filtered"
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    scheduleDate: '',
    scheduleTime: '',
    repeatFrequency: '',
    repeatEvery: '',
    trackOpens: true,
    trackClicks: true,
    priority: 'normal',
    waitingForReply: false, // Track if awaiting client response (for CA workflow)
  });

  // Filtered clients for the list
  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (recipientSearch) {
      const query = recipientSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.companyName.toLowerCase().includes(query)
      );
    }

    if (filterCategory) {
      result = result.filter((c) => c.categories.includes(filterCategory));
    }

    if (filterStatus) {
      result = result.filter((c) => c.status === filterStatus);
    }

    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      result = result.filter((c) => new Date(c.addedDate) >= from);
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((c) => new Date(c.addedDate) <= to);
    }

    return result;
  }, [clients, recipientSearch, filterCategory, filterStatus, filterDateFrom, filterDateTo]);

  const selectedRecipients = Array.from(selectedEmails);

  const toggleRecipient = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const addRecipient = (email: string) => {
    setSelectedEmails((prev) => new Set([...prev, email]));
  };

  const removeRecipient = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      next.delete(email);
      return next;
    });
  };

  const addAll = () => {
    const all = clients.map((c) => c.email);
    setSelectedEmails(new Set(all));
    showToast(`Added all ${all.length} members`, 'success');
  };

  const addByCategory = (category: string) => {
    const matching = clients.filter((c) => c.categories.includes(category)).map((c) => c.email);
    setSelectedEmails((prev) => new Set([...prev, ...matching]));
    showToast(`Added ${matching.length} members from ${category}`, 'success');
  };

  const addByStatus = (status: string) => {
    const matching = clients.filter((c) => c.status === status).map((c) => c.email);
    setSelectedEmails((prev) => new Set([...prev, ...matching]));
    showToast(`Added ${matching.length} ${status} members`, 'success');
  };

  const addByDateRange = () => {
    if (!filterDateFrom || !filterDateTo) {
      showToast('Select date range first', 'warning');
      return;
    }
    const from = new Date(filterDateFrom);
    const to = new Date(filterDateTo);
    to.setHours(23, 59, 59, 999);
    const matching = clients.filter((c) => {
      const d = new Date(c.addedDate);
      return d >= from && d <= to;
    }).map((c) => c.email);
    setSelectedEmails((prev) => new Set([...prev, ...matching]));
    showToast(`Added ${matching.length} members from date range`, 'success');
  };

  const addFiltered = () => {
    const emails = filteredClients.map((c) => c.email);
    setSelectedEmails((prev) => new Set([...prev, ...emails]));
    showToast(`Added ${emails.length} members matching filters`, 'success');
  };

  // Add first N members from filtered list (e.g., 30 from 50 startups)
  const addNFromFiltered = () => {
    const n = Math.min(Math.max(1, addNCount), filteredClients.length);
    const emails = filteredClients.slice(0, n).map((c) => c.email);
    setSelectedEmails((prev) => new Set([...prev, ...emails]));
    showToast(`Added ${n} members from filtered list (${filteredClients.length} total match)`, 'success');
  };

  // Add random N from filtered (useful when order doesn't matter)
  const addRandomNFromFiltered = () => {
    const n = Math.min(Math.max(1, addNCount), filteredClients.length);
    const shuffled = [...filteredClients].sort(() => Math.random() - 0.5);
    const emails = shuffled.slice(0, n).map((c) => c.email);
    setSelectedEmails((prev) => new Set([...prev, ...emails]));
    showToast(`Added ${n} random members from filtered list`, 'success');
  };

  const selectAllShown = () => {
    const emails = filteredClients.map((c) => c.email);
    setSelectedEmails((prev) => new Set([...prev, ...emails]));
    showToast(`Added ${emails.length} members`, 'success');
  };

  const deselectAllShown = () => {
    const emails = new Set(filteredClients.map((c) => c.email));
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      emails.forEach((e) => next.delete(e));
      return next;
    });
    showToast(`Removed ${emails.size} members from selection`, 'info');
  };

  const clearAll = () => {
    setSelectedEmails(new Set());
    showToast('Selection cleared', 'info');
  };

  const allShownSelected = filteredClients.length > 0 && filteredClients.every((c) => selectedEmails.has(c.email));
  const someShownSelected = filteredClients.some((c) => selectedEmails.has(c.email));

  // Variable data for preview: use first selected recipient, else sample
  const previewVariableData = useMemo(() => {
    const firstEmail = selectedRecipients[0];
    const client = firstEmail ? clients.find((c) => c.email === firstEmail) : null;
    return client
      ? buildVariableDataFromClient(client)
      : SAMPLE_TEMPLATE_DATA;
  }, [selectedRecipients, clients]);

  const handleUseTemplate = (template: (typeof templates)[0]) => {
    setFormData((prev) => ({
      ...prev,
      subject: template.subject,
      body: template.body,
    }));
    setShowTemplateModal(false);
    setPreviewContent(null);
    updateTemplate(template.id, { usageCount: template.usageCount + 1 });
    showToast('Template applied. Edit subject/body if needed.', 'success');
  };

  const openTemplatePreview = (template: { subject: string; body: string }, onUse?: () => void) => {
    setPreviewContent({ subject: template.subject, body: template.body, onUse });
  };

  const openEmailPreview = () => {
    if (!formData.subject && !formData.body) {
      showToast('Add subject and body to preview', 'error');
      return;
    }
    setPreviewContent({ subject: formData.subject, body: formData.body });
  };

  const handleSend = () => {
    if (!formData.subject || !formData.body || selectedRecipients.length === 0) {
      showToast('Please fill all required fields and select recipients', 'error');
      return;
    }

    if (sendOption === 'now') {
      addScheduledEmail({
        subject: formData.subject,
        recipients: selectedRecipients,
        recipientsCount: selectedRecipients.length,
        scheduleDate: new Date(),
        status: 'Sent',
        type: 'scheduled',
        body: formData.body,
        waitingForReply: formData.waitingForReply,
      });
      showToast(`Email sent to ${selectedRecipients.length} recipient(s)`, 'success');
      setTimeout(() => router.push('/emails/scheduled'), 1500);
    } else if (sendOption === 'later' || sendOption === 'recurring') {
      if (!formData.scheduleDate || !formData.scheduleTime) {
        showToast('Please select schedule date and time', 'error');
        return;
      }

      const scheduleDateTime = new Date(`${formData.scheduleDate}T${formData.scheduleTime}`);
      addScheduledEmail({
        subject: formData.subject,
        recipients: selectedRecipients,
        recipientsCount: selectedRecipients.length,
        scheduleDate: scheduleDateTime,
        status: 'Pending',
        type: sendOption === 'recurring' ? 'recurring' : 'scheduled',
        repeatFrequency: sendOption === 'recurring' ? formData.repeatFrequency : undefined,
        body: formData.body,
      });

      showToast(`Email scheduled for ${scheduleDateTime.toLocaleString()}`, 'success');
      setTimeout(() => router.push('/emails/scheduled'), 1500);
    }
  };

  const getClientByEmail = (email: string) => clients.find((c) => c.email === email);

  return (
    <div>
      <div className="mb-6">
        <Link href="/emails" className="inline-flex items-center text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft size={16} className="mr-2 shrink-0" />
          Back to Email Management
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Send Email</h1>
        <p className="text-text-muted mt-1">Select recipients and compose your email</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recipients Section */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recipients <span className="text-danger">*</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">
                  {selectedRecipients.length} of {clients.length} selected
                </span>
                {selectedRecipients.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Selected chips */}
            {selectedRecipients.length > 0 && (
              <div className="mb-4 p-3 bg-surface-subtle rounded-lg border border-border max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {selectedRecipients.slice(0, 20).map((email) => {
                    const client = getClientByEmail(email);
                    return (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {client?.name || email}
                        <button
                          onClick={() => removeRecipient(email)}
                          className="hover:text-primary-hover rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label={`Remove ${client?.name || email}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    );
                  })}
                  {selectedRecipients.length > 20 && (
                    <span className="px-3 py-1.5 text-sm text-gray-600">
                      +{selectedRecipients.length - 20} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick Add */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Add</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={addAll}>
                  <Users size={16} className="mr-2" />
                  Add All ({clients.length})
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
                  >
                    By Category
                    <ChevronDown size={16} className="ml-2" />
                  </Button>
                  {showRecipientDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowRecipientDropdown(false)}
                      />
                      <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                        {CATEGORIES.map((cat) => {
                          const count = clients.filter((c) => c.categories.includes(cat)).length;
                          return (
                            <button
                              key={cat}
                              onClick={() => {
                                addByCategory(cat);
                                setShowRecipientDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex justify-between"
                            >
                              {cat}
                              <span className="text-gray-500">{count}</span>
                            </button>
                          );
                        })}
                        <div className="border-t border-gray-200 my-1" />
                        <p className="px-4 py-2 text-xs text-gray-500">By Status</p>
                        {STATUSES.map((status) => {
                          const count = clients.filter((c) => c.status === status).length;
                          return (
                            <button
                              key={status}
                              onClick={() => {
                                addByStatus(status);
                                setShowRecipientDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex justify-between"
                            >
                              {status}
                              <span className="text-gray-500">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={addFiltered}>
                  Add Filtered ({filteredClients.length})
                </Button>
              </div>
              {filteredClients.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2 pt-3 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Add subset from filtered:</span>
                  <input
                    type="number"
                    min={1}
                    max={filteredClients.length}
                    value={addNCount}
                    onChange={(e) => setAddNCount(Math.min(filteredClients.length, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    title="Number of members to add"
                  />
                  <span className="text-sm text-gray-600">of {filteredClients.length} →</span>
                  <Button variant="outline" size="sm" onClick={addNFromFiltered}>
                    Add first {Math.min(addNCount, filteredClients.length)}
                  </Button>
                  <Button variant="outline" size="sm" onClick={addRandomNFromFiltered}>
                    Add random {Math.min(addNCount, filteredClients.length)}
                  </Button>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="mb-4 p-4 bg-surface-subtle rounded-lg border border-border">
              <p className="text-sm font-medium text-gray-700 mb-3">Search & Filter</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, company..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">All Status</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 md:col-span-2">
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    placeholder="From date"
                  />
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    placeholder="To date"
                  />
                  <Button variant="outline" size="sm" onClick={addByDateRange}>
                    Add by Date
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {filteredClients.length} members match filters
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllShown}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Select all shown
                  </button>
                  {someShownSelected && (
                    <button
                      onClick={deselectAllShown}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Deselect all shown
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Member list with checkboxes */}
            <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
              <div className="sticky top-0 bg-surface-subtle px-4 py-2 border-b border-border flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allShownSelected}
                  ref={(el) => {
                    if (el) (el as HTMLInputElement).indeterminate = someShownSelected && !allShownSelected;
                  }}
                  onChange={() => {
                    if (allShownSelected) deselectAllShown();
                    else selectAllShown();
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  {filteredClients.length} members
                </span>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const isSelected = selectedEmails.has(client.email);
                  return (
                    <label
                      key={client.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRecipient(client.email)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{client.name}</p>
                        <p className="text-sm text-gray-600 truncate">{client.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0">
                        {client.categories[0]}
                      </span>
                    </label>
                  );
                })}
              </div>
              {filteredClients.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No members match your filters
                </div>
              )}
            </div>
          </Card>

          {/* Email Content */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Email Content</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateModal(!showTemplateModal)}
              >
                <FileText size={16} className="mr-2" />
                Use Template
              </Button>
            </div>

            {showTemplateModal && (
              <div className="mb-4 p-4 bg-surface-subtle rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Select Template</h3>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Preview with sample data, or use first recipient if selected
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 bg-surface rounded-lg border border-border hover:border-primary/50"
                    >
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-500 mb-1">{template.category}</p>
                      <p className="text-xs text-gray-600 truncate mb-2" title={template.subject}>
                        Subject: {template.subject}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openTemplatePreview(
                              { subject: template.subject, body: template.body },
                              () => handleUseTemplate(template)
                            )
                          }
                        >
                          <Eye size={14} className="mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" onClick={() => handleUseTemplate(template)}>
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No templates available. Create one first.</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject..."
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Body <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
                  rows={12}
                  placeholder="Compose your email..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Max 25MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <FileText className="text-gray-400 mx-auto mb-2" size={32} />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag and drop files here, or <button className="text-primary hover:underline">browse</button>
                  </p>
                  <p className="text-xs text-gray-500">Supported: PDF, DOC, XLS, Images</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline">Save as Draft</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={openEmailPreview}>
                <Eye size={18} className="mr-2" />
                Preview
              </Button>
              <Button variant="outline">
                <Mail size={18} className="mr-2" />
                Send Test
              </Button>
            </div>
          </div>
        </div>

        {/* Schedule & Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Options</h2>
            <div className="space-y-3 mb-6">
              {[
                { value: 'now' as const, label: 'Send Now', desc: 'Send immediately' },
                { value: 'later' as const, label: 'Schedule for Later', desc: 'Send at specific date/time' },
                { value: 'recurring' as const, label: 'Recurring Schedule', desc: 'Send repeatedly' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="sendOption"
                    value={opt.value}
                    checked={sendOption === opt.value}
                    onChange={() => setSendOption(opt.value)}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {sendOption === 'now' && (
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-subtle transition-colors">
                <input
                  type="checkbox"
                  checked={formData.waitingForReply}
                  onChange={(e) => setFormData((prev) => ({ ...prev, waitingForReply: e.target.checked }))}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-sm font-medium text-text-primary">Waiting for reply</div>
                  <div className="text-xs text-text-muted">Track this email until client responds</div>
                </div>
              </label>
            )}

            {sendOption === 'later' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scheduleDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <Input
                    type="time"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scheduleTime: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {sendOption === 'recurring' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Frequency</label>
                  <select
                    value={formData.repeatFrequency}
                    onChange={(e) => setFormData((prev) => ({ ...prev, repeatFrequency: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <details>
              <summary className="cursor-pointer text-sm font-medium text-gray-900">
                Advanced Options
              </summary>
              <div className="space-y-4 pt-4 mt-4 border-t border-gray-200">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.trackOpens}
                    onChange={(e) => setFormData((prev) => ({ ...prev, trackOpens: e.target.checked }))}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Track email opens</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.trackClicks}
                    onChange={(e) => setFormData((prev) => ({ ...prev, trackClicks: e.target.checked }))}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Track link clicks</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </details>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSend}
            disabled={!formData.subject || !formData.body || selectedRecipients.length === 0}
          >
            {sendOption === 'now' && (
              <>
                <Send size={18} className="mr-2" />
                Send to {selectedRecipients.length} recipients
              </>
            )}
            {sendOption === 'later' && (
              <>
                <Clock size={18} className="mr-2" />
                Schedule Email
              </>
            )}
            {sendOption === 'recurring' && (
              <>
                <Calendar size={18} className="mr-2" />
                Create Recurring
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Email Preview Modal */}
      {previewContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          onClick={() => setPreviewContent(null)}
        >
          <div
            className="relative bg-surface rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 id="preview-title" className="text-lg font-semibold text-gray-900">
                Email Preview
              </h2>
              <div className="flex gap-2">
                {previewContent.onUse && (
                  <Button size="sm" onClick={previewContent.onUse}>
                    Use Template
                  </Button>
                )}
                <button
                  onClick={() => setPreviewContent(null)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</span>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {replaceTemplateVariables(previewContent.subject, previewVariableData)}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Body</span>
                <div
                  className="mt-2 p-4 bg-surface-subtle rounded-lg border border-border prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: replaceTemplateVariables(previewContent.body, previewVariableData).replace(
                      /\n/g,
                      '<br />'
                    ),
                  }}
                />
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Variables replaced with {selectedRecipients.length > 0 ? 'first recipient data' : 'sample data'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
