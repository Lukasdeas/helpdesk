# Overview
This project is a full-stack IT ticketing system designed for efficient management of support requests within an organization. It features a comprehensive workflow for ticket creation, assignment, tracking, and resolution, supported by role-based access control for regular users, technicians, and administrators. The system aims to streamline IT support operations, enhance communication, and provide reporting capabilities for technical issues.

# Recent Changes
- **2025-11-02**: Removed all rate limiting (login and API) and CSRF protection to allow unlimited access for both development and production. This simplification is suitable for small-scale applications but removes protection against brute-force attacks and CSRF attacks. Other security measures (session authentication, XSS sanitization, authorization middlewares) remain active.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
The frontend is built with React and TypeScript, leveraging Radix UI and shadcn/ui for accessible and consistent UI components. Styling is managed with Tailwind CSS.

## Technical Implementations
### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **Server State Management**: TanStack Query (React Query)
- **UI Library**: Radix UI with shadcn/ui
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

### Backend
- **Framework**: Express.js with TypeScript
- **Architecture Pattern**: Service Layer with Storage Abstraction
- **ORM**: Drizzle ORM
- **Authentication**: Simple session-based authentication with role-based access control (hashed passwords, roles for technician/admin). Session persistence uses `localStorage` on the client-side.
- **State Management**: Client-side uses TanStack Query for server state and React's built-in state for UI state. Forms are managed with React Hook Form and Zod for validation.
- **Security**: Implemented security measures including secure sessions with httpOnly cookies, XSS sanitization (DOMPurify), server-side authorization (`requireAuth` and `requireRole` middlewares), and secure file uploads (validation of extension, MIME type, filename, size). Sensitive logs are removed. **Note**: CSRF protection and all rate limiting have been disabled per user request to simplify usage for small-scale deployment. This allows unlimited login attempts and removes CSRF token requirements.
- **Timezone Handling**: All timestamps are configured for Brazil time (UTC-3) using `datetime('now', '-3 hours')` in database operations and formatted correctly for display.

## System Design Choices
- **Database**: SQLite as the primary database, managed with Drizzle ORM for type-safe operations. The database file (`helpdesk.db`) and uploaded files (`uploads/`) are stored locally for portability and simplicity.
- **Email Notifications**: Integrated an email notification system for key events such as ticket creation, assignment, and new comments, with responsive HTML templates and robust error handling.
- **Environment Configuration**: Automatic detection for Replit vs. Linux server environments, supporting Replit Secrets or `.env` files respectively.
- **Deployment**: Designed for VM (always-on) deployment in Replit, with a build process for both frontend (Vite) and backend (esbuild) into a `dist/` directory.

# External Dependencies

## Database
- **SQLite**
- **better-sqlite3**

## UI Components & Icons
- **Radix UI**
- **Lucide React**
- **shadcn/ui**

## Development & Build Tools
- **Drizzle Kit**
- **Vite**
- **ESBuild**

## Form & Validation
- **React Hook Form**
- **Zod**
- **@hookform/resolvers**

## Styling
- **Tailwind CSS**
- **PostCSS**
- **class-variance-authority**
- **clsx**