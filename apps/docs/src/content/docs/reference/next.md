---
title: Next.js
description: Next.js 16 patterns with App Router and React 19.
---

## Structure

```
apps/web/
├── app/                    # App Router
│   ├── (auth)/             # Auth routes (sign-in, sign-up)
│   ├── (protected)/        # Authenticated routes
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # React components
├── lib/                    # Utilities
└── next.config.ts          # Next.js config
```

## Route Groups

Route groups `(name)` organize routes without affecting URLs:

```
app/
├── (auth)/
│   ├── sign-in/page.tsx    # /sign-in
│   └── sign-up/page.tsx    # /sign-up
├── (protected)/
│   └── dashboard/page.tsx  # /dashboard
└── page.tsx                # /
```

## Layouts

### Root Layout

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
```

### Nested Layouts

```tsx
// app/(protected)/layout.tsx
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGuard>
			<Sidebar />
			<main>{children}</main>
		</AuthGuard>
	)
}
```

## Client Components

Use `"use client"` for interactive components:

```tsx
"use client"

import { useState } from "react"

export function Counter() {
	const [count, setCount] = useState(0)
	return <button onClick={() => setCount((c) => c + 1)}>{count}</button>
}
```

## Server Components

Default behavior - can fetch data directly:

```tsx
// app/page.tsx (Server Component by default)
export default async function Page() {
	const data = await fetchData()
	return <div>{data}</div>
}
```

## API Routes

```tsx
// app/api/hello/route.ts
import { NextResponse } from "next/server"

export async function GET() {
	return NextResponse.json({ message: "Hello" })
}

export async function POST(request: Request) {
	const body = await request.json()
	return NextResponse.json({ received: body })
}
```

## Imports

### UI Components

```tsx
import { Button } from "@repo/ui/components/ui/button"
import { Card } from "@repo/ui/components/ui/card"

// Or barrel import
import { Button, Card, Input } from "@repo/ui/components/ui"
```

### Utilities

```tsx
import { cn } from "@repo/ui/lib/utils"
```

### Convex

```tsx
import { api } from "@repo/backend/convex"
import { useMutation, useQuery } from "convex/react"
```

## Environment Variables

In `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOYMENT=dev:...
```

Access in code:

```tsx
// Client-side (must have NEXT_PUBLIC_ prefix)
const url = process.env.NEXT_PUBLIC_CONVEX_URL

// Server-side only
const secret = process.env.API_SECRET
```

## Commands

```bash
# Development
turbo dev --filter=web

# Build
turbo build --filter=web

# Type check
turbo check-types --filter=web
```
