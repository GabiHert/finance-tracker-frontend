# M2-F2: Input Component

## Feature Overview
- **Task ID:** M2-F2
- **Points:** 2
- **Domain:** Frontend

## Description
Text input field with validation, accessibility, and various states.

## Acceptance Criteria
- Height: 44px (mobile-friendly)
- Border: 1px solid gray-300, changes to 2px primary-500 on focus
- Border radius: 6px
- Padding: 12px horizontal, centered vertical
- Font size: 16px (prevents iOS auto-zoom)
- Placeholder: gray-400 color, 50% minimum contrast
- Focus: 3px primary-500 shadow outline
- Error state: 2px error-500 border, error-50 background
- Disabled state: gray-100 background, gray-200 border, gray-400 text
- Label support: Associated <label> for accessibility
- Icons: Support left/right icons (12px padding from text)
- Type variants: text, email, password
- Password visibility toggle: Eye icon on right

## Component Props
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
}
```

## Playwright Tests Required
- Renders with label correctly associated
- Shows error message when error prop provided
- Password toggle shows/hides password
- Disabled state prevents input
- Focus state shows correct styling
- Keyboard navigation works
- ARIA attributes present

## Files to Create
- `/src/main/components/ui/Input/Input.tsx`
- `/src/main/components/ui/Input/Input.css`
- `/src/main/components/ui/Input/index.ts`
- `/src/test/unit/components/Input.test.tsx`
- `/src/test/integration/input.spec.ts` (Playwright)
