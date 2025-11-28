# M3-F2: Modal Component

## Feature Overview
- **Task ID:** M3-F2
- **Points:** 3
- **Domain:** Frontend
- **Reference:** Frontend UI v3.0 Section 3.5.2

## Description
Reusable modal/dialog component with backdrop, sizes, and accessibility features.

## Acceptance Criteria
- Backdrop: black at 50% opacity
- Sizes: Small (400px), Medium (560px), Large (720px), Full (90vw max 1200px)
- Max height: 90vh
- Border radius: 12px
- Padding: 24px
- Header: 20px font-semibold
- Close button: 32px, top-right, gray-400
- Footer: Right-aligned buttons, 16px gap
- Body scrolls while header/footer stay fixed
- Entry animation: scale from 95% + fade, 300ms
- Exit animation: scale to 95% + fade, 200ms
- Focus trap: Tab cycles within modal
- Escape key: Closes modal (configurable)
- Click outside: Closes modal (configurable)
- z-index: 500 for backdrop, 510 for modal content

## Component Props
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  'data-testid'?: string;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}
```

## Playwright Tests Required
```typescript
test.describe('Modal Component', () => {
  test('opens and displays content', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="open-modal-btn"]');
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="modal-title"]')).toBeVisible();
  });

  test('closes on escape key', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="open-modal-btn"]');
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });

  test('closes on backdrop click', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="open-modal-btn"]');
    await page.locator('[data-testid="modal-backdrop"]').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });

  test('traps focus within modal', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="open-modal-btn"]');
    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();
    // Tab through elements and verify focus stays in modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  });

  test('renders different sizes', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="open-modal-md"]');
    const modal = page.locator('[data-testid="modal-content"]');
    await expect(modal).toHaveCSS('max-width', '560px');
  });

  test('close button works', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="open-modal-btn"]');
    await page.click('[data-testid="modal-close-btn"]');
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });
});
```

## Files to Create
- `/src/main/components/ui/Modal/Modal.tsx`
- `/src/main/components/ui/Modal/Modal.css`
- `/src/main/components/ui/Modal/index.ts`
- `/src/test/integration/modal.spec.ts` (Playwright)
