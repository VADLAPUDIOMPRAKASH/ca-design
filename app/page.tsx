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
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="sm" className="hover:shadow-elevated transition-shadow duration-comfort">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-0.5">{stat.label}</p>
                  <p className="text-lg font-bold text-text-primary">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br from-surface-subtle to-surface ${stat.color}`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card padding="md">
        <h2 className="text-base font-semibold text-text-primary mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          <Link href="/clients/add">
            <div className="p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-comfort text-left cursor-pointer group">
              <div className="p-2 bg-primary-light/50 rounded-md w-fit mb-2 group-hover:bg-primary-light transition-colors">
                <Users className="text-primary" size={20} />
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">Add New Client</p>
              <p className="text-xs text-text-muted">Onboard a new client</p>
            </div>
          </Link>
          <Link href="/emails/send">
            <div className="p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-comfort text-left cursor-pointer group">
              <div className="p-2 bg-primary-light/50 rounded-md w-fit mb-2 group-hover:bg-primary-light transition-colors">
                <Mail className="text-primary" size={20} />
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">Send Email</p>
              <p className="text-xs text-text-muted">Compose and send email</p>
            </div>
          </Link>
          <Link href="/clients">
            <div className="p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-comfort text-left cursor-pointer group">
              <div className="p-2 bg-primary-light/50 rounded-md w-fit mb-2 group-hover:bg-primary-light transition-colors">
                <FileText className="text-primary" size={20} />
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">View Clients</p>
              <p className="text-xs text-text-muted">Manage all clients</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
