# Project Rules & Guidelines

## Overview

This document outlines the coding standards, conventions, and best practices for this Next.js website project. All contributors must follow these guidelines to ensure code quality, maintainability, and consistency.

## Technology Stack

- **Framework**: Next.js 15.4.2
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Internationalization**: react-i18next
- **Package Manager**: Yarn
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Next.js pages and API routes
├── locales/            # Internationalization files
├── lib/                # Utility functions and services
├── hooks/              # Custom React hooks
├── config/             # Configuration files
└── __tests__/          # Test files
```

## Code Quality Standards

### 1. Code Formatting

- Use Prettier for consistent code formatting
- Run `yarn format` before committing
- 2-space indentation for JavaScript/JSX
- Single quotes for strings
- Trailing commas where valid

### 2. Linting

- Follow ESLint configuration in `.eslintrc.json`
- Run `yarn lint` to check for issues
- Fix all linting errors before committing
- Use `yarn lint:fix` for auto-fixable issues

### 3. Naming Conventions

- **Components**: PascalCase (e.g., `NavigationBar.js`)
- **Files**: camelCase for utilities, PascalCase for components
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **CSS Classes**: Follow Tailwind conventions

## Component Guidelines

### 1. Component Structure

```javascript
// Import statements
import React from 'react';
import { useTranslation } from 'react-i18next';

// Component definition
const ComponentName = ({ prop1, prop2 }) => {
  const { t } = useTranslation();

  // Component logic

  return (
    // JSX
  );
};

export default ComponentName;
```

### 2. Component Best Practices

- Keep components small and focused (Single Responsibility Principle)
- Use functional components with hooks
- Implement proper prop validation when needed
- Extract reusable logic into custom hooks
- Use meaningful component and prop names

### 3. State Management

- Use React hooks for local state
- Prefer `useState` and `useEffect` for simple state
- Extract complex state logic into custom hooks
- Avoid prop drilling; consider context for shared state

## Internationalization (i18n)

### 1. Translation Keys

- Use nested keys for organization (e.g., `header.settings`)
- Keep keys descriptive and hierarchical
- All user-facing text must be translatable
- Add new keys to all locale files

### 2. Translation Usage

```javascript
const { t } = useTranslation();

// Correct usage
<button>{t('header.settings')}</button>

// Avoid hardcoded text
<button>Settings</button> // ❌
```

### 3. Locale Files

- Keep translation files in `src/locales/`
- Maintain consistency across all language files
- Use meaningful, hierarchical key structures
- Test translation keys exist before using

## Testing Standards

### 1. Test Structure

- Place tests in `__tests__` directories
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies appropriately

### 2. Component Testing

```javascript
import { render, screen } from "@testing-library/react";
import Component from "../Component";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe("Component", () => {
  it("should render correctly", () => {
    render(<Component />);
    expect(screen.getByText("expected.text")).toBeInTheDocument();
  });
});
```

### 3. Testing Requirements

- Minimum 80% code coverage
- Test critical user interactions
- Test error states and edge cases
- Mock external API calls
- Run tests before committing: `yarn test`

## Git Workflow

### 1. Commit Messages

- Use conventional commit format
- Examples:
  - `feat: add user authentication`
  - `fix: resolve translation key issue`
  - `docs: update README`
  - `test: add component tests`

### 2. Branch Naming

- `feature/description` for new features
- `fix/description` for bug fixes
- `docs/description` for documentation
- `test/description` for test additions

### 3. Pre-commit Hooks

- Husky runs pre-commit checks
- Ensures code formatting and linting
- Runs relevant tests
- Prevents commits with issues

## Performance Guidelines

### 1. Next.js Optimization

- Use Next.js Image component for images
- Implement proper SEO meta tags
- Utilize static generation where possible
- Optimize bundle size with dynamic imports

### 2. React Optimization

- Use React.memo for expensive components
- Implement proper key props in lists
- Avoid unnecessary re-renders
- Use useCallback and useMemo judiciously

## Security Guidelines

### 1. Environment Variables

- Store sensitive data in environment variables
- Use `.env.local` for local development
- Never commit secrets to version control
- Follow `.env.local.example` template

### 2. API Security

- Validate all inputs
- Implement proper authentication
- Use HTTPS in production
- Sanitize user inputs

## Accessibility (a11y)

### 1. Requirements

- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Test with screen readers

### 2. Best Practices

- Use meaningful alt text for images
- Implement focus management
- Provide skip links for navigation
- Use proper heading hierarchy

## Development Workflow

### 1. Setup

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Run tests
yarn test

# Run linting
yarn lint

# Format code
yarn format
```

### 2. Before Committing

1. Run `yarn lint` and fix all issues
2. Run `yarn test` and ensure all tests pass
3. Run `yarn format` to format code
4. Verify changes work in development
5. Write meaningful commit message

### 3. Code Review

- All changes require code review
- Check for adherence to these guidelines
- Verify tests are included and passing
- Ensure documentation is updated

## Error Handling

### 1. Error Boundaries

- Implement error boundaries for critical components
- Provide fallback UI for errors
- Log errors appropriately

### 2. API Error Handling

- Handle network errors gracefully
- Provide user-friendly error messages
- Implement retry mechanisms where appropriate

## Documentation

### 1. Code Documentation

- Write clear, concise comments
- Document complex logic
- Use JSDoc for function documentation
- Keep README.md updated

### 2. Component Documentation

- Document component props and usage
- Provide examples for complex components
- Document any special requirements

## Deployment

### 1. Production Checklist

- All tests passing
- No console errors or warnings
- Performance optimized
- Security measures in place
- Environment variables configured

### 2. CI/CD

- Automated testing on pull requests
- Automated deployment on merge
- Monitor application performance
- Set up error tracking

## Maintenance

### 1. Dependencies

- Keep dependencies updated
- Review security vulnerabilities
- Test after major updates
- Document breaking changes

### 2. Code Quality

- Regular code reviews
- Refactor when necessary
- Remove dead code
- Monitor technical debt

---

## Enforcement

These rules are enforced through:

- ESLint configuration
- Prettier formatting
- Husky pre-commit hooks
- Code review process
- Automated testing

Violations should be addressed promptly to maintain code quality and project consistency.

## Questions?

If you have questions about these guidelines or need clarification, please:

1. Check existing documentation
2. Review similar implementations in the codebase
3. Ask team members during code review
4. Update this document if guidelines need clarification

---

_Last updated: [Current Date]_
_Version: 1.0_
