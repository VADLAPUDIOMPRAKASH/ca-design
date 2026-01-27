'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  alternateContact?: string;
  categories: string[];
  companyName: string;
  panNumber?: string;
  gstNumber?: string;
  registrationDate?: string;
  businessType: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  addedDate: Date;
  notes?: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  category: string;
  subject: string;
  body: string;
  lastModified: Date;
  usageCount: number;
}

export interface ScheduledEmail {
  id: number;
  subject: string;
  recipients: string[];
  recipientsCount: number;
  scheduleDate: Date;
  status: 'Pending' | 'Sending' | 'Sent' | 'Failed';
  type: 'scheduled' | 'recurring';
  repeatFrequency?: string;
  body: string;
}

interface AppContextType {
  clients: Client[];
  templates: EmailTemplate[];
  scheduledEmails: ScheduledEmail[];
  addClient: (client: Omit<Client, 'id' | 'addedDate'>) => void;
  updateClient: (id: number, client: Partial<Client>) => void;
  deleteClient: (id: number) => void;
  addTemplate: (template: Omit<EmailTemplate, 'id' | 'lastModified' | 'usageCount'>) => void;
  updateTemplate: (id: number, template: Partial<EmailTemplate>) => void;
  deleteTemplate: (id: number) => void;
  addScheduledEmail: (email: Omit<ScheduledEmail, 'id'>) => void;
  updateScheduledEmail: (id: number, email: Partial<ScheduledEmail>) => void;
  deleteScheduledEmail: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'john@smith.com',
      phone: '+91 9876543210',
      categories: ['Company'],
      companyName: 'Smith Enterprises',
      businessType: 'Pvt Ltd',
      status: 'Active',
      addedDate: new Date('2024-01-15'),
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400001',
    },
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@doe.com',
      phone: '+91 9876543220',
      categories: ['Individual'],
      companyName: 'Doe Consultancy',
      businessType: 'Sole Proprietor',
      status: 'Active',
      addedDate: new Date('2024-01-20'),
      city: 'Delhi',
      state: 'Delhi',
      pinCode: '110001',
    },
    {
      id: 3,
      name: 'Raj Kumar',
      email: 'raj@kumar.com',
      phone: '+91 9876543230',
      categories: ['Startup'],
      companyName: 'Kumar Tech Solutions',
      businessType: 'LLP',
      status: 'Pending',
      addedDate: new Date('2024-01-25'),
      city: 'Bangalore',
      state: 'Karnataka',
      pinCode: '560001',
    },
  ]);

  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 1,
      name: 'Welcome & Login Credentials',
      category: 'Login Credentials',
      subject: 'Welcome to {{company_name}} - Your Login Credentials',
      body: 'Dear {{client_name}},\n\nWelcome! Your login credentials:\n\nUsername: {{username}}\nPassword: {{password}}\n\nLogin at: {{login_link}}',
      lastModified: new Date('2024-01-20'),
      usageCount: 45,
    },
    {
      id: 2,
      name: 'Document Request Reminder',
      category: 'Reminders',
      subject: 'Document Request - {{company_name}}',
      body: 'Dear {{client_name}},\n\nPlease submit the requested documents by {{date}}.\n\nThank you.',
      lastModified: new Date('2024-01-18'),
      usageCount: 23,
    },
  ]);

  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([
    {
      id: 1,
      subject: 'Monthly GST Reminder',
      recipients: ['john@smith.com', 'jane@doe.com'],
      recipientsCount: 45,
      scheduleDate: new Date('2024-02-01T10:00:00'),
      status: 'Pending',
      type: 'recurring',
      repeatFrequency: 'Monthly',
      body: 'This is a monthly GST reminder email.',
    },
  ]);

  const addClient = useCallback((client: Omit<Client, 'id' | 'addedDate'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now(),
      addedDate: new Date(),
      status: client.status || 'Active',
    };
    setClients((prev) => [...prev, newClient]);
    return newClient.id;
  }, []);

  const updateClient = useCallback((id: number, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) => (client.id === id ? { ...client, ...updates } : client))
    );
  }, []);

  const deleteClient = useCallback((id: number) => {
    setClients((prev) => prev.filter((client) => client.id !== id));
  }, []);

  const addTemplate = useCallback((template: Omit<EmailTemplate, 'id' | 'lastModified' | 'usageCount'>) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now(),
      lastModified: new Date(),
      usageCount: 0,
    };
    setTemplates((prev) => [...prev, newTemplate]);
    return newTemplate.id;
  }, []);

  const updateTemplate = useCallback((id: number, updates: Partial<EmailTemplate>) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id ? { ...template, ...updates, lastModified: new Date() } : template
      )
    );
  }, []);

  const deleteTemplate = useCallback((id: number) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
  }, []);

  const addScheduledEmail = useCallback((email: Omit<ScheduledEmail, 'id'>) => {
    const newEmail: ScheduledEmail = {
      ...email,
      id: Date.now(),
    };
    setScheduledEmails((prev) => [...prev, newEmail]);
    return newEmail.id;
  }, []);

  const updateScheduledEmail = useCallback((id: number, updates: Partial<ScheduledEmail>) => {
    setScheduledEmails((prev) =>
      prev.map((email) => (email.id === id ? { ...email, ...updates } : email))
    );
  }, []);

  const deleteScheduledEmail = useCallback((id: number) => {
    setScheduledEmails((prev) => prev.filter((email) => email.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        clients,
        templates,
        scheduledEmails,
        addClient,
        updateClient,
        deleteClient,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        addScheduledEmail,
        updateScheduledEmail,
        deleteScheduledEmail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
