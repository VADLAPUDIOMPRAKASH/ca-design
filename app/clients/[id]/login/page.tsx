'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Eye, EyeOff, Copy, Check, Key } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';

export default function CreateClientLoginPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = Number(params.id);
  const { clients } = useApp();
  const { showToast } = useToast();
  
  const client = clients.find((c) => c.id === clientId);
  
  const [formData, setFormData] = useState({
    username: client?.email.split('@')[0] || '',
    email: client?.email || '',
    password: '',
    confirmPassword: '',
    accessLevel: '',
    expiryDate: '',
    sendCredentials: true,
    requirePasswordChange: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [credentialsCreated, setCredentialsCreated] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    setFormData((prev) => ({ ...prev, password: password }));
    setPasswordStrength(5);
  };

  const handleSubmit = () => {
    if (!formData.username || !formData.password || formData.password !== formData.confirmPassword) {
      showToast('Please fill all required fields correctly', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    // In a real app, this would call an API
    setCredentialsCreated(true);
    showToast('Client login created successfully!', 'success');
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-danger';
    if (passwordStrength <= 3) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  if (credentialsCreated) {
    return (
      <div>
        <div className="mb-6">
          <Link href="/clients" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={16} className="mr-2" />
            Back to Clients
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Login Created Successfully</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-success" size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Client Portal Login Created
            </h2>
            <p className="text-gray-600">
              Login credentials have been {formData.sendCredentials ? 'sent via email' : 'generated'} for {client?.name}
            </p>
          </div>

          {!formData.sendCredentials && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.username}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg"
                  />
                  <Button variant="outline" size="sm">
                    <Copy size={16} className="mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.password}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg"
                  />
                  <Button variant="outline" size="sm">
                    <Copy size={16} className="mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setCredentialsCreated(false)}>
              Create Another
            </Button>
            <Link href="/clients" className="flex-1">
              <Button className="w-full">Done</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/clients" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to Clients
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Client Portal Login</h1>
        <p className="text-gray-600 mt-1">Set up login credentials for client portal access</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{client?.name || 'Client'}</h2>
              <p className="text-sm text-gray-600">{client?.companyName || 'Company'}</p>
            </div>

            <div className="space-y-6">
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Auto-suggested from email"
                helperText="Username will be used for login"
                required
              />
              {!formData.username && client?.email && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, username: client.email.split('@')[0] }))}
                  className="text-sm text-primary hover:underline"
                >
                  Use email prefix as username
                </button>
              )}

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-sm text-primary hover:underline"
                  >
                    Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {getStrengthLabel()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-sm text-danger">Passwords do not match</p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Level <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.accessLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, accessLevel: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select access level</option>
                  <option value="view-only">View Only</option>
                  <option value="full-access">Full Access</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Set Expiry Date (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
                  }
                  helperText="Leave empty for permanent access"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sendCredentials}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sendCredentials: e.target.checked }))
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Send login credentials via email
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requirePasswordChange}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requirePasswordChange: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Require password change on first login
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <Link href="/clients" className="flex-1">
                <Button variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={
                  !formData.username ||
                  !formData.password ||
                  formData.password !== formData.confirmPassword ||
                  !formData.accessLevel
                }
              >
                <Key size={18} className="mr-2" />
                Create Login
              </Button>
            </div>
          </Card>
        </div>

        {/* Email Preview Sidebar */}
        {formData.sendCredentials && (
          <div className="lg:col-span-1">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                <button
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  className="text-sm text-primary hover:underline"
                >
                  {showEmailPreview ? 'Hide' : 'Show'}
                </button>
              </div>
              {showEmailPreview && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="text-xs text-gray-500 mb-2">Subject: Your Client Portal Login Credentials</div>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>Dear John Smith,</p>
                    <p>Your client portal login credentials have been created:</p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><strong>Username:</strong> {formData.username || 'username'}</p>
                      <p><strong>Password:</strong> {formData.password ? '••••••••' : 'password'}</p>
                    </div>
                    <p>Please keep these credentials secure.</p>
                  </div>
                </div>
              )}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Email template can be customized in Settings
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
