'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  FileText,
  KeyRound,
  Plus,
  Settings,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Director } from '@/context/AppContext';

type TabKey = 'details' | 'directors' | 'login' | 'files' | 'settings';

const emptyDirector: Director = { name: '', din: '', designation: '', email: '', phone: '', pan: '', aadhar: '' };

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = Number(params.id);
  const { clients, updateClient, deleteClient } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [showAddDirector, setShowAddDirector] = useState(false);
  const [newDirector, setNewDirector] = useState<Director>({ ...emptyDirector });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const client = clients.find((c) => c.id === clientId);
  const directors = client?.directors ?? [];

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'directors', label: 'Directors List' },
    { key: 'login', label: 'Client Login' },
    { key: 'files', label: 'Files' },
    { key: 'settings', label: 'Settings' },
  ];

  const addDirector = () => {
    if (!newDirector.name.trim()) {
      showToast('Director name is required', 'error');
      return;
    }
    const updated = [...directors, { ...newDirector }];
    updateClient(clientId, { directors: updated });
    setNewDirector({ ...emptyDirector });
    setShowAddDirector(false);
    showToast('Director added successfully', 'success');
  };

  const removeDirector = (idx: number) => {
    const updated = directors.filter((_, i) => i !== idx);
    updateClient(clientId, { directors: updated });
    showToast('Director removed', 'success');
  };

  const handleDeleteClient = () => {
    deleteClient(clientId);
    showToast('Client deleted successfully', 'success');
    router.push('/clients');
    setDeleteModalOpen(false);
  };

  if (!client) {
    return (
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center text-sm text-text-muted hover:text-text-primary mb-4"
        >
          <ArrowLeft size={16} className="mr-2 shrink-0" />
          Back
        </Link>
        <Card className="p-12">
          <EmptyState
            icon={Users}
            title="Client not found"
            description="The client you are looking for does not exist or has been removed."
            actionLabel="Back to Clients"
            actionHref="/clients"
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header with breadcrumb and Back */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
            <Link href="/clients" className="hover:text-text-primary">
              Client Management
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Client Details</span>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center text-sm text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={16} className="mr-2 shrink-0" />
            Back
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Card padding="none">
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'details' && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-1">Client Details</h2>
              <p className="text-sm text-text-muted mb-6">Complete information for {client.companyName}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xs font-semibold text-text-primary mb-2">Basic Information</h3>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-text-muted">Client Name</dt><dd className="font-medium text-text-primary">{client.name}</dd></div>
                    <div><dt className="text-text-muted">Company</dt><dd className="font-medium text-text-primary">{client.companyName}</dd></div>
                    <div><dt className="text-text-muted">Business Type</dt><dd className="font-medium text-text-primary">{client.businessType || '—'}</dd></div>
                    <div><dt className="text-text-muted">Email</dt><dd className="font-medium text-text-primary">{client.email}</dd></div>
                    <div><dt className="text-text-muted">Phone</dt><dd className="font-medium text-text-primary">{client.phone}</dd></div>
                    <div><dt className="text-text-muted">Alternate Contact</dt><dd className="font-medium text-text-primary">{client.alternateContact || '—'}</dd></div>
                    <div><dt className="text-text-muted">Status</dt><dd><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-success/10 text-success' : client.status === 'Inactive' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>{client.status}</span></dd></div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-text-primary mb-2">Tax & Business</h3>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-text-muted">PAN Number</dt><dd className="font-medium text-text-primary">{client.panNumber || '—'}</dd></div>
                    <div><dt className="text-text-muted">GST Number</dt><dd className="font-medium text-text-primary">{client.gstNumber || '—'}</dd></div>
                    <div><dt className="text-text-muted">Registration Date</dt><dd className="font-medium text-text-primary">{client.registrationDate ? format(new Date(client.registrationDate), 'MMM dd, yyyy') : '—'}</dd></div>
                    <div><dt className="text-text-muted">Added Date</dt><dd className="font-medium text-text-primary">{format(new Date(client.addedDate), 'MMM dd, yyyy')}</dd></div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-text-primary mb-2">Address</h3>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-text-muted">Address</dt><dd className="font-medium text-text-primary">{client.address || '—'}</dd></div>
                    <div><dt className="text-text-muted">City</dt><dd className="font-medium text-text-primary">{client.city || '—'}</dd></div>
                    <div><dt className="text-text-muted">State</dt><dd className="font-medium text-text-primary">{client.state || '—'}</dd></div>
                    <div><dt className="text-text-muted">Country</dt><dd className="font-medium text-text-primary">{client.country || '—'}</dd></div>
                    <div><dt className="text-text-muted">Pincode</dt><dd className="font-medium text-text-primary">{client.pinCode || '—'}</dd></div>
                  </dl>
                </div>
              </div>
              {(client.categories?.length || client.services?.length || client.notes) ? (
                <div className="mt-4 pt-4 border-t border-border">
                  {client.categories?.length ? (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Categories</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {client.categories.map((c) => (
                          <span key={c} className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {client.services?.length ? (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Services</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {client.services.map((s) => (
                          <span key={s} className="px-2 py-1 text-xs font-medium bg-surface-subtle text-text-primary rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {client.notes ? (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Notes</h3>
                      <p className="text-sm text-text-primary">{client.notes}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'directors' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-text-primary mb-0.5">Director List</h2>
                  <p className="text-sm text-text-muted">Director information for {client.companyName}</p>
                </div>
                <Button size="sm" onClick={() => setShowAddDirector(true)}>
                  <Plus size={16} className="mr-2" />
                  Add Director
                </Button>
              </div>

              {showAddDirector && (
                <Card className="mb-4 p-3 bg-primary/5 border-primary/20">
                  <h3 className="text-sm font-semibold text-text-primary mb-4">Add New Director</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input label="Name" value={newDirector.name} onChange={(e) => setNewDirector((d) => ({ ...d, name: e.target.value }))} placeholder="Director name" size="compact" required />
                    <Input label="Email" type="email" value={newDirector.email || ''} onChange={(e) => setNewDirector((d) => ({ ...d, email: e.target.value }))} placeholder="email@example.com" size="compact" />
                    <Input label="Phone" value={newDirector.phone || ''} onChange={(e) => setNewDirector((d) => ({ ...d, phone: e.target.value }))} placeholder="+91 9876543210" size="compact" />
                    <Input label="Designation" value={newDirector.designation || ''} onChange={(e) => setNewDirector((d) => ({ ...d, designation: e.target.value }))} placeholder="e.g. Director" size="compact" />
                    <Input label="DIN" value={newDirector.din || ''} onChange={(e) => setNewDirector((d) => ({ ...d, din: e.target.value }))} placeholder="Director ID" size="compact" />
                    <Input label="PAN" value={newDirector.pan || ''} onChange={(e) => setNewDirector((d) => ({ ...d, pan: e.target.value }))} placeholder="PAN number" size="compact" />
                    <Input label="Aadhar" value={newDirector.aadhar || ''} onChange={(e) => setNewDirector((d) => ({ ...d, aadhar: e.target.value }))} placeholder="Aadhar number" size="compact" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={addDirector}>Save Director</Button>
                    <Button variant="outline" size="sm" onClick={() => { setShowAddDirector(false); setNewDirector({ ...emptyDirector }); }}>Cancel</Button>
                  </div>
                </Card>
              )}

              {directors.length === 0 && !showAddDirector ? (
                <EmptyState
                  icon={Users}
                  title="No directors"
                  description="No director information has been added for this client. Click Add Director to add one."
                  actionLabel="Add Director"
                  onAction={() => setShowAddDirector(true)}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-subtle border-b border-border">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">#</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Designation</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">DIN</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">PAN</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Aadhar</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                      {directors.map((dir, idx) => (
                        <tr key={idx} className="hover:bg-surface-subtle/50 transition-colors">
                          <td className="px-4 py-2 text-sm text-text-primary">{idx + 1}</td>
                          <td className="px-4 py-2 text-sm font-medium text-text-primary">{dir.name}</td>
                          <td className="px-4 py-2 text-sm text-text-primary">{dir.email || '—'}</td>
                          <td className="px-4 py-2 text-sm text-text-primary">{dir.phone || '—'}</td>
                          <td className="px-4 py-2 text-sm text-text-primary">{dir.designation || '—'}</td>
                          <td className="px-4 py-2 text-sm text-text-primary">{dir.din || '—'}</td>
                          <td className="px-4 py-2 text-sm text-text-primary">{dir.pan || '—'}</td>
                          <td className="px-4 py-2 text-sm text-text-primary">{dir.aadhar || '—'}</td>
                          <td className="px-4 py-2 text-right">
                            <button onClick={() => removeDirector(idx)} className="p-2 text-danger hover:bg-danger/10 rounded-lg" aria-label="Remove director">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'login' && (
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Client Login</h2>
              <p className="text-xs text-text-muted mb-4">
                Manage client portal access for {client.companyName}
              </p>
              <Card className="bg-surface-subtle/50 border-border">
                <div className="flex items-start gap-4">
                  <KeyRound size={24} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-1">Portal credentials</p>
                    <p className="text-sm text-text-muted mb-4">
                      Create or manage login credentials for the client portal. Clients can use these to access their documents and communications.
                    </p>
                    <Link href={`/clients/${client.id}/login`}>
                      <Button size="sm">Create / Manage Login</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Files</h2>
              <p className="text-xs text-text-muted mb-4">
                Documents and files for {client.companyName}
              </p>
              <EmptyState
                icon={FileText}
                title="No files"
                description="No files have been uploaded for this client yet."
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Settings</h2>
              <p className="text-xs text-text-muted mb-4">
                Manage client settings and actions
              </p>
              <div className="space-y-3 max-w-xl">
                <Card className="p-4 border-border">
                  <div className="flex items-start gap-4">
                    <Settings size={24} className="text-text-muted shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary mb-1">General</h3>
                      <p className="text-sm text-text-muted mb-3">Update client status, contact details, or other general settings.</p>
                      <Button variant="outline" size="sm" disabled>Edit Client (Coming soon)</Button>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-border">
                  <div className="flex items-start gap-4">
                    <User size={24} className="text-text-muted shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary mb-1">Export Data</h3>
                      <p className="text-sm text-text-muted mb-3">Download client details and documents as a file.</p>
                      <Button variant="outline" size="sm" onClick={() => showToast('Export feature coming soon', 'success')}>Export Client Data</Button>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-danger/20 bg-danger/5">
                  <div className="flex items-start gap-4">
                    <Trash2 size={24} className="text-danger shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-danger mb-1">Delete Client</h3>
                      <p className="text-sm text-text-muted mb-3">Permanently remove this client and all associated data. This action cannot be undone.</p>
                      <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>Delete Client</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Client"
        message={`Are you sure you want to delete ${client.name}? This will permanently remove the client and all associated data. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteClient}
      />
    </div>
  );
}
