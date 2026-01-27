# CA Client Management Platform

A comprehensive frontend application for Chartered Accountants to manage clients, communications, and workflows.

## Features

### ✅ Completed Modules

1. **Main Layout & Navigation**
   - Responsive sidebar navigation with collapsible submenus
   - Top header with breadcrumbs, search, notifications, and user profile
   - Mobile-friendly hamburger menu

2. **Client Management**
   - **Client List Page**: Search, filter, sort, and manage clients with bulk actions
   - **Add Client Form**: Multi-step onboarding form (Basic Info → Company Details → Confirmation)
   - **Create Client Login**: Generate portal credentials with password strength indicator

3. **Email Management**
   - **Template Management**: Create, edit, and organize email templates with dynamic variables
   - **Send Email**: Compose and send emails with scheduling options
   - **Scheduled Emails**: Manage one-time and recurring email schedules

4. **Design System**
   - Consistent color palette and typography
   - Reusable UI components (Button, Input, Card)
   - Responsive design (mobile, tablet, desktop)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── clients/           # Client management pages
│   │   ├── add/          # Add new client form
│   │   └── [id]/login/   # Create client login
│   ├── emails/           # Email management pages
│   │   ├── templates/    # Template management
│   │   ├── send/         # Send email interface
│   │   └── scheduled/    # Scheduled emails
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard
├── components/           # React components
│   ├── layout/          # Layout components (Sidebar, Header, Breadcrumb)
│   └── ui/              # Reusable UI components (Button, Input, Card)
├── lib/                  # Utility functions
└── public/              # Static assets
```

## Design System

### Colors
- **Primary**: #2563eb (Professional blue)
- **Secondary**: #64748b (Subtle gray)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber)
- **Danger**: #ef4444 (Red)
- **Background**: #f8fafc (Light gray)

### Typography
- **Font Family**: Inter
- **Headings**: 24-28px
- **Body**: 14-16px

### Spacing
- Base unit: 4px
- Common values: 4, 8, 12, 16, 24, 32, 48, 64px

## Key Features

### Client Onboarding
- Multi-step form with validation
- Progress indicator
- Save as draft functionality
- Auto-suggestions and smart defaults

### Email Templates
- Rich text editor
- Dynamic variable insertion
- Template categories
- Pre-built templates
- Preview functionality

### Email Scheduling
- Send now, schedule later, or recurring
- Timezone support
- Track opens and clicks
- Priority levels

## Development Guidelines

### Component Structure
- Use functional components with TypeScript
- Follow the design system for consistency
- Make components reusable and composable
- Use proper TypeScript types

### State Management
- Currently using React useState/useContext
- Prepared for future state library integration

### Form Validation
- Client-side validation with clear error messages
- Disable submit until form is valid
- Inline error display

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px (tablet), 1024px (desktop)
- Test on all screen sizes

## Next Steps

### Backend Integration
- Replace mock data with API calls
- Add authentication
- Implement real-time updates
- Add file upload functionality

### Future Enhancements
- Document management module
- Invoice generation
- Reporting and analytics
- Client portal
- Task management
- Calendar integration

## Contributing

1. Follow the design system guidelines
2. Write clean, commented code
3. Test on multiple screen sizes
4. Ensure accessibility standards

## License

Private - CA Client Management Platform
