# M2-F1: Button Component

## Feature Overview
- **Task ID:** M2-F1
- **Points:** 2
- **Domain:** Frontend

## Description
Reusable button component with multiple variants, sizes, and states.

## Acceptance Criteria
- Variants: Primary, Secondary, Tertiary/Ghost, Danger, Danger Outline, Success, Link
- Sizes: xs (28px), sm (32px), md (40px), lg (48px), xl (56px)
- States: Default, Hover, Focus, Active/Pressed, Loading, Disabled
- Minimum touch target: 44×44px (mobile)
- Focus ring: 3px with primary color at 30% opacity
- Loading state: Spinner replaces text, disabled click
- Disabled: 40% opacity, gray-200 background, not-allowed cursor
- Icon support: Icons can be left/right of text or standalone
- Accessibility: ARIA labels for icon-only buttons, proper role
- Transitions: 150ms ease-out for hover, 200ms for active

## Component Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'danger-outline' | 'success' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}
```

## Playwright Tests Required
- Renders with correct variant styles
- Renders with correct size
- Shows loading spinner when isLoading=true
- Disabled state prevents clicks
- Icon renders correctly
- Keyboard navigation works
- Focus ring visible on focus

## Files to Create
- `/src/main/components/ui/Button/Button.tsx`
- `/src/main/components/ui/Button/Button.css` (or Tailwind classes)
- `/src/main/components/ui/Button/index.ts`
- `/src/test/unit/components/Button.test.tsx`
- `/src/test/integration/button.spec.ts` (Playwright)
