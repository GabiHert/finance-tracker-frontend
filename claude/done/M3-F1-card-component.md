# M3-F1: Card Component

## Feature Overview
- **Task ID:** M3-F1
- **Points:** 2
- **Domain:** Frontend
- **Reference:** Frontend UI v3.0 Section 3.3

## Description
Reusable card component with base styling and clickable variant for displaying content.

## Acceptance Criteria
- Base card with white background, 1px gray-200 border, 8px border radius
- Padding: 24px (desktop), 16px (mobile)
- Shadow: shadow-sm default
- Clickable variant: hover shows shadow-md and translateY(-2px)
- Focus state: focus ring around entire card
- Active state: shadow-xs, translateY(0)
- Support for header, body, and footer sections

## Component Props
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'clickable';
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  'data-testid'?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}
```

## Playwright Tests Required
```typescript
test.describe('Card Component', () => {
  test('renders with default styling', async ({ page }) => {
    await page.goto('/test/components');
    const card = page.locator('[data-testid="card-default"]');
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(card).toHaveCSS('border-radius', '8px');
  });

  test('clickable variant shows hover effect', async ({ page }) => {
    await page.goto('/test/components');
    const card = page.locator('[data-testid="card-clickable"]');
    await card.hover();
    // Verify shadow and transform changes
  });

  test('keyboard navigation works for clickable cards', async ({ page }) => {
    await page.goto('/test/components');
    const card = page.locator('[data-testid="card-clickable"]');
    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press('Enter');
  });

  test('renders header, body, footer sections', async ({ page }) => {
    await page.goto('/test/components');
    await expect(page.locator('[data-testid="card-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-body"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-footer"]')).toBeVisible();
  });
});
```

## Files to Create
- `/src/main/components/ui/Card/Card.tsx`
- `/src/main/components/ui/Card/Card.css`
- `/src/main/components/ui/Card/index.ts`
- `/src/test/integration/card.spec.ts` (Playwright)
