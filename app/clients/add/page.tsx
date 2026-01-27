'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';

type Step = 1 | 2 | 3;

interface FormData {
  // Step 1
  clientName: string;
  email: string;
  phone: string;
  alternateContact: string;
  categories: string[];
  
  // Step 2
  companyName: string;
  panNumber: string;
  gstNumber: string;
  registrationDate: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  
  // Step 3
  sendWelcomeEmail: boolean;
  createPortalLogin: boolean;
  notes: string;
}

export default function AddClientPage() {
  const router = useRouter();
  const { addClient } = useApp();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    email: '',
    phone: '',
    alternateContact: '',
    categories: [],
    companyName: '',
    panNumber: '',
    gstNumber: '',
    registrationDate: '',
    businessType: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    sendWelcomeEmail: false,
    createPortalLogin: false,
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const categories = ['Individual', 'Partnership', 'Company', 'Startup', 'LLP'];
  const businessTypes = ['Sole Proprietor', 'Partnership', 'LLP', 'Pvt Ltd', 'Public Ltd'];

  const validateStep = (step: Step): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }

    if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep((prev) => (prev + 1) as Step);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // Add client to context
      addClient({
        name: formData.clientName,
        email: formData.email,
        phone: formData.phone,
        alternateContact: formData.alternateContact || undefined,
        categories: formData.categories,
        companyName: formData.companyName,
        panNumber: formData.panNumber || undefined,
        gstNumber: formData.gstNumber || undefined,
        registrationDate: formData.registrationDate || undefined,
        businessType: formData.businessType,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pinCode: formData.pinCode || undefined,
        status: 'Active',
        notes: formData.notes || undefined,
      });

      showToast('Client added successfully!', 'success');
      
      // Handle post-submission actions
      if (formData.createPortalLogin) {
        // Redirect to create login page (would need client ID in real app)
        setTimeout(() => {
          router.push('/clients');
        }, 1500);
      } else {
        router.push('/clients');
      }
    } catch (error) {
      showToast('Failed to add client. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/clients" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to Clients
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
        <p className="text-gray-600 mt-1">Onboard a new client to your platform</p>
      </div>

      {/* Progress Indicator */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    currentStep >= step
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <Check size={20} /> : step}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {step === 1 && 'Basic Info'}
                    {step === 2 && 'Company Details'}
                    {step === 3 && 'Confirmation'}
                  </p>
                </div>
              </div>
              {step < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Form Steps */}
      <Card className="max-w-3xl mx-auto">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
            <Input
              label="Client Name"
              value={formData.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              error={errors.clientName}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>+91 (India)</option>
                  <option>+1 (USA)</option>
                </select>
              </div>
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                error={errors.phone}
                required
              />
            </div>

            <Input
              label="Alternate Contact"
              value={formData.alternateContact}
              onChange={(e) => updateField('alternateContact', e.target.value)}
              helperText="Optional secondary contact number"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories/Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.categories.includes(category)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Company Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Company Details</h2>
            
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              error={errors.companyName}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="PAN Number"
                value={formData.panNumber}
                onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                helperText="Format: ABCDE1234F"
              />
              <Input
                label="GST Number"
                value={formData.gstNumber}
                onChange={(e) => updateField('gstNumber', e.target.value.toUpperCase())}
                placeholder="29ABCDE1234F1Z5"
                maxLength={15}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date
                </label>
                <Input
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => updateField('registrationDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => updateField('businessType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.businessType && (
                  <p className="mt-1 text-sm text-danger">{errors.businessType}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
              />
              <Input
                label="PIN Code"
                value={formData.pinCode}
                onChange={(e) => updateField('pinCode', e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client Name</p>
                  <p className="font-medium">{formData.clientName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{formData.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{formData.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{formData.companyName || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sendWelcomeEmail}
                  onChange={(e) => updateField('sendWelcomeEmail', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Send welcome email to client
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.createPortalLogin}
                  onChange={(e) => updateField('createPortalLogin', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Create client portal login
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internal Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
                placeholder="Add any internal notes about this client..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Save as Draft</Button>
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} size="lg" isLoading={isSubmitting}>
                Add Client
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
