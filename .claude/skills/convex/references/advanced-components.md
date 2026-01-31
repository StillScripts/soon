# Convex Component Authoring

Create self-contained, reusable Convex components with proper isolation, exports, and dependency management for sharing across projects.

## Documentation Sources

- Primary: https://docs.convex.dev/components
- Component Authoring: https://docs.convex.dev/components/authoring
- LLM-optimized: https://docs.convex.dev/llms.txt

## What Are Convex Components?

Convex components are self-contained packages that include:

- Database tables (isolated from the main app)
- Functions (queries, mutations, actions)
- TypeScript types and validators
- Optional frontend hooks

## Component Structure

```
my-convex-component/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts           # Main exports
│   ├── component.ts       # Component definition
│   ├── schema.ts          # Component schema
│   └── functions/
│       ├── queries.ts
│       ├── mutations.ts
│       └── actions.ts
└── convex.config.ts       # Component configuration
```

## Component Configuration

```typescript
// convex.config.ts
import { defineComponent } from "convex/server"

export default defineComponent("myComponent")
```

## Component Schema

```typescript
// src/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	items: defineTable({
		name: v.string(),
		data: v.any(),
		createdAt: v.number(),
	}).index("by_name", ["name"]),
})
```

## Using a Component

```typescript
// In the consuming app's convex/convex.config.ts
import { defineApp } from "convex/server"
import myComponent from "my-convex-component"

const app = defineApp()
app.use(myComponent, { name: "myComponent" })

export default app
```

```typescript
// In the consuming app's code
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"

function MyApp() {
  const items = useQuery(api.myComponent.list, { limit: 10 })
  const createItem = useMutation(api.myComponent.create)

  return (/* ... */)
}
```

## Publishing a Component

```json
{
	"name": "my-convex-component",
	"version": "1.0.0",
	"main": "dist/index.js",
	"types": "dist/index.d.ts",
	"files": ["dist", "convex.config.ts"],
	"peerDependencies": {
		"convex": "^1.0.0"
	}
}
```

## Best Practices

- Keep component tables isolated (don't reference main app tables)
- Export clear TypeScript types for consumers
- Document all public functions and their arguments
- Use semantic versioning for component releases
- Test components in isolation before publishing

## Common Pitfalls

1. **Cross-referencing tables** - Component tables should be self-contained
2. **Missing type exports** - Export all necessary types
3. **Hardcoded configuration** - Use component options for customization
4. **No versioning** - Follow semantic versioning
5. **Poor documentation** - Document all public APIs
