# Personal Website Template

A modern, feature-rich blog website template built with Next.js and React. This project includes multilingual support, authentication, dark mode, and more.

## Features

- 🌐 Multi-language support (i18n)
- 🌙 Dark/Light theme switching
- 🔐 Authentication with GitHub and Google providers
- 💬 Comments and issue management
- 🤖 AI-powered features
- 📱 Progressive Web App (PWA) support
- 🎨 Modern UI with Tailwind CSS
- ✅ Comprehensive testing suite with Jest and Playwright
- 🧪 Unit tests for all components and utilities

## Tech Stack

- **Framework:** Next.js 15.x
- **UI Library:** React 19.x
- **Styling:** Tailwind CSS, Styled Components
- **State Management:** React Hooks, ahooks
- **Authentication:** NextAuth.js
- **Internationalization:** i18next
- **Testing:** Jest (unit tests), Playwright (E2E tests)
- **Development Tools:** ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.

### Testing

Run unit tests:

```bash
npm test
```

Run E2E tests:

```bash
npm run test:e2e
```

**Test Coverage:**
- 369 unit tests across 29 test suites
- All components and utilities fully tested
- E2E tests for critical user journeys

### Docker Support

Build and run with Docker:

```bash
# Build the image
npm run make

# Run the container
npm run exe
```

## License

Copyright (c) 2025 Jien Huang

## Bug Reports

If you find any issues, please report them [here](https://github.com/huangjien/blog/issues).
