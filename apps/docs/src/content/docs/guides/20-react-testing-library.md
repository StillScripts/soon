---
title: React Testing Library Setup
description: Adding React Testing Library tests for frontend components in the web app.
---

## What We Did

Added comprehensive React Testing Library (RTL) test coverage for the `AuthForm` component, establishing patterns for frontend component testing in the Next.js web application.

## Why React Testing Library

React Testing Library encourages testing components the way users interact with them, rather than testing implementation details. This approach:

- **User-centric**: Tests query elements by accessible roles, labels, and text
- **Resilient**: Tests don't break when refactoring internal component structure
- **Confidence**: Validates actual user workflows rather than internal state
- **Best practices**: Enforces accessible markup through its query priorities

Combined with Vitest's speed and jsdom environment, this provides fast, reliable component tests.

## What Was Added

### Dependencies

Added to `apps/web/package.json`:

```json
{
	"devDependencies": {
		"@testing-library/react": "^16.0.0",
		"@testing-library/user-event": "^14.6.1",
		"@testing-library/jest-dom": "^6.9.1"
	}
}
```

- **@testing-library/react**: Core RTL with React 19 support
- **@testing-library/user-event**: Simulates realistic user interactions
- **@testing-library/jest-dom**: Custom matchers like `toBeInTheDocument()`

### Vitest Setup File

Created `apps/web/vitest.setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest"
```

This imports jest-dom matchers globally for all tests.

### Vitest Configuration

Updated `apps/web/vitest.config.ts`:

```typescript
export default defineConfig({
	plugins: [react()],
	...sharedConfig,
	test: {
		...sharedConfig.test,
		environment: "jsdom",
		passWithNoTests: true,
		setupFiles: ["./vitest.setup.ts"],
		alias: {
			"@/": new URL("./", import.meta.url).pathname,
		},
	},
})
```

Key changes:

- Added `setupFiles` to load jest-dom matchers
- Fixed alias path from `./src/` to `./` (web app has no src folder)

### Test File Structure

Created `apps/web/components/auth-form.test.tsx` with 25 tests covering:

**Rendering (3 tests)**

- Default login mode rendering
- Email and password field presence
- Signup mode when toggled

**Mode Switching (2 tests)**

- Login to signup transition
- Signup back to login transition

**Validation (8 tests)**

- Email: required, format validation, valid acceptance
- Password: required, minimum length, valid acceptance
- Name: required in signup mode, valid acceptance

**Form Submission (8 tests)**

- Login: API call, error handling, default error, loading state
- Signup: API call, error handling, default error, loading state

**Error Handling (3 tests)**

- Network errors
- Non-Error thrown objects
- Error clearing on mode switch

**Input States (1 test)**

- Disabled during loading

## Testing Patterns

### Mocking External Dependencies

```typescript
vi.mock("@/lib/auth-client", () => ({
	authClient: {
		signIn: { email: vi.fn() },
		signUp: { email: vi.fn() },
	},
}))
```

### User Interactions with userEvent

```typescript
const user = userEvent.setup()
await user.type(screen.getByLabelText("Email"), "test@example.com")
await user.click(screen.getByRole("button", { name: "Sign in" }))
```

### Async Validation with waitFor

```typescript
await waitFor(() => {
	expect(screen.getByText("Email is required")).toBeInTheDocument()
})
```

### Testing onChange Validation

The AuthForm uses TanStack Form with `onChange` validators. To test "required" validation, you must type and then clear the field:

```typescript
await user.type(emailInput, "a")
await user.clear(emailInput)
await user.tab()

await waitFor(() => {
	expect(screen.getByText("Email is required")).toBeInTheDocument()
})
```

### Testing Loading States

```typescript
let resolvePromise: (value: unknown) => void
vi.mocked(authClient.signIn.email).mockReturnValue(
	new Promise((resolve) => {
		resolvePromise = resolve
	}) as never
)

// Trigger submission
await user.click(screen.getByRole("button", { name: "Sign in" }))

// Assert loading state
expect(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled()

// Clean up
resolvePromise!({ data: {} })
```

## Running Tests

```bash
# Run web app tests
turbo test --filter=web

# Watch mode
turbo test:watch --filter=web

# Run all tests in monorepo
turbo test
```

## Important Notes

### Query Priority

Follow RTL's [query priority](https://testing-library.com/docs/queries/about#priority):

1. `getByRole` - Accessible queries (preferred)
2. `getByLabelText` - Form fields
3. `getByPlaceholderText` - When label isn't available
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort

### Act Warnings

Some tests may show `act()` warnings when testing loading states with unresolved promises. These are warnings, not failures, and occur because the promise resolves after the test completes.

### Don't Use bun test

The web app tests require Vitest's jsdom environment. Running `bun test` directly will fail because Bun's native test runner doesn't set up jsdom. Always use `turbo test` or `vitest run`.

## References

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)
- [Vitest with React](https://vitest.dev/guide/browser.html)
- [Query Priority Guide](https://testing-library.com/docs/queries/about#priority)
