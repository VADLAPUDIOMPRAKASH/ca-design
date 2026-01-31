import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">Settings</h1>
      
      <div className="space-y-4">
        <Card padding="md">
          <h2 className="text-base font-semibold text-text-primary mb-3">General Settings</h2>
          <div className="space-y-3">
            <Input label="Company Name" placeholder="Enter company name" />
            <Input label="Email" type="email" placeholder="your@email.com" />
            <Input label="Phone" type="tel" placeholder="+91 9876543210" />
          </div>
          <div className="mt-4">
            <Button size="sm">Save Changes</Button>
          </div>
        </Card>

        <Card padding="md">
          <h2 className="text-base font-semibold text-text-primary mb-3">Email Settings</h2>
          <div className="space-y-3">
            <Input label="SMTP Server" placeholder="smtp.example.com" />
            <Input label="SMTP Port" type="number" placeholder="587" />
            <Input label="Email Address" type="email" placeholder="noreply@example.com" />
            <Input label="Password" type="password" placeholder="••••••••" />
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm">Test Connection</Button>
            <Button variant="outline" size="sm">Save Settings</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
