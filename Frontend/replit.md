# Solana Postman

## Overview

Solana Postman is a zero-friction Solana development tool that functions as a "Postman for Solana blockchain". It provides developers with three primary modes for interacting with Solana programs:

1. **Anchor Auto-Magician Mode** - Automatically fetches and parses Anchor IDLs to generate transaction UIs
2. **Instruction Builder Mode** - Visual byte packer for manually constructing program instructions
3. **Transaction Simulator Mode** - Dry-run transaction simulation with detailed logs and metrics

The application is designed as a developer tool for testing, debugging, and interacting with Solana smart contracts without requiring extensive boilerplate code.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with Vite as the build tool and development server

**Routing**: Wouter for lightweight client-side routing (SPA architecture)

**UI Component Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS v4 for styling

**State Management**: 
- React Query (@tanstack/react-query) for server state and async data fetching
- Local React state for UI interactions
- No global state management library (intentionally keeping it simple)

**Design Pattern**: The application uses a component-based architecture with:
- Page components (`AnchorMode.tsx`, `InstructionBuilder.tsx`, `Simulator.tsx`) for routes
- Shared layout component for navigation sidebar
- Reusable UI primitives from shadcn/ui
- Mock data layer (`mock-data.ts`) currently simulating Solana RPC interactions

**Key Frontend Decisions**:
- **Why Vite**: Fast HMR, native ESM support, optimized builds
- **Why Wouter over React Router**: Smaller bundle size, simpler API for SPA needs
- **Why shadcn/ui**: Copy-paste components with full control, no runtime library overhead
- **Why Mock Data Currently**: Frontend development can proceed independently of backend implementation

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**Server Structure**:
- `server/index.ts` - Main application entry point with middleware setup
- `server/routes.ts` - API route registration (placeholder for future endpoints)
- `server/static.ts` - Static file serving for production builds
- `server/vite.ts` - Vite middleware integration for development

**Development vs Production**:
- **Development**: Vite dev server runs as middleware within Express, providing HMR
- **Production**: Pre-built static files served from `dist/public`

**Storage Layer**: 
- `server/storage.ts` provides an abstraction (`IStorage` interface) currently implemented with in-memory storage (`MemStorage`)
- Designed to be swappable with database-backed implementation

**Key Backend Decisions**:
- **Why Express**: Mature, well-documented, extensive middleware ecosystem
- **Why In-Memory Storage Initially**: Allows frontend development without database dependency
- **Middleware Pattern**: Logging middleware tracks request duration and response status for debugging

### Build System

**Build Script** (`script/build.ts`):
- Uses esbuild to bundle server code into single CJS file
- Uses Vite to build optimized frontend assets
- Bundles frequently-used dependencies to reduce syscalls and improve cold start performance
- Allowlist approach for dependencies to bundle vs externalize

**Build Outputs**:
- `dist/index.cjs` - Bundled server application
- `dist/public/` - Static frontend assets

### Database Design

**ORM**: Drizzle ORM with PostgreSQL dialect

**Schema** (`shared/schema.ts`):
- Currently defines a minimal `users` table as template
- Uses Drizzle's type-safe schema definition
- Integration with Zod for runtime validation via `drizzle-zod`

**Migration Strategy**: 
- Drizzle Kit manages schema migrations
- `drizzle.config.ts` configures migration output and database connection
- `npm run db:push` applies schema changes

**Key Database Decisions**:
- **Why Drizzle**: Type-safe, lightweight, excellent TypeScript integration
- **Why PostgreSQL**: Robust, supports complex queries, good for structured data
- **Current State**: Schema is placeholder; actual Solana Postman data models not yet defined

### Type Safety & Validation

**Shared Types** (`shared/` directory):
- Types shared between client and server live here
- Prevents duplication and maintains consistency
- Currently minimal (user schema only)

**Path Aliases**:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## External Dependencies

### Blockchain Integration (Planned)

**Solana RPC**: Application will connect to Solana RPC endpoints to:
- Fetch program IDLs from on-chain accounts
- Submit transactions
- Simulate transactions (dry-run)

**Current State**: Using mock data (`MOCK_IDL`, `MOCK_LOGS`) - actual Solana Web3.js integration not yet implemented

### UI Component Library

**Radix UI**: Unstyled, accessible component primitives
- Dialog, Dropdown, Popover, Tooltip, etc.
- Provides accessibility features out of the box

**Lucide React**: Icon library for consistent iconography

### Styling

**Tailwind CSS v4**: Utility-first CSS framework
- Custom theme defined in `client/src/index.css` with Solana-purple primary color
- `tw-animate-css` plugin for animations
- PostCSS for processing

### Development Tools

**Replit-Specific Plugins**:
- `@replit/vite-plugin-runtime-error-modal` - Error overlay
- `@replit/vite-plugin-cartographer` - Code navigation
- `@replit/vite-plugin-dev-banner` - Development mode indicator

**TypeScript**: Strict mode enabled for type safety

### Database

**Neon Serverless PostgreSQL** (`@neondatabase/serverless`):
- Serverless Postgres driver optimized for edge/serverless environments
- Works over HTTP/WebSockets

**Connection**: Configured via `DATABASE_URL` environment variable

### Session Management (Template)

**Express Session**: Session middleware present in dependencies
- `connect-pg-simple` - PostgreSQL session store
- Currently not actively used in the application

### Font Loading

**Google Fonts**:
- Inter (sans-serif) for UI text
- JetBrains Mono (monospace) for code/hex displays