/**
 * Shared utilities for email template variable replacement and preview
 */

export const TEMPLATE_VARIABLES = [
  { label: 'Client Name', value: '{{client_name}}', key: 'client_name' },
  { label: 'Company Name', value: '{{company_name}}', key: 'company_name' },
  { label: 'Email', value: '{{email}}', key: 'email' },
  { label: 'Phone', value: '{{phone}}', key: 'phone' },
  { label: 'Username', value: '{{username}}', key: 'username' },
  { label: 'Password', value: '{{password}}', key: 'password' },
  { label: 'Login Link', value: '{{login_link}}', key: 'login_link' },
  { label: 'Date', value: '{{date}}', key: 'date' },
  { label: 'Custom Message', value: '{{custom_message}}', key: 'custom_message' },
] as const;

export interface TemplateVariableData {
  client_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  login_link?: string;
  date?: string;
  custom_message?: string;
}

export const SAMPLE_TEMPLATE_DATA: TemplateVariableData = {
  client_name: 'John Smith',
  company_name: 'Smith Enterprises',
  email: 'john@smith.com',
  phone: '+91 9876543210',
  username: 'johnsmith',
  password: 'TempPass123!',
  login_link: 'https://portal.example.com/login',
  date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  custom_message: 'Your custom message here',
};

/**
 * Replace template variables (e.g. {{client_name}}) with actual values
 */
export function replaceTemplateVariables(
  text: string,
  data: TemplateVariableData
): string {
  let result = text;
  for (const { value, key } of TEMPLATE_VARIABLES) {
    const replacement = data[key as keyof TemplateVariableData] ?? value;
    result = result.replace(new RegExp(value.replace(/[{}]/g, '\\$&'), 'g'), String(replacement));
  }
  // Replace any remaining {{...}} with placeholder
  result = result.replace(/\{\{([^}]+)\}\}/g, '[Not set: $1]');
  return result;
}

/**
 * Build variable data from a client record
 */
export function buildVariableDataFromClient(client: {
  name: string;
  email: string;
  phone: string;
  companyName: string;
}): TemplateVariableData {
  const username = client.email.split('@')[0] || 'user';
  return {
    client_name: client.name,
    company_name: client.companyName,
    email: client.email,
    phone: client.phone,
    username,
    password: '••••••••', // Placeholder - actual password from login creation
    login_link: `https://portal.example.com/login?user=${encodeURIComponent(username)}`,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    custom_message: SAMPLE_TEMPLATE_DATA.custom_message,
  };
}
