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
  Plus,
  Eye,
  Mail,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';

export default function SendEmailPage() {
  const router = useRouter();
  const { clients, templates, addScheduledEmail } = useApp();
  const { showToast } = useToast();
  const [sendOption, setSendOption] = useState<'now' | 'later' | 'recurring'>('now');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
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
  });

  const availableClients = useMemo(() => {
    if (!recipientSearch) return clients;
    const query = recipientSearch.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.companyName.toLowerCase().includes(query)
    );
  }, [clients, recipientSearch]);

  const addRecipient = (email: string) => {
    if (!selectedRecipients.includes(email)) {
      setSelectedRecipients((prev) => [...prev, email]);
      setRecipientSearch('');
    }
  };

  const removeRecipient = (email: string) => {
    setSelectedRecipients((prev) => prev.filter((e) => e !== email));
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
    setFormData((prev) => ({
      ...prev,
      subject: template.subject,
      body: template.body,
    }));
    setShowTemplateModal(false);
    showToast('Template applied', 'success');
  };

  const handleSend = () => {
    if (!formData.subject || !formData.body || selectedRecipients.length === 0) {
      showToast('Please fill all required fields and select recipients', 'error');
      return;
    }

    if (sendOption === 'now') {
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
        type: sendOption,
        repeatFrequency: sendOption === 'recurring' ? formData.repeatFrequency : undefined,
        body: formData.body,
      });

      showToast(
        `Email scheduled for ${scheduleDateTime.toLocaleString()}`,
        'success'
      );
      setTimeout(() => router.push('/emails/scheduled'), 1500);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/emails" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to Email Management
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Send Email</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipients */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipients</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[44px]">
                    {selectedRecipients.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {email}
                        <button
                          onClick={() => removeRecipient(email)}
                          className="hover:text-primary-hover"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Search clients by name or email..."
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      className="flex-1 min-w-[200px] border-none outline-none"
                    />
                  </div>
                  {recipientSearch && availableClients.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {availableClients
                        .filter((c) => !selectedRecipients.includes(c.email))
                        .slice(0, 5)
                        .map((client) => (
                          <button
                            key={client.id}
                            onClick={() => addRecipient(client.email)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{client.name}</p>
                              <p className="text-sm text-gray-500">{client.email}</p>
                            </div>
                            <Plus size={16} className="text-gray-400" />
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allEmails = clients.map((c) => c.email);
                      setSelectedRecipients(allEmails);
                      showToast(`Added ${allEmails.length} clients`, 'success');
                    }}
                  >
                    <Users size={16} className="mr-2" />
                    Add All Clients
                  </Button>
                </div>
              </div>

              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                  CC / BCC (Optional)
                </summary>
                <div className="mt-2 space-y-2">
                  <Input label="CC" placeholder="cc@example.com" />
                  <Input label="BCC" placeholder="bcc@example.com" />
                </div>
              </details>
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
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Select Template</h3>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleUseTemplate(template)}
                      className="w-full p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-500">{template.category}</p>
                    </button>
                  ))}
                  {templates.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No templates available. Create one first.
                    </p>
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
                    Drag and drop files here, or{' '}
                    <button className="text-primary hover:underline">browse</button>
                  </p>
                  <p className="text-xs text-gray-500">Supported: PDF, DOC, XLS, Images</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline">Save as Draft</Button>
            <div className="flex gap-3">
              <Button variant="outline">
                <Eye size={18} className="mr-2" />
                Preview
              </Button>
              <Button variant="outline">
                <Mail size={18} className="mr-2" />
                Send Test Email
              </Button>
            </div>
          </div>
        </div>

        {/* Schedule & Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Options</h2>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="sendOption"
                  value="now"
                  checked={sendOption === 'now'}
                  onChange={() => setSendOption('now')}
                  className="mr-3 text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-gray-900">Send Now</div>
                  <div className="text-xs text-gray-500">Send immediately</div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="sendOption"
                  value="later"
                  checked={sendOption === 'later'}
                  onChange={() => setSendOption('later')}
                  className="mr-3 text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-gray-900">Schedule for Later</div>
                  <div className="text-xs text-gray-500">Send at specific date/time</div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="sendOption"
                  value="recurring"
                  checked={sendOption === 'recurring'}
                  onChange={() => setSendOption('recurring')}
                  className="mr-3 text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-gray-900">Recurring Schedule</div>
                  <div className="text-xs text-gray-500">Send repeatedly</div>
                </div>
              </label>
            </div>

            {/* Schedule for Later */}
            {sendOption === 'later' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, scheduleDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <Input
                    type="time"
                    value={formData.scheduleTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, scheduleTime: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Recurring Schedule */}
            {sendOption === 'recurring' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat Frequency
                  </label>
                  <select
                    value={formData.repeatFrequency}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, repeatFrequency: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Condition
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="endCondition" className="mr-2" />
                      <span className="text-sm">Never ends</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="endCondition" className="mr-2" />
                      <span className="text-sm">Ends on date</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="endCondition" className="mr-2" />
                      <span className="text-sm">Ends after occurrences</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Advanced Options */}
          <Card>
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 mb-4">
                Advanced Options
              </summary>
              <div className="space-y-4 pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.trackOpens}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, trackOpens: e.target.checked }))
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Track email opens</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.trackClicks}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, trackClicks: e.target.checked }))
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Track link clicks</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, priority: e.target.value }))
                    }
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

          {/* Send Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSend}
            disabled={!formData.subject || !formData.body || selectedRecipients.length === 0}
          >
            {sendOption === 'now' && (
              <>
                <Send size={18} className="mr-2" />
                Send Email
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
                Create Recurring Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
