# FeedbackMe - Product Requirements Document (PRD)

## 📋 Document Information
- **Last Updated**: 06-07-2025 12:18:50
- **Version**: 1.3
- **Status**: Active Development
- **Phase**: Waitlist Landing Page (Pre-Launch)

---

## 🎯 Project Overview

### Product Name
**FeedbackMe** - Transform Websites Into Collaborative Communities

### Product Vision
Create the simplest, most transparent feedback tool that transforms websites into collaborative communities where users and developers work together to build better products through open dialogue and democratic prioritization.

### Current Status
- **Phase**: Waitlist Landing Page (Pre-Launch)
- **Stack**: Next.js + Neon PostgreSQL + Tailwind CSS + shadcn/ui
- **Framework**: Next.js 15+ with App Router
- **Database**: Neon PostgreSQL (serverless)
- **Deployment**: Vercel

### Key Value Propositions
1. **Lightning Integration**: Just a few lines of code, 15-minute average integration
2. **Community-Powered**: Transparent feedback boards with democratic voting
3. **Actionable Analytics**: Turn feedback chaos into clear insights
4. **Open Transparency**: Every submission visible to all users
5. **Real-Time Engagement**: Live updates and activity notifications

---

## 🎨 Design System

### Color Palette
- **Primary Background**: Pure Black (#000000)
- **Primary Accent**: Yellow to Amber gradients
  - Yellow: #EAB308 (yellow-500)
  - Amber: #F59E0B (amber-500)
  - Orange: #EA580C (orange-600)
- **Text Colors**:
  - Primary: White (#FFFFFF)
  - Secondary: Slate-300 (#CBD5E1)
  - Muted: Slate-400 (#94A3B8)
- **Glass Effects**: 
  - Background: rgba(0, 0, 0, 0.4)
  - Border: rgba(251, 191, 36, 0.2)
  - Shadow: rgba(251, 191, 36, 0.1)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive Design**: Mobile-first approach

### Component Standards
- Use glassmorphism effects for cards and modals
- Consistent spacing with CSS variables
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch targets minimum 44px on mobile

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + CSS Variables
- **Components**: shadcn/ui (built on Radix UI)
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

### Backend Stack
- **Framework**: Next.js API Routes
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM with TypeScript
- **Authentication**: NextAuth.js (planned)
- **Validation**: Zod schemas

### Development Tools
- **Build**: Next.js built-in build system
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint + Next.js config
- **Package Manager**: npm
- **Time Management**: MCP Time Server (time-mcp-local)

### MCP Time Server Configuration
- **Server**: Model Context Protocol (MCP) time server
- **Package**: time-mcp-local (via uvx)
- **Timezone**: Asia/Singapore (SGT UTC+8)
- **Format**: dd-mm-yyyy hh:mm:ss
- **Usage**: All timestamps in documentation, task tracking, and PRD updates
- **Configuration**: Cursor MCP settings with Singapore timezone

### Deployment
- **Platform**: Vercel
- **Database**: Neon PostgreSQL
- **Environment**: Production-ready configuration

---

## 📊 Database Schema

### Current Schema (Waitlist Phase)
```typescript
// Waitlist registrations
export const waitlistRegistrations = pgTable("waitlist_registrations", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Validation schema
export const waitlistSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
});
```

### Future Schema (Full Product)
```typescript
// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Projects (multi-tenant)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  apiKey: text("api_key").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Feedback items
export const feedbackItems = pgTable("feedback_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'feature', 'bug', 'improvement'
  status: text("status").notNull().default('open'),
  userId: integer("user_id").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  feedbackItemId: integer("feedback_item_id").references(() => feedbackItems.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Votes
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  feedbackItemId: integer("feedback_item_id").references(() => feedbackItems.id),
  type: text("type").notNull(), // 'upvote', 'downvote'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## 🚀 Current Implementation

### Project Status
**AWAITING IMPLEMENTATION**: The Next.js project structure needs to be created from scratch.

### Planned Landing Page Structure
1. **Navigation**: Fixed header with logo and CTA button
2. **Hero Section**: Main headline, description, and waitlist form
3. **Stats Section**: Key metrics (2.5K+ developers, 15min integration, 99.9% uptime)
4. **Features Section**: Three main features with icons
5. **How It Works**: Three-step process explanation
6. **CTA Section**: Final call-to-action with benefits
7. **Footer**: Basic footer with links and copyright

### Planned API Endpoints
- **POST /api/waitlist**: Waitlist registration with duplicate checking and queue position

### Features to Implement
- ⏳ Next.js 15+ project setup with App Router
- ⏳ Database connection with Neon PostgreSQL
- ⏳ Responsive design with mobile-first approach
- ⏳ Form validation with React Hook Form + Zod
- ⏳ Toast notifications with auto-dismiss
- ⏳ Glassmorphism design effects
- ⏳ Queue position tracking
- ⏳ TypeScript strict mode
- ⏳ Vercel deployment configuration

---

## 🎯 Product Roadmap

### Phase 1: Waitlist Landing Page (CURRENT)
**Goal**: Validate market interest and collect early user emails

**Key Features**:
- Beautiful landing page with clear value proposition
- Waitlist registration form
- Queue position tracking
- Social proof (developer count, integration time)
- Mobile-responsive design

### Phase 2: MVP Feedback Widget
**Goal**: Basic feedback collection widget for websites

**Key Features**:
- Embeddable JavaScript widget
- Basic feedback form (feature requests, bugs, improvements)
- Simple admin dashboard
- User authentication with Google OAuth
- Basic voting system (upvote/downvote)

### Phase 3: Community Features
**Goal**: Build collaborative feedback communities

**Key Features**:
- Comment threads on feedback items
- Real-time updates and notifications
- User profiles and contribution history
- Feedback categorization and filtering
- Status updates (open, in-progress, closed)

### Phase 4: Analytics & Insights
**Goal**: Provide actionable insights from feedback data

**Key Features**:
- Comprehensive analytics dashboard
- Trend analysis and reporting
- Pain point identification
- Feature prioritization recommendations
- Export capabilities

### Phase 5: Advanced Features
**Goal**: Enterprise-ready feedback platform

**Key Features**:
- Multi-tenant support (multiple projects)
- Advanced customization options
- Webhook integrations
- API for third-party integrations
- Advanced user management and permissions

---

## 📝 Content Strategy

### Brand Messaging
- **Tagline**: "Transform Websites Into Collaborative Communities"
- **Value Proposition**: "FeedbackMe is the plug-and-play tool that turns user feedback into actionable insights. Just a few lines of code to build transparent, voting-powered communities around your product."

### Landing Page Copy
- **Navigation Brand**: "FeedbackMe"
- **Hero Headline**: "Transform Websites Into Collaborative Communities"
- **CTA Buttons**: "Join Waitlist", "Reserve My Spot", "Join the Waitlist Now"
- **Social Proof**: "2.5K+ Developers Waiting", "15mins Avg. Integration", "99.9% Uptime SLA"

### Toast Messages
- **Success (New)**: "🎉 You're on the list! You are #X in the waitlist queue. We'll notify you when FeedbackMe launches."
- **Success (Existing)**: "🎉 You're already on the list! You are #X in the waitlist queue."
- **Error**: "Something went wrong. Please try again."

---

## 🔧 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Prefer functional, declarative code over classes
- Use descriptive variable names (isLoading, hasError)
- Use TanStack Query for server state management
- Use React Hook Form + Zod for form validation
- Use Tailwind CSS for styling with CSS variables
- Use shadcn/ui and Radix UI for components

### File Naming Conventions
- Use kebab-case for directories
- Use camelCase for variables and functions
- Use PascalCase for components
- File names for components should be in PascalCase
- Rest of the files in kebab-case
- Prefix component names with their type (e.g., ButtonAccount.tsx, CardMain.tsx)

### Project Structure
- `app/` - Next.js app router files (pages, layouts, API routes)
- `components/` - Reusable React components
- `lib/` - Shared libraries and database connections
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `utils/` - Helper functions
- `public/` - Static assets

### Performance Optimization
- Minimize 'use client' directives
- Favor React Server Components (RSC)
- Use client components only for Web API access
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Optimize images with WebP format and lazy loading

### File Synchronization
- **CRITICAL: Maintain synchronization between .cursorrules and CLAUDE.md** - changes to one must be reflected in the other
- Follow the synchronization process outlined in both files
- Update PRD.md to document any synchronization activities
- Verify consistency between both files after any changes

### Task Management
- Update task status from 🔴 NOT STARTED → 🟡 IN PROGRESS → 🟢 COMPLETED
- Use timestamp format: `dd-mm-yyyy hh:mm:ss` (e.g., `08-01-2025 14:30:00`)
- **Phase Completion Rule**: When ALL tasks in a phase are completed AND we move to the next phase, summarize them as one completed task with "(Phase X)" tag and remove individual completed tasks
- Include actual time vs estimated time for completed tasks
- Update PRD.md with task progress and completion details

---

## 🎯 Success Metrics

### Phase 1 (Waitlist) Success Criteria
- **Target**: 5,000 waitlist registrations
- **Conversion Rate**: >15% from landing page visits
- **User Engagement**: >70% email open rate for launch announcements
- **Technical Performance**: <3s page load time, >95% uptime

### Future Phase Success Criteria
- **Widget Integration**: <15 minutes average integration time
- **User Engagement**: >60% monthly active users
- **Feature Adoption**: >40% of users use voting features
- **Customer Satisfaction**: >4.5/5 average rating

---

## 🚧 TODO System

### 🔴 NOT STARTED - IMMEDIATE IMPLEMENTATION

#### Phase 1: Foundation (Day 1)
- [ ] **Next.js Project Setup** - Initialize Next.js 15+ project with TypeScript and App Router
  - Priority: High
  - Estimated Time: 30 minutes
  - Dependencies: None
  - Acceptance Criteria: Working Next.js project with TypeScript, App Router, and basic configuration

- [ ] **Database Integration** - Set up Neon PostgreSQL connection and Drizzle ORM
  - Priority: High
  - Estimated Time: 1 hour
  - Dependencies: Next.js Project Setup
  - Acceptance Criteria: Database connection established, Drizzle ORM configured, migration system working

- [ ] **Project Structure Setup** - Create proper directory structure and base files
  - Priority: High
  - Estimated Time: 30 minutes
  - Dependencies: Next.js Project Setup
  - Acceptance Criteria: All directories created (app/, components/, lib/, etc.), basic file structure in place

- [ ] **UI Framework Setup** - Install and configure shadcn/ui and Tailwind CSS
  - Priority: High
  - Estimated Time: 1 hour
  - Dependencies: Project Structure Setup
  - Acceptance Criteria: Tailwind CSS working, shadcn/ui components installable, design system configured

#### Phase 2: Core Implementation (Day 1-2)
- [ ] **Database Schema Implementation** - Create waitlist table and validation schemas
  - Priority: High
  - Estimated Time: 45 minutes
  - Dependencies: Database Integration
  - Acceptance Criteria: Waitlist table created, Zod schemas defined, database operations tested

- [ ] **Landing Page Components** - Build all landing page sections (Hero, Stats, Features, etc.)
  - Priority: High
  - Estimated Time: 3-4 hours
  - Dependencies: UI Framework Setup
  - Acceptance Criteria: All 7 landing page sections implemented with proper responsive design

- [ ] **Waitlist API Implementation** - Create API endpoint for waitlist registration
  - Priority: High
  - Estimated Time: 2 hours
  - Dependencies: Database Schema Implementation
  - Acceptance Criteria: POST /api/waitlist endpoint working, duplicate checking, queue position calculation

- [ ] **Form Validation & Submission** - Implement React Hook Form with Zod validation
  - Priority: High
  - Estimated Time: 2 hours
  - Dependencies: Landing Page Components, Waitlist API Implementation
  - Acceptance Criteria: Form validation working, error handling, successful submission flow

- [ ] **Toast Notifications** - Add toast notifications for user feedback
  - Priority: High
  - Estimated Time: 1 hour
  - Dependencies: Form Validation & Submission
  - Acceptance Criteria: Success/error toasts working, auto-dismiss, proper styling

#### Phase 3: Polish & Optimization (Day 2)
- [ ] **Mobile Responsiveness** - Ensure all components work perfectly on mobile
  - Priority: High
  - Estimated Time: 2 hours
  - Dependencies: Landing Page Components
  - Acceptance Criteria: All breakpoints tested, mobile-first design confirmed, touch targets adequate

- [ ] **Performance Optimization** - Optimize images, loading, and Core Web Vitals
  - Priority: Medium
  - Estimated Time: 1 hour
  - Dependencies: Landing Page Components
  - Acceptance Criteria: Images optimized, lazy loading implemented, <3s load time

- [ ] **Error Handling** - Implement proper error boundaries and error states
  - Priority: Medium
  - Estimated Time: 1 hour
  - Dependencies: All core components
  - Acceptance Criteria: Error boundaries in place, graceful error handling, user-friendly error messages

- [ ] **Deployment Configuration** - Set up Vercel deployment with environment variables
  - Priority: High
  - Estimated Time: 1 hour
  - Dependencies: All core features completed
  - Acceptance Criteria: Deployed to Vercel, environment variables configured, production-ready

### 🔴 NOT STARTED - FUTURE FEATURES

#### Phase 4: Authentication & Core Product
- [ ] **Authentication System** - Implement Google OAuth with NextAuth.js
  - Priority: Medium
  - Estimated Time: 2-3 days
  - Dependencies: Landing Page Complete

- [ ] **Feedback Widget** - Create embeddable JavaScript widget
  - Priority: Medium
  - Estimated Time: 1 week
  - Dependencies: Authentication System

- [ ] **Admin Dashboard** - Build admin dashboard for feedback management
  - Priority: Medium
  - Estimated Time: 1 week
  - Dependencies: Authentication System, Feedback Widget

- [ ] **Voting System** - Implement upvote/downvote functionality
  - Priority: Medium
  - Estimated Time: 3-4 days
  - Dependencies: Feedback Widget

- [ ] **Comments System** - Add comment threads to feedback items
  - Priority: Medium
  - Estimated Time: 4-5 days
  - Dependencies: Feedback Widget

#### Phase 5: Advanced Features
- [ ] **Real-time Updates** - Implement WebSocket connections for live updates
  - Priority: Low
  - Estimated Time: 1 week
  - Dependencies: Feedback Widget

- [ ] **Analytics Dashboard** - Build comprehensive analytics interface
  - Priority: Low
  - Estimated Time: 1-2 weeks
  - Dependencies: Feedback Widget, Voting System

- [ ] **Multi-tenant Support** - Add project management for multiple websites
  - Priority: Low
  - Estimated Time: 1 week
  - Dependencies: Admin Dashboard

- [ ] **Payment Integration** - Implement Stripe for subscription management
  - Priority: Low
  - Estimated Time: 1 week
  - Dependencies: Multi-tenant Support

- [ ] **Email Notifications** - Set up automated email notifications
  - Priority: Low
  - Estimated Time: 3-4 days
  - Dependencies: Feedback Widget

### 🟡 IN PROGRESS
Currently no tasks in progress.

### 🟢 COMPLETED
- [x] **Documentation** - Complete PRD.md and cursor rules
  - Started: 08-01-2025 10:30:00
  - Completed: 08-01-2025 10:45:00
  - Priority: High
  - Estimated Time: 2 hours
  - Actual Time: 15 minutes

- [x] **Project Planning** - Create comprehensive implementation plan
  - Started: 08-01-2025 10:50:00
  - Completed: 08-01-2025 11:15:00
  - Priority: High
  - Estimated Time: 1 hour
  - Actual Time: 25 minutes

- [x] **Claude AI Rules** - Create comprehensive AI assistant rules based on cursor rules
  - Started: 08-01-2025 11:20:00
  - Completed: 08-01-2025 11:35:00
  - Priority: Medium
  - Estimated Time: 30 minutes
  - Actual Time: 15 minutes

- [x] **File Rename** - Rename CLAUDE_RULES.md to CLAUDE.md and verify case sensitivity
  - Started: 08-01-2025 11:40:00
  - Completed: 08-01-2025 11:45:00
  - Priority: Low
  - Estimated Time: 5 minutes
  - Actual Time: 5 minutes

- [x] **File Synchronization Setup** - Establish synchronization rules between .cursorrules and CLAUDE.md
  - Started: 08-01-2025 11:50:00
  - Completed: 08-01-2025 12:00:00
  - Priority: High
  - Estimated Time: 15 minutes
  - Actual Time: 10 minutes

- [x] **Timestamp Format Update** - Update all files to use dd-mm-yyyy hh:mm:ss format and add phase completion rule
  - Started: 08-01-2025 12:00:00
  - Completed: 08-01-2025 12:15:00
  - Priority: Medium
  - Estimated Time: 15 minutes
  - Actual Time: 15 minutes

- [x] **MCP Time Server Configuration** - Configure MCP time server for automated timestamp management
  - Started: 06-07-2025 12:12:25
  - Completed: 06-07-2025 12:12:25
  - Priority: Medium
  - Estimated Time: 30 minutes
  - Actual Time: 30 minutes
  - Description: Configured MCP time server (time-mcp-local) for Singapore timezone, updated .cursorrules and CLAUDE.md with MCP time usage guidelines, established dd-mm-yyyy hh:mm:ss format standard

---

## 📋 Environment Variables

### Required
```bash
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
NODE_ENV=production
```

### Optional (Future Features)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🚀 Deployment

### Vercel Configuration
Next.js projects on Vercel work out of the box with zero configuration. Environment variables should be set in the Vercel dashboard.

### Commands
```bash
# Development
npm run dev

# Build
npm run build

# Database
npm run db:push

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📞 Contact & Support

### Development Team
- **Project Lead**: [Your Name]
- **Repository**: feedbackme-waitlist-nextjs
- **Platform**: Next.js 15+ with App Router

### Resources
- **Documentation**: This PRD.md file
- **Claude AI Rules**: CLAUDE.md for AI assistant guidelines
- **Cursor Rules**: .cursorrules for development standards
- **File Synchronization**: CLAUDE.md and .cursorrules are kept synchronized - changes to one are reflected in the other
- **Tech Stack**: Next.js + Neon PostgreSQL + Tailwind CSS + shadcn/ui
- **Deployment**: Vercel
- **Database**: Neon PostgreSQL

---

**Last Updated**: 08-01-2025 12:20:00
**Document Version**: 1.2
**Next Review**: 15-01-2025 10:30:00 