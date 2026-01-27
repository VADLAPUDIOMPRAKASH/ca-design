'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, Eye, Send, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';

const templateCategories = [
  'Login Credentials',
  'Notifications',
  'Follow-ups',
  'Reminders',
  'General',
  'Custom',
];

const availableVariables = [
  { label: 'Client Name', value: '{{client_name}}' },
  { label: 'Company Name', value: '{{company_name}}' },
  { label: 'Email', value: '{{email}}' },
  { label: 'Phone', value: '{{phone}}' },
  { label: 'Username', value: '{{username}}' },
  { label: 'Password', value: '{{password}}' },
  { label: 'Login Link', value: '{{login_link}}' },
  { label: 'Date', value: '{{date}}' },
  { label: 'Custom Message', value: '{{custom_message}}' },
];

function CreateTemplateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get('id') || null;
  const { templates, addTemplate, updateTemplate } = useApp();
  const { showToast } = useToast();
  
  const existingTemplate = templateId ? templates.find((t) => t.id === Number(templateId)) : null;
  
  const [templateName, setTemplateName] = useState(existingTemplate?.name || '');
  const [category, setCategory] = useState(existingTemplate?.category || '');
  const [subject, setSubject] = useState(existingTemplate?.subject || '');
  const [emailBody, setEmailBody] = useState(existingTemplate?.body || '');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const insertVariable = (variable: string) => {
    setEmailBody((prev) => prev + variable);
  };

  const sampleData = {
    client_name: 'John Smith',
    company_name: 'Smith Enterprises',
    email: 'john@smith.com',
    phone: '+91 9876543210',
    username: 'johnsmith',
    password: 'TempPass123!',
    login_link: 'https://portal.example.com/login',
    date: new Date().toLocaleDateString(),
    custom_message: 'Your custom message here',
  };

  const previewBody = availableVariables.reduce((text, variable) => {
    const key = variable.value.replace(/[{}]/g, '') as keyof typeof sampleData;
    return text.replace(new RegExp(variable.value, 'g'), sampleData[key] || variable.value);
  }, emailBody);

  const handleSave = async () => {
    if (!templateName || !category || !subject || !emailBody) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (existingTemplate) {
        updateTemplate(existingTemplate.id, {
          name: templateName,
          category,
          subject,
          body: emailBody,
        });
        showToast('Template updated successfully', 'success');
      } else {
        addTemplate({
          name: templateName,
          category,
          subject,
          body: emailBody,
        });
        showToast('Template created successfully', 'success');
      }
      setTimeout(() => {
        router.push('/emails/templates');
      }, 1000);
    } catch (error) {
      showToast('Failed to save template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/emails/templates" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to Templates
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {existingTemplate ? 'Edit Email Template' : 'Create Email Template'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Input
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Welcome Email"
              required
            />
          </Card>

          <Card>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-danger">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select category</option>
                {templateCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Subject Line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Welcome to {{company_name}}"
              required
            />
          </Card>

          <Card>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Body <span className="text-danger">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Eye size={16} className="inline mr-1" />
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>
              </div>

              {showPreview ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[400px]">
                  <div className="mb-2 text-sm font-medium text-gray-700">Subject: {previewBody.replace(/{{.*?}}/g, (match) => {
                    const key = match.replace(/[{}]/g, '') as keyof typeof sampleData;
                    return sampleData[key] || match;
                  })}</div>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: previewBody.replace(/\n/g, '<br />') }} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Simple Rich Text Toolbar */}
                  <div className="border border-gray-300 rounded-t-lg p-2 bg-gray-50 flex items-center gap-2 flex-wrap">
                    <button className="p-1.5 hover:bg-gray-200 rounded" title="Bold">
                      <strong>B</strong>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded" title="Italic">
                      <em>I</em>
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded" title="Underline">
                      <u>U</u>
                    </button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <button className="p-1.5 hover:bg-gray-200 rounded" title="List">
                      • List
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded" title="Link">
                      🔗
                    </button>
                  </div>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={15}
                    placeholder="Enter your email body here. Use variables from the panel on the right."
                    className="w-full px-4 py-3 border-x border-b border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  showToast('Test email sent to your email address', 'success');
                }}
              >
                <Send size={18} className="mr-2" />
                Test Send
              </Button>
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!templateName || !category || !subject || !emailBody}
              >
                <Save size={18} className="mr-2" />
                {existingTemplate ? 'Update Template' : 'Save Template'}
              </Button>
            </div>
          </div>
        </div>

        {/* Variables Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dynamic Variables</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click on a variable to insert it into your email body
            </p>
            <div className="space-y-2">
              {availableVariables.map((variable) => (
                <button
                  key={variable.value}
                  onClick={() => insertVariable(variable.value)}
                  className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-primary/5 hover:border-primary transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">{variable.label}</div>
                  <div className="text-xs text-gray-500 font-mono">{variable.value}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CreateTemplatePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CreateTemplateForm />
    </Suspense>
  );
}
