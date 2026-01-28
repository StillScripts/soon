# Web App

Next.js 16 application with React 19.

## Development

From the monorepo root:

```bash
turbo dev --filter=web
```

Or from this directory:

```bash
bun dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and configure the Convex URLs after setting up the backend:

```bash
cp .env.example .env.local
```

## Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components
- `lib/` - Utility functions and configurations

## Dependencies

- Uses `@repo/ui` for shared components
- Uses `@repo/backend` for Convex client and types
- Uses `@repo/validators` for shared validation
