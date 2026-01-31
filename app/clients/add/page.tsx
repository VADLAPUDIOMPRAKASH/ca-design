'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  KeyRound,
  Mail,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';
import type { Director } from '@/context/AppContext';

const STEPS = [
  { id: 1, label: 'Basic Info', key: 'basic' },
  { id: 2, label: 'Tax & Business', key: 'tax' },
  { id: 3, label: 'Address', key: 'address' },
  { id: 4, label: 'Services', key: 'services' },
  { id: 5, label: 'Directors', key: 'directors' },
  { id: 6, label: 'Share Credentials', key: 'credentials' },
] as const;

const BUSINESS_TYPES = ['Sole Proprietor', 'Partnership', 'LLP', 'Pvt Ltd', 'Public Ltd'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'Pending'];
const CA_SERVICES = [
  'TDS returns',
  'Audit service',
  'Company registration',
  'Compliances',
  'GST filing',
];

interface FormData {
  clientName: string;
  email: string;
  phone: string;
  alternateContact: string;
  companyName: string;
  businessType: string;
  panNumber: string;
  gstNumber: string;
  registrationDate: string;
  status: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  services: string[];
  sendWelcomeEmail: boolean;
  createPortalLogin: boolean;
  notes: string;
}

const emptyDirector: Director = { name: '', din: '', designation: '', email: '' };

export default function AddClientPage() {
  const router = useRouter();
  const { addClient } = useApp();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [directors, setDirectors] = useState<Director[]>([{ ...emptyDirector }]);

  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    email: '',
    phone: '',
    alternateContact: '',
    companyName: '',
    businessType: '',
    panNumber: '',
    gstNumber: '',
    registrationDate: '',
    status: 'Active',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
    services: [],
    sendWelcomeEmail: false,
    createPortalLogin: false,
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const updateField = (field: keyof FormData, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const addDirector = () => setDirectors((prev) => [...prev, { ...emptyDirector }]);
  const removeDirector = (idx: number) =>
    setDirectors((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  const updateDirector = (idx: number, field: keyof Director, value: string) => {
    setDirectors((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      addClient({
        name: formData.clientName,
        email: formData.email,
        phone: formData.phone,
        alternateContact: formData.alternateContact || undefined,
        categories: formData.services.length > 0 ? formData.services : [formData.businessType],
        companyName: formData.companyName,
        panNumber: formData.panNumber || undefined,
        gstNumber: formData.gstNumber || undefined,
        registrationDate: formData.registrationDate || undefined,
        businessType: formData.businessType,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        pinCode: formData.pinCode || undefined,
        status: formData.status as 'Active' | 'Inactive' | 'Pending',
        services: formData.services,
        directors: directors.filter((d) => d.name.trim()),
        notes: formData.notes || undefined,
      });
      showToast('Client added successfully!', 'success');
      if (formData.createPortalLogin) {
        setTimeout(() => router.push('/clients'), 1500);
      } else {
        router.push('/clients');
      }
    } catch {
      showToast('Failed to add client.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const goToStep = (step: number) => setCurrentStep(step);

  // Generated credentials for portal login (stable per session)
  const [portalPassword] = useState(() => `Temp${Math.random().toString(36).slice(2, 10)}!`);
  const portalUsername = formData.email || '';

  const copyCredentials = () => {
    const text = `Client Portal Login\nUsername: ${portalUsername}\nPassword: ${portalPassword}\n\nPlease change your password after first login.`;
    navigator.clipboard.writeText(text).then(() => showToast('Credentials copied to clipboard', 'success'));
  };

  return (
    <div>
      <div className="mb-3">
        <Link
          href="/clients"
          className="inline-flex items-center text-xs text-text-muted hover:text-text-primary mb-1.5"
        >
          <ArrowLeft size={14} className="mr-1.5 shrink-0" />
          Back to Clients
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-text-primary">Onboard New Client</h1>
        <p className="text-xs text-text-muted">Fill in the client details to add them to your system</p>
      </div>

      <Card padding="none">
        {/* Step progress tracker */}
        <div className="border-b border-border bg-surface-subtle/30 px-4 py-3">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              const isClickable = isComplete || currentStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => isClickable && goToStep(step.id)}
                    className={`flex items-center gap-2 shrink-0 transition-colors ${
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                        isComplete
                          ? 'border-primary bg-primary text-white'
                          : isActive
                            ? 'border-primary bg-primary text-white'
                            : 'border-border bg-surface text-text-muted'
                      }`}
                    >
                      {isComplete ? <Check size={14} strokeWidth={3} /> : step.id}
                    </span>
                    <span
                      className={`hidden xs:inline text-sm font-medium ${
                        isActive ? 'text-primary' : isComplete ? 'text-text-primary' : 'text-text-muted'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-4 sm:w-8 flex-shrink-0 rounded ${
                        isComplete ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="p-4 max-h-[calc(100vh-240px)] overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Basic Information</h2>
              <p className="text-sm text-text-muted">Enter the primary contact and company details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                    label="Client Name"
                    value={formData.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                    error={errors.clientName}
                    required
                    placeholder="John Doe"
                    size="compact"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    required
                    placeholder="Enter email address"
                    size="compact"
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    error={errors.phone}
                    required
                    placeholder="+91 9876543210"
                    size="compact"
                  />
                  <Input
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    error={errors.companyName}
                    required
                    placeholder="Acme Corporation"
                    size="compact"
                  />
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-0.5">
                      Business Type <span className="text-danger">*</span>
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => updateField('businessType', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface"
                    >
                      <option value="">Select business type</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.businessType && (
                      <p className="mt-1 text-sm text-danger">{errors.businessType}</p>
                    )}
                  </div>
                </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Tax & Business Information</h2>
              <p className="text-sm text-text-muted">PAN, GST and registration details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="PAN Number"
                    value={formData.panNumber}
                    onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    helperText="Format: ABCDE1234F"
                    size="compact"
                  />
                  <Input
                    label="GST Number"
                    value={formData.gstNumber}
                    onChange={(e) => updateField('gstNumber', e.target.value.toUpperCase())}
                    placeholder="22ABCDE1234F1Z5"
                    maxLength={15}
                    helperText="Format: 22ABCDE1234F1Z5"
                    size="compact"
                  />
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-0.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateField('status', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Registration Date"
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => updateField('registrationDate', e.target.value)}
                    size="compact"
                  />
                </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Address</h2>
              <p className="text-sm text-text-muted">Business or correspondence address</p>
              <div className="space-y-4">
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Street address, Building name"
                    size="compact"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input
                      label="City"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Mumbai"
                      size="compact"
                    />
                    <Input
                      label="State"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="Maharashtra"
                      size="compact"
                    />
                    <Input
                      label="Country"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="India"
                      size="compact"
                    />
                    <Input
                      label="Pincode"
                      value={formData.pinCode}
                      onChange={(e) => updateField('pinCode', e.target.value)}
                      placeholder="400001"
                      maxLength={6}
                      size="compact"
                    />
                  </div>
                </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Services</h2>
              <p className="text-sm text-text-muted">Select services this client uses. You can also set optional actions below.</p>
                <div className="flex flex-wrap gap-1.5">
                  {CA_SERVICES.map((service) => (
                    <label
                      key={service}
                      className={`inline-flex items-center px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${
                        formData.services.includes(service)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50 text-text-primary'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => toggleService(service)}
                        className="sr-only"
                      />
                      <span className="text-xs font-medium capitalize">{service}</span>
                    </label>
                  ))}
                </div>
              <div className="pt-4 space-y-3 border-t border-border mt-4">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendWelcomeEmail}
                      onChange={(e) => updateField('sendWelcomeEmail', e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-primary">Send welcome email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.createPortalLogin}
                      onChange={(e) => updateField('createPortalLogin', e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-primary">Create portal login</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    placeholder="Internal notes (optional)"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Director Details</h2>
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">Add directors or key personnel for this client</p>
                <Button variant="outline" size="sm" onClick={addDirector}>
                  <Plus size={16} className="mr-2" />
                  Add Director
                </Button>
              </div>
              <div className="space-y-4">
                {directors.map((dir, idx) => (
                  <Card key={idx} padding="md" className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <User size={18} className="text-primary" />
                      <span className="font-medium text-text-primary">Director {idx + 1}</span>
                      {directors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDirector(idx)}
                          className="ml-auto p-1.5 text-danger hover:bg-danger/10 rounded-lg"
                          aria-label="Remove director"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <Input
                        label="Name"
                        value={dir.name}
                        onChange={(e) => updateDirector(idx, 'name', e.target.value)}
                        placeholder="Director name"
                        size="compact"
                      />
                      <Input
                        label="DIN"
                        value={dir.din || ''}
                        onChange={(e) => updateDirector(idx, 'din', e.target.value)}
                        placeholder="Director Identification Number"
                        size="compact"
                      />
                      <Input
                        label="Designation"
                        value={dir.designation || ''}
                        onChange={(e) => updateDirector(idx, 'designation', e.target.value)}
                        placeholder="e.g. Managing Director"
                        size="compact"
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={dir.email || ''}
                        onChange={(e) => updateDirector(idx, 'email', e.target.value)}
                        placeholder="director@company.com"
                        size="compact"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Share Credentials</h2>
              <p className="text-sm text-text-muted">
                Share the client portal login credentials with {formData.clientName || 'your client'}. They can use these to access the portal.
              </p>

              {formData.createPortalLogin ? (
                <Card padding="md" className="bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound size={20} className="text-primary" />
                    <span className="font-medium text-text-primary">Client Portal Credentials</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">Username</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={portalUsername}
                          className="flex-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-surface font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(portalUsername);
                            showToast('Username copied', 'success');
                          }}
                          aria-label="Copy username"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">Temporary Password</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={portalPassword}
                          className="flex-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-surface font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(portalPassword);
                            showToast('Password copied', 'success');
                          }}
                          aria-label="Copy password"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">Ask the client to change this after first login</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" onClick={copyCredentials}>
                      <Copy size={16} className="mr-2" />
                      Copy All
                    </Button>
                    <Button variant="outline" onClick={() => showToast('Credentials will be emailed to client', 'success')}>
                      <Mail size={16} className="mr-2" />
                      Email to Client
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card padding="md" className="bg-surface-subtle border-border">
                  <div className="flex items-start gap-3">
                    <KeyRound size={20} className="text-text-muted mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">No portal login enabled</p>
                      <p className="text-sm text-text-muted mt-1">
                        You did not select &quot;Create portal login&quot; in the Services step. Go back to step 4 to enable it if you want to share credentials.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => goToStep(4)}>
                        Go to Services
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border-t border-border bg-surface-subtle/50">
          <Button variant="outline">Save as Draft</Button>
          <div className="flex gap-3">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
            ) : null}
            {currentStep < STEPS.length ? (
              <Button onClick={goNext}>
                Next <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isSubmitting}>
                Add Client
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
