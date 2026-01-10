# Contributing to Personal Website Template

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 24 or higher (see `.nvmrc`)
- pnpm 10.27.0 or higher
- Git

### Setting Up Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/blog.git
   cd blog
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Copy the environment example file:
   ```bash
   cp .env.local.example .env.local
   ```
5. Fill in the required environment variables (see `.env.local.example`)
6. Start the development server:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branching Strategy

- Create a new branch for your feature or bugfix:
  ```bash
  git checkout -b feature/your-feature-name
  # or
  git checkout -b fix/your-bugfix-name
  ```

### Making Changes

1. Write code following the project's conventions
2. Add tests for new functionality
3. Ensure all tests pass:
   ```bash
   pnpm test
   pnpm test:ci
   pnpm e2e
   ```
4. Run linter and fix any issues:
   ```bash
   pnpm lint
   pnpm lint:fix
   ```
5. Format code:
   ```bash
   pnpm format
   ```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: add dark mode toggle to settings page
fix: resolve authentication redirect issue
docs: update API endpoint documentation
```

### Pull Requests

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Create a Pull Request on GitHub
3. Provide a clear description of your changes
4. Link any related issues
5. Ensure all CI checks pass

## Coding Standards

### JavaScript/React

- Use `const` and `let` instead of `var`
- Use functional components with hooks
- Follow the existing code structure and naming conventions
- Components should be in PascalCase (e.g., `NavigationBar.js`)
- Use `@/` alias for imports from `src/`

### Styling

- Use Tailwind CSS utility classes for styling
- Use shadcn/ui components for UI elements
- Follow the existing theme tokens in `globals.css`

### Testing

- Write unit tests for all new components and utilities
- Use Testing Library for component tests
- Colocate tests with the code they test (e.g., `src/components/__tests__/`)
- Aim for high test coverage

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ai-elements/  # AI-related components
├── pages/            # Next.js pages (Pages Router)
│   └── api/         # API routes
├── lib/              # Utility functions and hooks
├── locales/          # i18n translation files
└── config/           # Configuration files
```

## Adding Features

### New Pages

1. Create the page file in `src/pages/`
2. Add navigation link to `NavigationBar.js`
3. Add translations to all locale files in `src/locales/`
4. Write tests for the new page

### New API Routes

1. Create the API route in `src/pages/api/`
2. Add proper error handling
3. Add rate limiting for public endpoints
4. Validate request inputs using Zod
5. Write tests for the new route

### New Translations

1. Add the new key to `src/locales/en.json`
2. Add translations to all other locale files
3. Update `src/locales/resources.js` if needed
4. Test the translations in the UI

## Reporting Issues

When reporting bugs, please include:

- A clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, Node.js version)
- Screenshots if applicable

## Questions?

Feel free to open an issue for questions or discussions.
