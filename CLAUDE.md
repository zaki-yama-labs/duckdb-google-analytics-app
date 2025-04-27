# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (React + TypeScript)
- `cd frontend && pnpm dev` - Start the frontend development server
- `cd frontend && pnpm build` - Build the frontend for production
- `cd frontend && pnpm preview` - Preview the production build

### Backend (Cloudflare Worker)
- `cd backend && npx wrangler dev` - Start the backend development server
- `cd backend && npx wrangler deploy` - Deploy to Cloudflare Workers

## Code Style

- **TypeScript**: Use strict typing (no `any` where possible)
- **React**: Use functional components with hooks
- **Formatting**: 2-space indentation, single quotes for strings
- **Error Handling**: Use try/catch with specific error messages
- **Imports**: Group by source (React, libraries, local), sort alphabetically
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **API Calls**: Wrap in try/catch blocks, show loading states, handle errors
- **Module Format**: Use ES modules (import/export), not CommonJS