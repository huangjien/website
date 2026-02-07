<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AGENTS.md

This file contains instructions for agentic coding assistants working in this repository.

## Essential Commands

### Package Manager

This project uses **pnpm** as the package manager (version 10.28.2+).

### Development

```bash
pnpm dev          # Start dev server on port 8080
pnpm build        # Build for production
pnpm start        # Start production server
```

### Code Quality

```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint with auto-fix
pnpm format       # Run Prettier to format code
pnpm format:check # Check formatting without modifying files
pnpm type-check   # Run TypeScript type checking (uses jsconfig.json)
```

### Testing

```bash
pnpm test                # Run all Jest unit tests
pnpm test:watch          # Run Jest in watch mode
pnpm test:coverage       # Run Jest with coverage report
pnpm test:ci             # Run Jest in CI mode
pnpm e2e                 # Run Playwright E2E tests
pnpm e2e:ui              # Run Playwright with UI
pnpm e2e:headed          # Run Playwright in headed mode
```

### Running a Single Test

```bash
# Run a specific test file
pnpm test path/to/test-file.test.js

# Run tests matching a pattern
pnpm test --testNamePattern="test name"

# Run tests in a specific directory
pnpm test src/lib/__tests__/
```

## Code Style Guidelines

### File Structure

- **Pages:** `src/pages/` - Next.js pages and API routes
- **Components:** `src/components/` - React components
- **Lib:** `src/lib/` - Utilities, hooks, services
- **Tests:** `src/__tests__/`, `src/**/__tests__/` - Test files

### Import Order

1. React and core libraries
2. Third-party packages (sorted alphabetically)
3. Internal imports using `@/` alias
4. Relative imports (siblings first)

```javascript
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BiHome } from "react-icons/bi";
import { useGithubContent } from "@/lib/useGithubContent";
import { IssueList } from "../components/IssueList";
```

### Naming Conventions

- **Components:** PascalCase (`NavigationBar.js`, `IssueModal.js`)
- **Utilities/Hooks:** camelCase (`useGithubContent.js`, `cn.js`)
- **Test files:** `<Name>.test.js` or `<Name>.<category>.test.js`
- **API routes:** `api/<resource>.js` or `api/<resource>/[param].js`

### Components

- Use functional components with hooks
- Add JSDoc comments for exported components:

```javascript
/**
 * Renders a navigation bar with menu items and buttons.
 * @returns {JSX.Element} The rendered navigation bar.
 */
export const NavigationBar = () => {
  // ...
};
```

- Use `"use client";` directive at the top for client components
- Export named exports for components, default export for pages

### Error Handling

- **API Routes:** Use early returns with status codes

```javascript
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // ... operation
    res.status(200).json(data);
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
```

- Always validate request body in API routes
- Use proper HTTP status codes (404, 405, 500, etc.)

### Testing Patterns

- Use `@testing-library/react` for component testing
- Mock all external dependencies (next-auth, next-themes, etc.)
- Test files should be co-located with source files in `__tests__/` directories
- Test file naming: `ComponentName.test.js`, or `ComponentName.category.test.js`
- Use descriptive test names that describe the behavior

```javascript
describe("NavigationBar Component", () => {
  it("renders navigation bar with brand logo", () => {
    // Arrange & Act
    render(<NavigationBar />);
    // Assert
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
```

### Styling

- Use Tailwind CSS classes for styling
- Use `cn()` utility from `@/lib/cn` for conditional classes
- Prefer Tailwind's utility classes over inline styles
- Use `styled-components` only when necessary (configured in next.config.js)

### State Management

- Use React hooks (`useState`, `useEffect`) for local state
- Use `ahooks` for additional hooks (e.g., `useTitle`)
- Use `next-auth/react` for authentication state
- Use `next-themes` for theme management

### Internationalization

- Use `react-i18next` for translations
- Translation keys use dot notation: `t("header.home")`
- Keep translation keys in `src/locales/`

### TypeScript / JSDoc

- Project uses JavaScript with JSDoc for type hints
- Add JSDoc comments for functions with parameters and return types
- Type checking via `jsconfig.json` (not full TypeScript)

### Prettier Configuration

- Print width: 80
- Tab width: 2
- Semi: true
- Single quote: false (use double quotes)
- Trailing comma: es5
- Arrow parens: always

### ESLint Rules

- Uses `eslint-config-next` with customizations
- Prettier integration: warnings only
- `@typescript-eslint/no-explicit-any` is allowed
- No explicit module boundary types required

### Path Aliases

- `@/` maps to `src/`
- Use this alias for internal imports

## Before Committing

1. Run `pnpm lint:fix` to fix linting issues
2. Run `pnpm format` to format code
3. Run `pnpm type-check` to verify types
4. Run `pnpm test` to ensure all tests pass
5. Run `pnpm test:coverage` to check coverage thresholds (70%)

## Common Patterns

### API Route Template

```javascript
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await getServerSession(req, res);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Implementation
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
```

### Component Template

```javascript
"use client";
import React from "react";

/**
 * Component description.
 * @param {Object} props - Component props
 * @returns {JSX.Element}
 */
export const ComponentName = ({ prop1, prop2 }) => {
  return <div>...</div>;
};
```

### Hook Template

```javascript
import { useState, useEffect } from "react";

/**
 * Custom hook description.
 * @returns {*} Hook return value
 */
export const useHookName = () => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect logic
  }, []);

  return state;
};
```
