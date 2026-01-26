---
title: Convex Development Skill
description: Adding a comprehensive Convex skill to guide AI-assisted development with Convex best practices.
---

## What We Did

Added a comprehensive Convex skill (`.claude/skills/convex/SKILL.md`) to provide AI assistants with detailed guidelines and best practices for building with Convex.

## Why Add a Convex Skill

**Convex has specific conventions and patterns** that differ from traditional backends and other BaaS platforms. A dedicated skill ensures AI assistants follow Convex best practices consistently.

**Key reasons:**
- **New function syntax**: Convex requires specific function registration patterns with validators
- **TypeScript patterns**: Convex has unique TypeScript conventions (validators, function references, etc.)
- **Schema design**: Convex schemas use a unique validator-based approach
- **Query optimization**: Avoid slow table scans by using indexes properly
- **Internal vs public functions**: Clear distinction between API endpoints and internal functions
- **Validator requirements**: All functions must have argument and return validators

**Benefits of having this skill:**
- Prevents common mistakes (e.g., using deprecated APIs, incorrect function syntax)
- Ensures consistent code quality across Convex functions
- Provides quick reference for complex patterns (pagination, file storage, cron jobs)
- Includes real-world examples (complete chat app implementation)
- Reduces need to constantly reference external documentation

## What Was Added

### Skill File Structure

Created `.claude/skills/convex/SKILL.md` with comprehensive sections:

**Function Guidelines:**
- New function syntax with validators
- HTTP endpoint patterns
- Validator types and usage
- Function registration (public vs internal)
- Function calling patterns (`ctx.runQuery`, `ctx.runMutation`, `ctx.runAction`)
- Function references via `api` and `internal` objects
- API design best practices
- Pagination patterns

**Schema Guidelines:**
- Schema definition in `convex/schema.ts`
- Index naming conventions
- System fields (`_id`, `_creationTime`)
- Validator-based table definitions

**TypeScript Guidelines:**
- Using `Id<"tableName">` types
- Record types with proper key/value typing
- Discriminated unions with `as const`
- Strict typing around document IDs

**Query Guidelines:**
- Avoiding `.filter()` in favor of indexes
- Using `.unique()` for single document queries
- Ordering (ascending/descending)
- Async iteration patterns

**Mutation Guidelines:**
- Using `ctx.db.replace` for full document replacement
- Using `ctx.db.patch` for partial updates

**Action Guidelines:**
- Adding `"use node";` directive for Node.js APIs
- No direct database access in actions
- Proper action syntax

**Scheduling Guidelines:**
- Cron job patterns (`crons.interval`, `crons.cron`)
- Avoiding deprecated helpers

**File Storage Guidelines:**
- Using `ctx.storage.getUrl()` for file URLs
- Querying `_storage` system table for metadata
- Working with `Blob` objects

**Full Text Search Guidelines:**
- Using `.withSearchIndex()` for search queries

**Complete Example:**
- Real-world chat app implementation
- Shows schema design, queries, mutations, actions
- Demonstrates internal vs public functions
- Includes AI integration with OpenAI

## Implementation Details

### Skill Structure

```
.claude/skills/convex/
└── SKILL.md
```

**Frontmatter:**
```yaml
---
name: convex
description: Guidelines and best practices for building Convex projects, including database schema design, queries, mutations, and real-world examples
---
```

### Key Sections

**1. Function Syntax Examples:**

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const f = query({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    // Function body
  },
});
```

**2. Validator Types:**

Complete reference table showing all Convex types, their JavaScript equivalents, validators, and notes:
- Id, Null, Int64, Float64, Boolean, String, Bytes
- Array, Object, Record types
- Usage examples for each

**3. Function Registration:**

```typescript
// Public functions (exposed API)
import { query, mutation, action } from "./_generated/server";

// Internal functions (private)
import { internalQuery, internalMutation, internalAction } from "./_generated/server";
```

**4. Function Calling:**

```typescript
// Within same file - requires type annotation
const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });
```

**5. Schema Design:**

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  }).index("by_channel", ["channelId"]),
});
```

### Real-World Example

The skill includes a complete chat app implementation demonstrating:

**Schema Design:**
- Users, channels, and messages tables
- Proper index definition (`by_channel` on messages)
- Optional fields (`authorId` for AI messages)

**Public APIs:**
- `createUser` - User creation
- `createChannel` - Channel creation
- `sendMessage` - Message sending with AI response scheduling
- `listMessages` - Paginated message retrieval

**Internal Functions:**
- `generateResponse` - AI response generation (internal action)
- `loadContext` - Message context loading (internal query)
- `writeAgentResponse` - AI message persistence (internal mutation)

**Technology Integration:**
- OpenAI GPT-4 for AI responses
- Proper async scheduling with `ctx.scheduler.runAfter()`
- Real-time reactive queries

## Integration with Development Workflow

### When to Use `/convex`

Invoke the Convex skill when:
- Writing new Convex functions (queries, mutations, actions)
- Defining or modifying database schemas
- Setting up indexes or search
- Working with validators
- Implementing pagination, file storage, or cron jobs
- Troubleshooting Convex-specific issues

### Skill Usage

```bash
# In Claude Code
/convex
```

The skill provides:
- Quick reference for syntax patterns
- Common gotchas and best practices
- Complete working examples
- TypeScript type patterns

## Context for AI

When AI assistants are working with Convex code, the `/convex` skill ensures they:

**Follow best practices:**
- Always use new function syntax with validators
- Include both `args` and `returns` validators
- Use indexes instead of `.filter()` for queries
- Properly distinguish public vs internal functions
- Follow TypeScript strict typing patterns

**Avoid common mistakes:**
- Using deprecated APIs (`v.bigint()`, `ctx.storage.getMetadata()`)
- Missing validators on functions
- Incorrect function calling patterns
- Improper index usage leading to slow table scans
- Using `.filter()` when an index should be defined

**Know Convex-specific patterns:**
- File-based routing (`convex/example.ts` → `api.example.functionName`)
- Function references via `api` and `internal` objects
- Reactive queries that automatically update
- Proper async patterns with actions

## Outcomes

### Before
- AI assistants needed to reference external Convex documentation
- Risk of using deprecated patterns or incorrect syntax
- Inconsistent code quality across Convex functions
- Common mistakes (missing validators, improper query patterns)

### After
- Comprehensive in-context reference for Convex development
- Consistent adherence to Convex best practices
- Quick access to common patterns and examples
- Real-world example to reference for implementation
- Reduced development friction when working with Convex

## Testing/Verification

The skill is automatically loaded when working in this repository. To verify:

```bash
# Check skill file exists
ls .claude/skills/convex/SKILL.md

# Verify it's listed in README
grep "convex" .claude/README.md

# Confirm it's in CLAUDE.md
grep "convex" CLAUDE.md
```

Expected results:
- Skill file exists at `.claude/skills/convex/SKILL.md`
- Listed in `.claude/README.md` under Available Skills
- Listed in `CLAUDE.md` under Available Skills
- AI assistants can reference `/convex` for Convex development guidance

## Next Steps

1. **Use the skill**: Invoke `/convex` when writing Convex code
2. **Extend as needed**: Add new sections for patterns discovered during development
3. **Keep updated**: Update when Convex releases new features or deprecates APIs
4. **Share patterns**: Document project-specific Convex patterns in this skill

## Related Documentation

- [Convex Backend Guide](./05-convex-backend) - Initial Convex setup
- [Convex Official Docs](https://docs.convex.dev) - Complete Convex documentation
- [Convex Functions](https://docs.convex.dev/functions) - Function documentation
- [Convex Database](https://docs.convex.dev/database) - Database operations
- [Convex TypeScript](https://docs.convex.dev/typescript) - TypeScript guide
