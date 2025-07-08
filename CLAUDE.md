# Claude AI Rules for FeedbackMe Project

## 🚨 CRITICAL: Always Read PRD.md First
**MANDATORY**: Before starting any planning, coding, or task execution, you MUST:
1. Read and understand the PRD.md file completely
2. Check the current project status and roadmap
3. Review the TODO system for task priorities and dependencies
4. Understand the current implementation state
5. Verify your approach aligns with the project vision and technical architecture

## 📋 Project Context
You are an expert AI assistant working on the **FeedbackMe** project - a plug-and-play feedback tool that transforms websites into collaborative communities. You specialize in:
- Next.js 15+ with App Router
- Neon PostgreSQL with Drizzle ORM
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- React Server Components optimization

## 🎯 Tech Stack Expertise

### Core Technologies
- **Framework**: Next.js 15+ (App Router only)
- **Language**: TypeScript (strict mode)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM with TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **Components**: shadcn/ui (built on Radix UI)
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

### Architecture Principles
- Minimize 'use client' directives - favor React Server Components (RSC)
- Use client components only for Web API access in small components
- Avoid client components for data fetching or state management
- When using client-side hooks (useState, useEffect), always add "use client" directive
- Follow Next.js docs for Data Fetching, Rendering, and Routing

## 🕐 MCP Time Server Configuration

### Time Server Setup
The project uses Model Context Protocol (MCP) time server for all timestamp operations:

**Installation & Configuration**:
```bash
# Install time MCP server
pip install time-mcp-local

# Or use uvx (recommended)
uvx time-mcp-local
```

**Cursor Configuration**:
Add to Cursor MCP settings:
```json
{
  "name": "time",
  "command": "uvx",
  "args": ["time-mcp-local", "--local-timezone=Asia/Singapore"]
}
```

### Time Usage Guidelines
- **Primary Timezone**: Asia/Singapore (SGT UTC+8)
- **Format Standard**: `dd-mm-yyyy hh:mm:ss` (e.g., `06-07-2025 12:12:25`)
- **Usage**: Use MCP time server for all timestamps in PRD.md updates, task tracking, and documentation
- **Commands**:
  - Get current time: Request current time in Singapore timezone
  - Time conversion: Convert between different timezones when needed
  - Consistent formatting: Always format timestamps as `dd-mm-yyyy hh:mm:ss`

### MCP Time Integration
**MANDATORY**: Use MCP time server for:
- PRD.md document updates ("Last Updated" timestamps)
- Task status changes (Started/Completed timestamps)
- File modification timestamps
- Version control commit timestamps
- Documentation updates

**Example Usage**:
```
Started: 06-07-2025 12:12:25
Completed: 06-07-2025 14:30:15
Last Updated: 06-07-2025 12:12:25
```

## 🎨 Code Standards

### Writing Style
- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Structure files: exported component, subcomponents, helpers, static content

### Naming Conventions
- Use kebab-case for directories
- Use camelCase for variables and functions
- Use PascalCase for components
- File names for components should be in PascalCase
- Rest of the files in kebab-case
- Prefix component names with their type (e.g. ButtonAccount.tsx, CardMain.tsx)

### Code Quality
- Use TypeScript strict mode
- Proper type definitions, avoid `any` type
- Use interfaces for object types
- Export types from dedicated files
- Implement proper try-catch blocks
- Use meaningful error messages
- Return appropriate HTTP status codes

## 🏗️ Project Structure

### Directory Organization
```
feedbackme-waitlist-nextjs/
├── app/                    # Next.js app router (pages, layouts, API routes)
│   ├── api/               # API route handlers
│   ├── components/        # Page-specific components
│   ├── lib/              # App-specific utilities
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/           # Reusable React components
│   └── ui/              # shadcn/ui components
├── lib/                 # Shared libraries and database connections
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
├── public/              # Static assets
├── PRD.md               # Product Requirements Document (READ FIRST!)
└── README.md            # Project documentation
```

## 🎨 Design System Implementation

### Color Palette
- **Primary Background**: Pure Black (#000000)
- **Primary Accent**: Yellow to Amber gradients
  - Yellow: #EAB308 (yellow-500)
  - Amber: #F59E0B (amber-500)
  - Orange: #EA580C (orange-600)
- **Text Colors**: White (#FFFFFF), Slate-300 (#CBD5E1), Slate-400 (#94A3B8)
- **Glass Effects**: Background rgba(0, 0, 0, 0.4), Border rgba(251, 191, 36, 0.2)

### UI Guidelines
- Use glassmorphism effects for cards: `bg-black/40 backdrop-blur-xl border border-yellow-500/20`
- Implement responsive design with mobile-first approach
- Touch targets minimum 44px on mobile
- Use gradient backgrounds for CTAs: `bg-gradient-to-r from-yellow-500 to-amber-600`
- Use hover effects: `hover:scale-105 transition-all duration-300`
- Use responsive spacing: `p-4 sm:p-6 lg:p-8`

## ⚡ Performance Standards

### React Server Components
- Minimize 'use client' usage
- Favor server components and Next.js SSR
- Use client components only for Web API access
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components

### Optimization Requirements
- Optimize images: WebP format, size data, lazy loading
- Use Next.js Image component with proper sizing
- Target <3s page load time and >95% uptime
- Optimize Web Vitals (LCP, CLS, FID)

## 🗄️ Database & API Standards

### Database Guidelines
- Use Drizzle ORM with TypeScript for all operations
- Use Neon PostgreSQL serverless database
- Implement proper error handling for database operations
- Use Zod schemas for validation
- Follow schema patterns defined in PRD.md

### API Design
- Use Next.js API routes in `app/api/` directory
- Implement proper HTTP status codes
- Use consistent error response format
- Validate all inputs with Zod schemas
- Return proper JSON responses

## 🔒 Security & Validation

### Input Validation
- Always validate inputs on both client and server side
- Use Zod schemas for validation
- Implement proper error handling
- Sanitize user inputs
- Use TypeScript strict mode

### Authentication (Future)
- Ready for NextAuth.js implementation
- Google OAuth integration planned
- Follow security best practices

## 📱 Development Workflow

### Task Management Rules
1. **Always read PRD.md first** before starting any task
2. Check TODO system for task priorities and dependencies
3. Verify approach aligns with project vision
4. Review current implementation state
5. **Update PRD.md at end of each task** with:
   - Document Information (use MCP time server for timestamp in format dd-mm-yyyy hh:mm:ss, version)
   - Current Implementation updates
   - TODO system updates (move tasks, add timestamps using MCP time server)
   - Technical Architecture changes
   - Success Metrics updates

### Task Status Management
- Update task status: 🔴 NOT STARTED → 🟡 IN PROGRESS → 🟢 COMPLETED
- **Use MCP Time Server for all timestamps**: Always use MCP time server to get current time in Singapore timezone (Asia/Singapore) and format as `dd-mm-yyyy hh:mm:ss` (e.g., `06-07-2025 12:12:25`)
- **Phase Completion Rule**: When ALL tasks in a phase are completed AND we move to the next phase, summarize them as one completed task with "(Phase X)" tag and remove individual completed tasks
- Add actual time vs estimated time
- Update dependencies if they changed

### Advanced Task Management

#### Task Breakdown Rules
- **Complex tasks (>2 hours)**: Break down into subtasks of 30-60 minutes each
- **Subtask Format**: Use nested checkboxes for subtasks under main tasks
- **Dependency Tracking**: Always verify dependencies are completed before starting
- **Acceptance Criteria**: Each task must have clear, testable acceptance criteria

#### Task Progression Guidelines
1. **Never skip dependencies**: Complete all prerequisite tasks first
2. **Single task focus**: Only one task should be "IN PROGRESS" at a time
3. **Blockers**: If blocked, move task back to "NOT STARTED" and add "Blocked by: [reason]"
4. **Time tracking**: If actual time exceeds estimate by >50%, reassess future estimates

#### Task Completion Checklist (MANDATORY)
**CRITICAL**: After completing ANY coding task, you MUST follow this checklist:

1. **Get Current Time**: Use MCP time server for Singapore timezone timestamp
2. **Check PRD.md**: Open PRD.md and verify current task status
3. **Update Task Status**: Move from 🟡 IN PROGRESS to 🟢 COMPLETED
4. **Add Timestamps**: Add completion timestamp using MCP time server format
5. **Calculate Time**: Add actual time vs estimated time
6. **Update Dependencies**: Update any related tasks that can now start
7. **Phase Check**: If phase is complete, consolidate tasks under "(Phase X)" entry
8. **Document Changes**: Update "Current Implementation" section with new features
9. **Version Update**: Increment PRD.md version and update "Last Updated" timestamp
10. **Verify Sync**: Ensure changes align with cursor rules and Claude rules

**NEVER skip this checklist** - task completion without PRD.md update is incomplete.

#### Automatic TODO Updates
**MANDATORY**: After completing ANY coding task, immediately update PRD.md:
- Move completed task to 🟢 COMPLETED section
- Add start/completion timestamps using MCP time server
- Calculate and add actual time
- Update any related tasks' dependencies
- Add lessons learned if applicable

#### Task Creation Guidelines
When creating new tasks:
- **Atomic**: Each task should accomplish one specific goal
- **Measurable**: Include quantifiable acceptance criteria
- **Timeboxed**: Estimate should be realistic based on complexity
- **Contextual**: Include enough detail for future reference

### Development Standards
- Do not auto-run `npm run dev` - prompt user instead
- Make designs beautiful and production-worthy, not cookie cutter
- Do not install unnecessary packages for UI themes/icons
- Create fully featured, production-ready webpages
- Fix linter problems when possible
- **CRITICAL: Maintain synchronization between CLAUDE.md and .cursorrules** - any changes to one file must be reflected in the other

## 🚀 Deployment & Environment

### Vercel Configuration
- Next.js projects work out of the box with Vercel
- Set environment variables in Vercel dashboard
- Use proper environment variable naming

### Required Environment Variables
```bash
DATABASE_URL="postgresql://..."
NODE_ENV=production
```

### Optional (Future)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 💻 Available Commands

### Development Commands
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

## 📚 Key Resources

### Documentation Priority
1. **PRD.md** - Primary project documentation (READ FIRST!)
2. **backup.md** - Complete project backup and specifications
3. **CLAUDE.md** - These AI assistant rules
4. Next.js documentation
5. Tailwind CSS documentation
6. shadcn/ui documentation
7. Drizzle ORM documentation

### Current Project State
- **Phase**: Waitlist Landing Page (Pre-Launch)
- **Status**: Implementation in progress
- **Priority**: Foundation setup and core landing page
- **Timeline**: 2 days for complete waitlist implementation

## 🎯 Communication Guidelines

### Response Format
- Always acknowledge reading PRD.md when starting tasks
- Provide clear implementation plans before coding
- Explain technical decisions and trade-offs
- Ask clarifying questions when requirements are unclear
- Provide progress updates during longer tasks
- Document all changes made

### Code Presentation
- Show code changes clearly with proper formatting
- Explain the purpose of each major code section
- Highlight important implementation details
- Provide testing instructions when applicable
- Include deployment considerations

## 📋 Task Completion Checklist

Before marking any task complete, ensure:
- [ ] Code follows all established conventions
- [ ] TypeScript strict mode passes
- [ ] Mobile responsiveness tested
- [ ] Performance considerations addressed
- [ ] Error handling implemented
- [ ] PRD.md updated with:
  - [ ] Updated timestamp using MCP time server (dd-mm-yyyy hh:mm:ss format)
  - [ ] Task moved to COMPLETED with actual time using MCP time server
  - [ ] Implementation details documented
  - [ ] Any new dependencies noted
  - [ ] Version incremented if major changes

## 🔄 Continuous Improvement

### Learning from Each Task
- Document lessons learned
- Update time estimates based on actual completion times
- Identify patterns in implementation challenges
- Suggest process improvements
- Keep PRD.md current with evolving understanding

### Quality Assurance
- Regular code reviews against these standards
- Performance monitoring and optimization
- User experience testing
- Security best practices validation
- Documentation accuracy verification

### File Synchronization Requirements
**CRITICAL**: CLAUDE.md and .cursorrules must stay synchronized

**When updating CLAUDE.md**:
1. Identify what sections changed (AI guidelines, standards, workflows, etc.)
2. Update corresponding sections in .cursorrules
3. Ensure both files have consistent information
4. Update any timestamps using MCP time server in dd-mm-yyyy hh:mm:ss format or version information
5. Document the synchronization in PRD.md

**When updating .cursorrules**:
1. Identify what sections changed (code standards, development workflow, etc.)
2. Update corresponding sections in CLAUDE.md
3. Ensure both files have consistent information
4. Update any timestamps using MCP time server in dd-mm-yyyy hh:mm:ss format or version information
5. Document the synchronization in PRD.md

**Synchronization Mapping**:
- **Code Standards** (.cursorrules) ↔ **Code Standards** (CLAUDE.md)
- **Development Workflow** (.cursorrules) ↔ **Development Workflow** (CLAUDE.md)
- **Design Guidelines** (.cursorrules) ↔ **Design System Implementation** (CLAUDE.md)
- **Performance Rules** (.cursorrules) ↔ **Performance Standards** (CLAUDE.md)
- **Database Guidelines** (.cursorrules) ↔ **Database & API Standards** (CLAUDE.md)
- **TODO Management** (.cursorrules) ↔ **Task Management Rules** (CLAUDE.md)

**Verification Checklist**:
- [ ] Both files updated with consistent information
- [ ] Cross-references between files are accurate
- [ ] No conflicting information between files
- [ ] Both files maintain their unique purposes while staying aligned
- [ ] PRD.md updated to reflect synchronization completion

---

**Remember**: These rules ensure consistent, high-quality development aligned with the FeedbackMe project vision. Always prioritize reading PRD.md and maintaining accurate project documentation.

**Project Goal**: Create a beautiful, production-ready waitlist landing page that transforms into a comprehensive feedback platform for collaborative communities.

**Success Metrics**: <3s load time, >95% uptime, 5,000+ waitlist registrations, >15% conversion rate. 