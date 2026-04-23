# Smartseason - Agricultural Field Management System

A production-quality frontend for agricultural field management built with Next.js 16, TypeScript, CSS Modules, and JWT authentication.

## Features

- **Intelligent Field Tracking**: Monitor crop progression through distinct stages (planted → growing → ready → harvested)
- **Real-Time Updates**: Agents post field observations with timestamps and notes
- **Role-Based Access Control**: Admin and Agent roles with fine-grained permissions
- **Activity Feed**: Track all field updates across the system
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Agricultural Theme**: Custom CSS variables with agricultural color palette

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (no Tailwind/shadcn)
- **Auth**: JWT tokens with automatic refresh
- **HTTP Client**: Typed fetch wrapper with error handling
- **State**: React Context for auth, useState for data
- **Icons**: Lucide React

## Project Structure

```
app/
  layout.tsx                 # Root layout with AuthProvider
  page.tsx                   # Landing page
  login/page.tsx            # Login page
  dashboard/
    layout.tsx              # Protected dashboard layout
    page.tsx                # Dashboard overview
    fields/
      page.tsx              # Fields list
      new/page.tsx          # Create field (admin)
      [id]/page.tsx         # Field detail & history
      [id]/update/page.tsx  # Post field update
    users/
      page.tsx              # User management (admin)
      new/page.tsx          # Register user (admin)
      [id]/page.tsx         # Edit user (admin)

components/
  ui/                       # Core UI components with CSS Modules
    Button.tsx, Input.tsx, Select.tsx, Textarea.tsx
    Badge.tsx, Card.tsx, Modal.tsx, Spinner.tsx
    ErrorMessage.tsx, EmptyState.tsx
  layout/                   # Layout components
    Sidebar.tsx             # Fixed sidebar with nav & user profile
    Topbar.tsx             # Sticky header with breadcrumbs
    PageHeader.tsx         # Page title & actions
  fields/                   # Domain components
    FieldCard.tsx          # Field grid card
    FieldForm.tsx          # Create/edit field form
    FieldUpdateFeed.tsx    # Chronological update list
    FieldUpdateForm.tsx    # Post update form
  users/
    UserForm.tsx           # Create/edit user form
    UserTable.tsx          # Admin user list table

lib/
  api.ts                   # Typed fetch wrapper with token refresh
  auth.ts                  # Token get/set/clear utilities
  utils.ts                 # Helper functions (dates, colors, etc)
  hooks/
    useRequireAuth.ts      # Route protection hook
    useFields.ts           # Fetch all fields
    useField.ts            # Fetch single field
    useUsers.ts            # Fetch all users

contexts/
  AuthContext.tsx          # JWT auth with user hydration

types/
  index.ts                 # TypeScript interfaces for all types

styles/
  globals.css              # Design tokens & resets (no Tailwind)
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Django REST Framework backend running on http://localhost:8000

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at http://localhost:3000

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Design System

### Color Palette

**Brand:**
- Primary: `hsl(142, 71%, 45%)` - Lush green
- Accent: `hsl(38, 95%, 55%)` - Harvest gold

**Stage Colors:**
- Planted: `hsl(200, 70%, 50%)` - Blue
- Growing: `hsl(142, 71%, 45%)` - Green
- Ready: `hsl(38, 95%, 55%)` - Gold
- Harvested: `hsl(260, 60%, 60%)` - Purple

**Status Colors:**
- Active: Green
- At Risk: Orange
- Completed: Blue

### Typography

- Font: Inter (from Google Fonts)
- Heading: 1.5rem - 2.25rem
- Body: 0.875rem - 1rem
- Spacing: 8px base unit

## API Client

The typed `apiClient` handles:

- Automatic token refresh on 401
- Retry logic for failed refreshes
- Error handling with typed responses
- All CRUD operations for fields and users

### Authentication Flow

1. On app mount, check localStorage for refresh token
2. If exists, call `getMe()` to hydrate user
3. On login, save tokens and set AuthContext
4. On API 401, automatically refresh token
5. If refresh fails, clear tokens and redirect to /login

## Key Features

### Route Protection

All `/dashboard/*` routes are protected by `useRequireAuth` hook:

```typescript
export default function Page() {
  const isAuthed = useRequireAuth();
  if (!isAuthed) return null; // Redirects to /login
}
```

Admin-only routes use: `useRequireAuth(true)`

### Data Fetching

Custom hooks return `{ data, isLoading, error, refetch }`:

```typescript
const { data: fields, isLoading, error } = useFields();
```

### Stage Progression

The `getNextStages()` utility enforces forward-only progression:

```
planted → growing → ready → harvested
```

### Crop Day Limits

- Maize: 90 days
- Wheat: 120 days
- Rice: 150 days
- Beans: 60 days

Progress bars show elapsed days on field detail pages.

## Build & Deployment

```bash
# Build for production
pnpm run build

# Start production server
pnpm start
```

The app is optimized for Vercel deployment with:
- Static prerendering for public pages
- On-demand rendering for dynamic routes
- Image optimization
- Font optimization (Inter preloaded)

## Testing the App

### Test Account

Use credentials from your Django backend:

```
Username: admin
Password: (your backend password)
```

### Test Flows

1. **Login**: Visit /login, enter credentials
2. **Create Field**: Dashboard → Fields → + New Field (admin only)
3. **Post Update**: Navigate to field detail → + Post Update
4. **Manage Users**: Dashboard → Users (admin only)

## Architecture Decisions

- **CSS Modules over Tailwind**: Per spec for full control and custom theme
- **Context + Hooks over Redux**: Simpler state for this app size
- **Fetch over Axios**: Lighter bundle, modern browser API
- **CSS Modules animation**: No third-party animation libraries needed
- **Mobile-first responsive**: 3 breakpoints (640px, 768px, 1024px)

## Error Handling

All pages include error states:

- Network errors: ErrorMessage component
- 401: Auto-refresh, redirect to /login if fails
- 403: Redirect to /dashboard (access denied)
- 404: Not found page
- Form validation: Inline error messages

## Performance

- Production build: ~180KB (uncompressed)
- Lazy loading for modal dialogs
- Optimized images and fonts
- CSS-only animations (no JavaScript)
- Efficient re-renders with proper dependency arrays

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**"API_URL is not reachable"**
- Ensure Django backend is running on http://localhost:8000
- Check NEXT_PUBLIC_API_URL in .env.local

**"Login fails silently"**
- Check network tab for API responses
- Verify backend credentials
- Check browser console for errors

**"Protected pages redirect to /login"**
- Clear localStorage (dev tools → Application)
- Login again with valid credentials

## Development Notes

- All components use CSS Modules for style isolation
- No Tailwind classes anywhere in the codebase
- TypeScript strict mode enabled
- No console.log() statements in production code
- All pages have metadata for SEO

## Future Enhancements

- Real-time updates with WebSockets
- Advanced filtering and search
- Export field data to CSV
- Multiple language support
- Offline mode with service workers
