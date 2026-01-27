'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Users, Mail, FileText, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useMemo } from 'react';

export default function Home() {
  const { clients, scheduledEmails } = useApp();

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === 'Active').length;
    const emailsSent = scheduledEmails.filter((e) => e.status === 'Sent').length;
    const pendingTasks = clients.filter((c) => c.status === 'Pending').length;

    return [
      { label: 'Total Clients', value: totalClients.toString(), icon: Users, color: 'text-primary' },
      { label: 'Active Clients', value: activeClients.toString(), icon: TrendingUp, color: 'text-success' },
      { label: 'Emails Sent', value: emailsSent.toString(), icon: Mail, color: 'text-secondary' },
      { label: 'Pending Tasks', value: pendingTasks.toString(), icon: FileText, color: 'text-warning' },
    ];
  }, [clients, scheduledEmails]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/clients/add">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left cursor-pointer">
              <Users className="text-primary mb-2" size={24} />
              <p className="font-medium text-gray-900">Add New Client</p>
              <p className="text-sm text-gray-500 mt-1">Onboard a new client</p>
            </div>
          </Link>
          <Link href="/emails/send">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left cursor-pointer">
              <Mail className="text-primary mb-2" size={24} />
              <p className="font-medium text-gray-900">Send Email</p>
              <p className="text-sm text-gray-500 mt-1">Compose and send email</p>
            </div>
          </Link>
          <Link href="/clients">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left cursor-pointer">
              <FileText className="text-primary mb-2" size={24} />
              <p className="font-medium text-gray-900">View Clients</p>
              <p className="text-sm text-gray-500 mt-1">Manage all clients</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
