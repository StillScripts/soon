# Web App

Next.js 16 application with React 19, Convex backend, and Better Auth.

## Development

From the monorepo root:

```bash
turbo dev --filter=web
```

Opens at [http://localhost:3000](http://localhost:3000).

**Note**: Also start the Convex backend in a separate terminal:

```bash
cd packages/backend && bunx convex dev
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOYMENT` - Convex deployment name

## Structure

```
app/                    # Next.js App Router
├── (auth)/             # Auth routes (sign-in, sign-up)
├── (protected)/        # Authenticated routes
├── api/                # API routes (Better Auth)
└── layout.tsx          # Root layout with providers

components/             # React components
├── auth/               # Auth-related components
├── things/             # Things CRUD components
└── ...

lib/
├── auth-client.ts      # Better Auth client
└── convex/             # Convex client setup
```

## Dependencies

- `@repo/ui` - Shared UI components (shadcn/ui)
- `@repo/backend` - Convex client and types
- `@repo/validators` - Shared Zod validation schemas
