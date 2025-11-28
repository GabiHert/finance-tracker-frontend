# M3-F3: Select/Dropdown Component

## Feature Overview
- **Task ID:** M3-F3
- **Points:** 3
- **Domain:** Frontend
- **Reference:** Frontend UI v3.0 Section 3.2.3

## Description
Native-enhanced select component with custom dropdown styling.

## Acceptance Criteria
- Trigger height: 44px (same as input)
- Trigger border: 1px solid gray-300
- Chevron icon: 20px, gray-400, right-aligned
- Dropdown background: white
- Dropdown border: 1px solid gray-200
- Dropdown shadow: shadow-lg
- Dropdown max height: 280px with overflow scroll
- Option height: 40px
- Option padding: 12px horizontal
- Option hover: gray-50 background
- Option selected: primary-50 background, primary-600 text
- Option disabled: gray-300 text, cursor not-allowed
- Search input (if enabled): sticky at top
- Multi-select: checkboxes on left of each option
- Clear all link for multi-select
- Focus state: 2px primary-500 border

## Component Props
```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  'data-testid'?: string;
}
```

## Playwright Tests Required
```typescript
test.describe('Select Component', () => {
  test('opens dropdown on click', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="select-trigger"]');
    await expect(page.locator('[data-testid="select-dropdown"]')).toBeVisible();
  });

  test('selects option', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="select-trigger"]');
    await page.click('[data-testid="select-option-1"]');
    await expect(page.locator('[data-testid="select-trigger"]')).toContainText('Option 1');
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="select-trigger"]');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  });

  test('searchable select filters options', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="select-searchable"]');
    await page.fill('[data-testid="select-search"]', 'food');
    const options = page.locator('[data-testid^="select-option"]');
    await expect(options).toHaveCount(1);
  });

  test('multi-select allows multiple selections', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="select-multi"]');
    await page.click('[data-testid="select-option-1"]');
    await page.click('[data-testid="select-option-2"]');
    await expect(page.locator('[data-testid="select-trigger"]')).toContainText('2 selected');
  });

  test('disabled state prevents interaction', async ({ page }) => {
    await page.goto('/test/components');
    const trigger = page.locator('[data-testid="select-disabled"]');
    await expect(trigger).toHaveAttribute('aria-disabled', 'true');
  });

  test('error state shows error message', async ({ page }) => {
    await page.goto('/test/components');
    await expect(page.locator('[data-testid="select-error-message"]')).toBeVisible();
  });
});
```

## Files to Create
- `/src/main/components/ui/Select/Select.tsx`
- `/src/main/components/ui/Select/Select.css`
- `/src/main/components/ui/Select/index.ts`
- `/src/test/integration/select.spec.ts` (Playwright)
