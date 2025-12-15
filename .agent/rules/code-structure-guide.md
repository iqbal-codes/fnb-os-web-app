---
trigger: always_on
---

# Project Rules & Guidelines

## 1. Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI Library**: Shadcn
- **Styling**: TailwindCSS
- **State Management**:
  - **Server State**: React Query (`@tanstack/react-query`)
  - **Client State**: Zustand
  - **Form State**: React Hook Form (`react-hook-form`)
- **Backend**: Supabase (via Next.js API Routes)

## 2. Coding Standards

### Type Safety

- **NO `any` TYPE**: usage of `any` is strictly prohibited. Use `unknown`, generic constraints, or explicit interfaces.
- **Strict Typing**: All props, state, and API responses must be typed.

### Form Management

- Use **React Hook Form** for all forms.
- Use **Zod** for schema validation and type inference.
- Avoid controlling form inputs with `useState` unless absolutely necessary for UI logic (not data).

### Data Fetching & API

- **NO Direct Supabase Client**: Never usage `supabase-js` client directly in UI components (`.tsx`).
- **API Routes**: All database operations must go through Next.js API Routes (`src/app/api/...`).
- **React Query**:
  - Wrap all API calls in custom hooks (e.g., `useOnboardingState`, `useBusiness`).
  - Use `useQuery` for fetching and `useMutation` for updates.
  - handle loading and error states via React Query's `isPending`, `error` properties.

### Project Structure

- **Stores**: Global client state goes in `src/stores/`.
- **Hooks**: Data fetching and reused logic goes in `src/hooks/`.
- **Components**:
  - `src/components/ui/`: Generic, reusable UI components (shadcn/ui).
  - Feature components go in their respective folders (e.g., `src/components/pos/`, `src/components/onboarding/`).

## 3. General

- Follow the existing folder structure.
- Clean up unused imports and variables.
- Use absolute imports (`@/...`).

---

## 4. Clean Code Principles

### Core Principles

- **KISS (Keep It Simple, Stupid)**: Write the simplest solution that works. Avoid over-engineering.
- **DRY (Don't Repeat Yourself)**: Extract repeated logic into reusable functions, hooks, or components.
- **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until it's actually needed.
- **SRP (Single Responsibility Principle)**: Each function/component should do ONE thing well.

### Component Decomposition

> **Rule: No component file should exceed ~200 lines.** If it does, break it into smaller pieces.

#### When to Split a Component

- Component has multiple distinct UI sections
- Component manages multiple unrelated state variables
- Component has complex conditional rendering logic
- Component is hard to understand at a glance

#### How to Split

```
❌ BAD: One massive file
src/components/onboarding/OnboardingPage.tsx (800 lines)

✅ GOOD: Decomposed into focused pieces
src/components/onboarding/
├── OnboardingPage.tsx        (main orchestrator, ~100 lines)
├── BusinessIdeaSetup.tsx     (step 1 component)
├── OpexSetup.tsx             (step 2 component)
├── EquipmentSetup.tsx        (step 3 component)
├── FirstMenuSetup.tsx        (step 4 component)
├── PlanningSummary.tsx       (step 5 component)
├── FormPersistence.tsx       (state sync logic)
└── constants.ts              (shared constants)
```

### Function Guidelines

- **Max function length**: ~30 lines. If longer, extract helper functions.
- **Max parameters**: 3-4. If more, use an options object.
- **Naming**: Function names should describe what they DO, not how they do it.

```typescript
// ❌ BAD
function processData(d: any) { ... }

// ✅ GOOD
function calculateMonthlyOpex(items: OpexItem[]): number { ... }
```

### Code Organization Within Files

```tsx
// 1. Imports (grouped: react → third-party → local)
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface Props { ... }

// 3. Constants (if file-specific)
const MAX_ITEMS = 10;

// 4. Helper functions (if small and file-specific)
function formatCurrency(amount: number) { ... }

// 5. Main component
export function MyComponent({ ... }: Props) {
  // hooks first
  // derived state
  // handlers
  // effects
  // return JSX
}
```

### Avoid These Anti-Patterns

| Anti-Pattern     | Problem                           | Solution                                 |
| ---------------- | --------------------------------- | ---------------------------------------- |
| God Component    | One component does everything     | Split into smaller, focused components   |
| Prop Drilling    | Passing props through many layers | Use Context or Zustand for shared state  |
| Copy-Paste Code  | Same logic in multiple places     | Extract into custom hook or utility      |
| Magic Numbers    | Hardcoded values without meaning  | Use named constants                      |
| Nested Ternaries | Hard to read conditional logic    | Use early returns or extract to function |

---

## 5. Naming Conventions

### Files & Folders

- **Components**: PascalCase (e.g., `BusinessIdeaSetup.tsx`, `POSInterface.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useOnboarding.ts`, `useBusiness.ts`)
- **Stores**: camelCase with `Store` suffix (e.g., `authStore.ts`, `posStore.ts`)
- **API Routes**: lowercase with hyphens (e.g., `src/app/api/onboarding/state/route.ts`)
- **Types/Interfaces**: PascalCase (e.g., `OnboardingFormValues`, `BusinessResponse`)

### Variables & Functions

- **React Components**: PascalCase (e.g., `FormPersistence`, `PlanningSummary`)
- **Functions/Hooks**: camelCase (e.g., `handleSubmit`, `useCreateBusiness`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `PATH_A_STEPS`, `ONBOARDING_KEYS`)
- **Boolean variables**: Use `is`, `has`, `should` prefixes (e.g., `isLoading`, `hasError`, `shouldRedirect`)

---

## 6. Component Patterns

### Component Structure

```tsx
// 1. Imports (grouped: react, third-party, local)
// 2. Types/Interfaces
// 3. Constants
// 4. Component function
// 5. Export
```

### Props Pattern

- Use explicit interface for props
- Destructure props in function signature
- Provide default values where sensible

```tsx
interface MyComponentProps {
  title: string;
  isActive?: boolean;
  onAction: () => void;
}

export function MyComponent({ title, isActive = false, onAction }: MyComponentProps) {
  // ...
}
```

### Conditional Rendering

- Use early returns for loading/error states
- Prefer ternary for simple conditions
- Use `&&` for single-branch conditions

---

## 7. Error Handling

### API Routes

- Always wrap database operations in try/catch
- Return consistent error response format: `{ error: string }`
- Use appropriate HTTP status codes (400, 401, 404, 500)

```typescript
try {
  // operation
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json({ error: message }, { status: 500 });
}
```

### Client-Side

- Use React Query's `error` state for API errors
- Use `toast` (sonner) for user-facing error messages
- Log errors to console for debugging

---

## 8. Performance Guidelines

### React Optimization

- Avoid anonymous functions in JSX where performance-critical
- Use `useMemo` and `useCallback` sparingly and only when necessary
- Prefer `useWatch` from react-hook-form over full `watch()` to prevent re-renders

### Data Fetching

- Set appropriate `staleTime` for React Query queries
- Use `enabled` option to conditionally fetch data
- Implement optimistic updates for better UX where appropriate

---

## 9. Accessibility (a11y)

- All interactive elements must be keyboard accessible
- Use semantic HTML elements (`button`, `nav`, `main`, `section`)
- Provide `aria-label` for icon-only buttons
- Ensure sufficient color contrast
- Form inputs must have associated labels

---

## 10. Internationalization (i18n)

- Use `next-intl` for translations
- Keep translation keys in `messages/` directory
- Use `useTranslations` hook in client components
- Use `getTranslations` in server components

---

## 11. File Organization Reference

```
src/
├── app/
│   ├── [locale]/           # Localized pages
│   │   ├── (auth)/         # Auth route group
│   │   ├── (dashboard)/    # Dashboard route group
│   │   └── (onboarding)/   # Onboarding route group
│   └── api/                # API routes (Next.js)
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── layout/             # Layout components
│   ├── onboarding/         # Onboarding feature components
│   ├── pos/                # POS feature components
│   └── ...
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, API client, supabase
├── stores/                 # Zustand stores
├── types/                  # Shared TypeScript types
└── i18n/                   # i18n configuration
```
