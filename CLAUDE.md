# This guide defines strict conventions, standards, and best practices for development using modern web technologies: ReactJS, NextJS, Redux, TypeScript, JavaScript, HTML, CSS, and UI frameworks.

## General Guidelines

### Development Philosophy
- Write clean, maintainable, scalable code.
- Emphasize SOLID principles.
- Prefer functional and declarative code over imperative.
- Ensure strict type safety and static analysis.
- Focus on component-driven development.
- Avoid premature optimization.
- Every module or component should be testable and independently replaceable.
- Prioritize readability over cleverness.
- Eliminate technical debt as part of regular development.

### Folder Structure
- Root folders must follow the domain-driven design (DDD) feature-based pattern.
- Use kebab-case for all folder names.
- Suggested root folders:
    - `app`: Next.js app directory (routes, layouts, pages).
    - `components`: Reusable UI components.
    - `features`: Business logic grouped by domain/feature (e.g., `features/auth`, `features/dashboard`).
    - `hooks`: Custom React hooks.
    - `lib`: Utilities, helpers, third-party integrations.
    - `store`: Redux slices, selectors, middleware.
    - `types`: Shared global TypeScript definitions.
    - `styles`: Tailwind config, global CSS if necessary.
    - `config`: Application configuration and environment setup.
    - `constants`: Shared constant values (e.g., enums, labels).
    - `tests`: Shared testing utilities and mocks.
- All feature folders under `features/` must contain:
    - `components/`: Feature-specific components.
    - `api/`: API calls related to the feature.
    - `slices/`: Redux Toolkit slices for state management.
    - `types.ts`: TypeScript types for the feature.
    - `index.ts`: Public interface for the feature.

## Code Implementation Guidelines

### Planning Phase
- Begin with step-by-step planning.
- Write detailed pseudocode before implementation.
- Document component architecture and data flow.
- Consider edge cases and error scenarios.

### Code Style
- Use tabs for indentation.
- Use single quotes for strings (except to avoid escaping).
- Omit semicolons unless required for disambiguation.
- Eliminate unused variables.
- Add space after keywords and before function parentheses.
- Always use strict equality (`===`) instead of loose (`==`).
- Space infix operators and after commas.
- Keep `else` on same line as closing brace.
- Use curly braces for multi-line `if` statements.
- Handle error parameters in callbacks.
- Limit line length to 80 characters.
- Use trailing commas in multiline literals.

## Naming Conventions

### General
- PascalCase for components, interfaces, types.
- camelCase for variables, functions, methods, hooks, props.
- kebab-case for folders and file names.
- UPPERCASE for constants, env variables, global configs.

### Patterns
- Prefix event handlers with `handle`: `handleClick`.
- Prefix booleans with verbs: `isLoading`, `canSubmit`.
- Prefix custom hooks with `use`: `useForm`.
- Avoid abbreviations unless common: `req`, `res`, `err`.

## React Best Practices

### Component Architecture
- Always use functional components.
- Use TypeScript interfaces for props and state.
- Extract logic into custom hooks.
- Compose components, avoid duplication.
- Use `React.memo()` where beneficial.
- Use `useEffect` cleanup properly.

### Performance
- Use `useCallback` to memoize handlers.
- Use `useMemo` for expensive calculations.
- Avoid inline functions in JSX.
- Always separate CSS from html in different files.
- Apply dynamic imports for code splitting.
- Always use meaningful `key` in lists (not index).

## Next.js Best Practices

### Core
- Prefer App Router over Pages Router.
- Manage metadata via layout files.
- Apply correct caching strategies.
- Use error boundaries in layout/root components.

### Features
- Use built-in components:
    - `Image` for images
    - `Link` for routing
    - `Head` for metadata
    - `Script` for external scripts
- Implement loading states properly.
- Use appropriate data fetching: `fetch`, `getServerSideProps`, etc.

### Server Components
- Default to Server Components.
- Use client directive only when needed:
    - State, event handlers, DOM APIs.
- Use URL query params for data/state.

### TypeScript Guidelines
- Enable `strict` mode.
- Prefer `interface` over `type` for extendability.
- Define props and state with interfaces.
- Use type guards for nullable types.
- Apply generics where flexibility is needed.
- Use utility types: `Partial`, `Omit`, `Pick`, etc.
- Use mapped types for derived structures.

## UI and Styling

### Component Libraries
- Use Shadcn UI for components.
- Use Radix UI for low-level accessible components.

### Styling
- Use Tailwind CSS (utility-first).
- Always apply mobile-first principles.
- Implement dark mode via CSS vars or Tailwind.
- Follow consistent spacing and color contrast ratios.
- Use theme tokens and CSS variables for maintainability.

## State Management

### Local State
- Use `useState` for simple state.
- Use `useReducer` for complex logic.
- Use `useContext` for cross-component state.

### Global State
- Use Redux Toolkit.
- Prefer `createSlice` for reducers/actions.
- Normalize state shape.
- Avoid deep nesting.
- Use selectors.
- Split slices by domain feature.

## Error Handling and Validation

### Forms
- Use `Zod` for validation.
- Prefer `React Hook Form` for forms.
- Always display user-friendly error messages.

### Errors
- Use error boundaries for graceful failure.
- Log errors to external service (e.g., Sentry).
- Show fallback UIs for broken components.

## Testing

### Unit Tests
- Use Jest and RTL.
- Follow Arrange-Act-Assert pattern.
- Mock dependencies and APIs.

### Integration Tests
- Simulate user workflows.
- Isolate test environments.
- Use snapshot testing with caution.
- Use `screen` utility from RTL for clarity.

### Accessibility (a11y)
- Use semantic HTML.
- Add ARIA attributes as needed.
- Support full keyboard navigation.
- Maintain focus order and visibility.
- Ensure proper color contrast.
- Use correct heading levels.
- Make all interactive elements accessible.
- Provide accessible error messages.

### Security
- Sanitize inputs (e.g., DOMPurify).
- Prevent XSS and code injection.
- Use secure authentication.

### Internationalization (i18n)
- Use `next-i18next`.
- Support locale detection.
- Format numbers, dates, currency.
- Ensure RTL layout compatibility.

### Documentation
- Use JSDoc with full sentences.
- Document public functions, classes, types.
- Include examples when useful.
- Format with proper markdown, code blocks, headings, and links.

## Folder Structure & Organization

To enforce clarity, scalability, and domain separation, all code must be organized under the `/src` directory using a clear distinction between main code and test code.

### Root Structure
/src/
├── main/            # Application source code (domain, UI, logic)
│   ├── app/         # Next.js App Router (routing, layouts, pages)
│   ├── components/  # Shared UI components
│   ├── features/    # Domain-specific modules and logic
│   ├── hooks/       # Custom reusable React hooks
│   ├── lib/         # Utilities, helpers, and integrations
│   ├── store/       # Redux slices, middleware, and selectors
│   ├── types/       # Global TypeScript types and interfaces
│   ├── styles/      # Tailwind config and global styles
│   ├── config/      # Application and environment configuration
│   └── constants/   # Global constants and enums
│
├── public/          # Public-related assets (images, fonts, etc.)
│   ├── images/      # Static images
│   ├── fonts/       # Custom fonts
│   └── icons/       # SVGs and icons
│
├── test/            # Testing-related code
│   ├── unit/        # Unit tests
│   ├── integration/ # Integration and workflow tests
│   ├── mocks/       # Mocked data, services, and test utilities
│   └── setup/       # Test environment setup files


### Feature-Based Structure

Every domain feature should live under `src/main/features/<feature>/`, following this pattern:
/src/main/features/
└── auth/
├── components/     # Feature-specific UI components
├── api/            # API communication logic
├── slices/         # Redux slice, actions, selectors
├── types.ts        # Feature-scoped TypeScript types
└── index.ts        # Public exports of the feature

### Naming Conventions

- Directories: kebab-case
- Files: kebab-case (e.g., `login-form.tsx`, `use-auth.ts`)
- Components: PascalCase (e.g., `LoginForm.tsx`)
- Redux slices: `<feature>Slice.ts` (e.g., `authSlice.ts`)

### Re-Exporting & Imports

- Every folder should expose public API via `index.ts`
- Consumers must import from the root of the feature

```ts
// ✅ Preferred
import { loginUser } from '@/main/features/auth'

// ❌ Avoid deep imports
import { loginUser } from '@/main/features/auth/api/login'
```

Test Placement Rules
•	All test files must be placed under /src/test/, mirroring the structure of /src/main/ when needed.
•	Shared mocks, setup files, and utilities must live in /src/test/mocks/ and /src/test/setup/.

Example test path
/src/test/unit/features/auth/login-user.test.ts


