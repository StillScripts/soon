---
name: code-review
description: Perform code reviews following professional engineering practices. Use when reviewing pull requests, examining code changes, or providing feedback on code quality. Covers security, performance, testing, and design review.
---

# Professional Code Review

Follow these guidelines when reviewing code.

## Review Checklist

### Identifying Problems

Look for these issues in code changes:

- Runtime errors: Potential exceptions, null pointer issues, out-of-bounds access
- Performance: Unbounded O(n²) operations, N+1 queries, unnecessary allocations
- Side effects: Unintended behavioral changes affecting other components
- Backwards compatibility: Breaking API changes without migration path
- Database queries: Complex queries with unexpected performance implications
- Security vulnerabilities: Injection, XSS, access control gaps, secrets exposure

### Design Assessment

- Do component interactions make logical sense?
- Does the change align with existing project architecture?
- Are there conflicts with current requirements or goals?

### Test Coverage

Every PR should have appropriate test coverage:

- Functional tests for business logic
- Integration tests for component interactions
- End-to-end tests for critical user paths

Verify tests cover actual requirements and edge cases. Avoid excessive branching or looping in test code.

### Long-Term Impact

Flag for senior engineer review when changes involve:

- Database schema modifications
- API contract changes
- New framework or library adoption
- Performance-critical code paths
- Security-sensitive functionality

## Feedback Guidelines

### Tone

- Be polite and empathetic
- Provide actionable suggestions, not vague criticism
- Phrase as questions when uncertain: "Have you considered...?"

### Approval

- Approve when only minor issues remain
- Don't block PRs for stylistic preferences
- Remember: the goal is risk reduction, not perfect code

## Common Patterns to Flag

### TypeScript/React

**Unsafe type assertions:**
```typescript
// Bad: Unsafe casting
const user = data as User;

// Good: Runtime validation
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

**Missing error boundaries:**
```tsx
// Bad: No error handling
<ComponentThatMightThrow />

// Good: Error boundary wrapper
<ErrorBoundary fallback={<ErrorMessage />}>
  <ComponentThatMightThrow />
</ErrorBoundary>
```

**Uncontrolled side effects:**
```typescript
// Bad: Side effect without dependency
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// Good: Proper dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### Security Issues

**SQL Injection:**
```typescript
// Bad: String interpolation
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// Good: Parameterized query
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

**XSS Vulnerabilities:**
```typescript
// Bad: Dangerous HTML rendering
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Good: Sanitized content
<div>{sanitize(userInput)}</div>
```

**Exposed Secrets:**
```typescript
// Bad: Hardcoded credentials
const apiKey = 'sk_live_abc123';

// Good: Environment variables
const apiKey = process.env.API_KEY;
```

## References

- [Professional Code Review Guidelines](https://develop.sentry.dev/engineering-practices/code-review/) - Industry standards from Sentry
