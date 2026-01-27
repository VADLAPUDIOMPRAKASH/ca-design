import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mail, FileText, Send, Clock } from 'lucide-react';

export default function EmailsPage() {
  const emailActions = [
    {
      title: 'Templates',
      description: 'Create and manage email templates',
      icon: FileText,
      href: '/emails/templates',
      color: 'text-primary',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {emailActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className={`p-3 bg-gray-50 rounded-lg w-fit mb-4 ${action.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
