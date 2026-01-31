import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Mail, FileText, Send, Clock, Inbox } from 'lucide-react';

export default function EmailsPage() {
  const emailActions = [
    {
      title: 'Inbox',
      description: 'View emails received from clients',
      icon: Inbox,
      href: '/emails/inbox',
      color: 'text-primary',
    },
    {
      title: 'Templates',
      description: 'Create and manage email templates',
      icon: FileText,
      href: '/emails/templates',
      color: 'text-secondary',
    },
    {
      title: 'Send Email',
      description: 'Compose and send emails to clients',
      icon: Send,
      href: '/emails/send',
      color: 'text-success',
    },
    {
      title: 'Scheduled Emails',
      description: 'View and manage scheduled emails',
      icon: Clock,
      href: '/emails/scheduled',
      color: 'text-warning',
    },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">Email Management</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {emailActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Card padding="sm" className="hover:shadow-elevated transition-shadow duration-comfort cursor-pointer h-full">
                <div className={`p-2 bg-surface-subtle rounded-lg w-fit mb-2 ${action.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1">{action.title}</h3>
                <p className="text-xs text-text-muted">{action.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
