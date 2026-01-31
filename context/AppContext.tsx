'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Director {
  name: string;
  din?: string;
  designation?: string;
  email?: string;
  phone?: string;
  pan?: string;
  aadhar?: string;
}

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
  country?: string;
  pinCode?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  services?: string[];
  directors?: Director[];
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
  waitingForReply?: boolean; // For sent emails - track if awaiting client response
}

export interface ReceivedEmail {
  id: number;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  body: string;
  receivedAt: Date;
  isRead: boolean;
  isStarred?: boolean;
  isArchived?: boolean;
  hasAttachment?: boolean;
  clientId?: number; // Link to client if sender is a known client
}

interface AppContextType {
  clients: Client[];
  templates: EmailTemplate[];
  scheduledEmails: ScheduledEmail[];
  receivedEmails: ReceivedEmail[];
  addClient: (client: Omit<Client, 'id' | 'addedDate'>) => void;
  updateClient: (id: number, client: Partial<Client>) => void;
  deleteClient: (id: number) => void;
  addTemplate: (template: Omit<EmailTemplate, 'id' | 'lastModified' | 'usageCount'>) => void;
  updateTemplate: (id: number, template: Partial<EmailTemplate>) => void;
  deleteTemplate: (id: number) => void;
  addScheduledEmail: (email: Omit<ScheduledEmail, 'id'>) => void;
  updateScheduledEmail: (id: number, email: Partial<ScheduledEmail>) => void;
  deleteScheduledEmail: (id: number) => void;
  markReceivedEmailRead: (id: number, isRead?: boolean) => void;
  updateReceivedEmail: (id: number, updates: Partial<ReceivedEmail>) => void;
  deleteReceivedEmail: (id: number) => void;
  bulkUpdateReceivedEmails: (ids: number[], updates: Partial<ReceivedEmail>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate 100 demo clients: 50 Startups, 25 Company, 15 Individual, 10 Partnership (for "30 of 50 startups" demo)
const generateDemoClients = (): Client[] => {
  const names = ['John', 'Jane', 'Raj', 'Priya', 'Amit', 'Sita', 'Vikram', 'Anjali', 'Rohan', 'Kavita', 'Arun', 'Deepa', 'Manoj', 'Neha', 'Sanjay', 'Pooja', 'Rahul', 'Swati', 'Kiran', 'Meera'];
  const surnames = ['Smith', 'Doe', 'Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Nair', 'Gupta', 'Mehta', 'Joshi', 'Desai', 'Shah', 'Rao', 'Verma', 'Agarwal', 'Malhotra', 'Kapoor', 'Chopra', 'Sethi'];
  const companies = ['Tech', 'Digital', 'Innovations', 'Solutions', 'Labs', 'Software', 'Apps', 'Cloud', 'Data', 'AI'];
  const statuses = ['Active', 'Active', 'Active', 'Inactive', 'Pending'] as const;
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];

  const clients: Client[] = [];
  let id = 1;
  const distributions = [
    { category: 'Startup' as const, count: 50 },
    { category: 'Company' as const, count: 25 },
    { category: 'Individual' as const, count: 15 },
    { category: 'Partnership' as const, count: 10 },
  ];
  const designations = ['Director', 'Managing Director', 'Executive Director', 'Director'];
  let idx = 0;
  for (const { category, count } of distributions) {
    for (let i = 0; i < count; i++) {
      const name = `${names[idx % names.length]} ${surnames[Math.floor(idx / names.length) % surnames.length]}`;
      const email = `client${idx + 1}@example.com`;
      const status = statuses[idx % statuses.length];
      const addedDate = new Date(2024, 0, 1 + (idx % 28));
      const companyName = `${name.split(' ')[0]} ${companies[idx % companies.length]}`;
      // Add directors for first 30 clients (demo data for Client Details view)
      const directorsData: { name: string; din?: string; designation?: string; email?: string; phone?: string; pan?: string; aadhar?: string }[] = idx < 30 ? [
        {
          name: names[idx % names.length] + ' ' + surnames[(idx + 1) % surnames.length],
          email: `director${idx + 1}@example.com`,
          phone: `+91 6300${String(400000 + idx).padStart(6, '0')}`,
          designation: designations[idx % designations.length],
          din: String(12345678 + idx),
          pan: `ABCDE${String(1234 + idx)}F`,
          aadhar: `${String(1234 + idx).padStart(4, '0')} ${String(5678 + idx).padStart(4, '0')} ${String(9012 + idx).padStart(4, '0')}`,
        },
      ] : [];
      clients.push({
        id: id++,
        name,
        email,
        phone: `+91 98765${String(43210 + idx).padStart(5, '0')}`,
        categories: [category],
        companyName,
        businessType: category === 'Startup' ? 'LLP' : 'Pvt Ltd',
        status,
        addedDate,
        city: cities[idx % cities.length],
        state: 'State',
        pinCode: String(400001 + (idx % 100000)).slice(0, 6),
        directors: directorsData.length > 0 ? directorsData : undefined,
      });
      idx++;
    }
  }
  return clients;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(generateDemoClients);

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
    {
      id: 2,
      subject: 'Document Request - GST Filing Jan 2024',
      recipients: ['client1@example.com'],
      recipientsCount: 1,
      scheduleDate: new Date('2024-01-20T09:00:00'),
      status: 'Sent',
      type: 'scheduled',
      body: 'Dear John,\n\nPlease submit the required documents for GST filing by Jan 25.\n\nRegards, CA',
      waitingForReply: true,
    },
    {
      id: 3,
      subject: 'TDS Certificate - Q3 Request',
      recipients: ['client8@example.com'],
      recipientsCount: 1,
      scheduleDate: new Date('2024-01-18T14:30:00'),
      status: 'Sent',
      type: 'scheduled',
      body: 'Dear Priya,\n\nYour TDS certificate for Q3 is ready. Please collect from our office.\n\nRegards, CA',
      waitingForReply: false,
    },
    {
      id: 4,
      subject: 'ITR Filing - Documents Required',
      recipients: ['client2@example.com', 'client15@example.com'],
      recipientsCount: 2,
      scheduleDate: new Date('2024-01-15T11:00:00'),
      status: 'Sent',
      type: 'scheduled',
      body: 'Dear Client,\n\nPlease share the following documents for ITR filing: Form 16, Bank statements, Investment proofs.\n\nRegards, CA',
      waitingForReply: true,
    },
    {
      id: 5,
      subject: 'Audit Timeline - FY 2023-24',
      recipients: ['client15@example.com'],
      recipientsCount: 1,
      scheduleDate: new Date('2024-01-10T10:00:00'),
      status: 'Sent',
      type: 'scheduled',
      body: 'Dear Raj,\n\nKindly confirm the audit schedule for FY 2023-24.\n\nRegards, CA',
      waitingForReply: true,
    },
  ]);

  const [receivedEmails, setReceivedEmails] = useState<ReceivedEmail[]>([
    {
      id: 1,
      from: 'client1@example.com',
      fromName: 'John Smith',
      to: 'ca@platform.com',
      subject: 'Documents for GST filing - Jan 2024',
      body: 'Dear Sir,\n\nPlease find attached the required documents for our GST filing for January 2024.\n\nLet me know if you need anything else.\n\nBest regards,\nJohn Smith',
      receivedAt: new Date('2024-01-25T09:30:00'),
      isRead: false,
      isStarred: true,
      isArchived: false,
      hasAttachment: true,
      clientId: 1,
    },
    {
      id: 2,
      from: 'client2@example.com',
      fromName: 'Jane Doe',
      to: 'ca@platform.com',
      subject: 'Query regarding ITR filing',
      body: 'Hello,\n\nI have a few questions regarding my Income Tax Return filing for FY 2023-24. Could you please schedule a call?\n\nThanks,\nJane Doe',
      receivedAt: new Date('2024-01-24T14:20:00'),
      isRead: true,
      isStarred: false,
      isArchived: false,
      clientId: 2,
    },
    {
      id: 3,
      from: 'client15@example.com',
      fromName: 'Raj Kumar',
      to: 'ca@platform.com',
      subject: 'Re: Audit documents submission',
      body: 'Dear CA,\n\nThank you for your reminder. I have compiled all the audit documents and will courier them by tomorrow.\n\nRegards,\nRaj Kumar',
      receivedAt: new Date('2024-01-23T11:00:00'),
      isRead: true,
      isStarred: true,
      isArchived: true,
      hasAttachment: false,
      clientId: 15,
    },
    {
      id: 4,
      from: 'client8@example.com',
      fromName: 'Priya Sharma',
      to: 'ca@platform.com',
      subject: 'TDS certificate request',
      body: 'Hi,\n\nCould you please issue the TDS certificate for Q3? I need it for my records.\n\nThank you,\nPriya Sharma',
      receivedAt: new Date('2024-01-22T16:45:00'),
      isRead: false,
      isStarred: false,
      isArchived: false,
      clientId: 8,
    },
    {
      id: 5,
      from: 'unknown@external.com',
      fromName: 'Unknown Sender',
      to: 'ca@platform.com',
      subject: 'Inquiry about CA services',
      body: 'Hello,\n\nI am looking for CA services for my startup. Could you please share your service details and pricing?\n\nBest regards',
      receivedAt: new Date('2024-01-21T10:15:00'),
      isRead: false,
      isStarred: false,
      isArchived: false,
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

  const markReceivedEmailRead = useCallback((id: number, isRead = true) => {
    setReceivedEmails((prev) =>
      prev.map((email) => (email.id === id ? { ...email, isRead } : email))
    );
  }, []);

  const updateReceivedEmail = useCallback((id: number, updates: Partial<ReceivedEmail>) => {
    setReceivedEmails((prev) =>
      prev.map((email) => (email.id === id ? { ...email, ...updates } : email))
    );
  }, []);

  const deleteReceivedEmail = useCallback((id: number) => {
    setReceivedEmails((prev) => prev.filter((email) => email.id !== id));
  }, []);

  const bulkUpdateReceivedEmails = useCallback(
    (ids: number[], updates: Partial<ReceivedEmail>) => {
      const idSet = new Set(ids);
      setReceivedEmails((prev) =>
        prev.map((email) =>
          idSet.has(email.id) ? { ...email, ...updates } : email
        )
      );
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        clients,
        templates,
        scheduledEmails,
        receivedEmails,
        addClient,
        updateClient,
        deleteClient,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        addScheduledEmail,
        updateScheduledEmail,
        deleteScheduledEmail,
        markReceivedEmailRead,
        updateReceivedEmail,
        deleteReceivedEmail,
        bulkUpdateReceivedEmails,
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
