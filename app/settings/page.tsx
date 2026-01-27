import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
          <div className="space-y-4">
            <Input label="Company Name" placeholder="Enter company name" />
            <Input label="Email" type="email" placeholder="your@email.com" />
            <Input label="Phone" type="tel" placeholder="+91 9876543210" />
          </div>
          <div className="mt-6">
            <Button>Save Changes</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Settings</h2>
          <div className="space-y-4">
            <Input label="SMTP Server" placeholder="smtp.example.com" />
            <Input label="SMTP Port" type="number" placeholder="587" />
            <Input label="Email Address" type="email" placeholder="noreply@example.com" />
            <Input label="Password" type="password" placeholder="••••••••" />
          </div>
          <div className="mt-6">
            <Button>Test Connection</Button>
            <Button variant="outline" className="ml-3">Save Settings</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
