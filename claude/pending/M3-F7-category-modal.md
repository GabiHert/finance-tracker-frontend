# M3-F7: Category Create/Edit Modal

## Feature Overview
- **Task ID:** M3-F7
- **Points:** 3
- **Domain:** Frontend
- **Reference:** Frontend UI v3.0 Section 4.4.2

## Description
Modal for creating and editing categories with form fields, icon picker, color picker, and live preview.

## Acceptance Criteria
- Modal width: 480px
- Create mode: "Nova Categoria" title
- Edit mode: "Editar Categoria" title
- Fields:
  1. Name input: 50 character max, required
  2. Type selector: Segment control (Despesa / Receita)
  3. Icon picker: Grid of 48 common icons, searchable
  4. Color picker: 12 preset colors + custom hex input
  5. Preview: Live preview of icon with selected color
- Validation: Name required, show error messages
- API integration: POST for create, PATCH for update
- Loading state during submission
- Success: Close modal, show toast, refresh list
- Error: Show error toast, keep modal open

## Component Props
```typescript
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category; // undefined for create, populated for edit
  onSuccess?: () => void;
}

interface CategoryFormData {
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
}
```

## Playwright Tests Required
```typescript
test.describe('Category Create/Edit Modal', () => {
  test('create mode: displays empty form', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await expect(page.locator('[data-testid="category-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="modal-title"]')).toContainText('Nova Categoria');
    await expect(page.locator('[data-testid="name-input"]')).toHaveValue('');
  });

  test('edit mode: displays category data', async ({ page }) => {
    await page.route('**/api/v1/categories**', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          categories: [{ id: '1', name: 'Food', color: '#FF5733', icon: 'utensils', type: 'expense' }],
        }),
      })
    );
    await page.goto('/categories');
    await page.locator('[data-testid="category-card"]').hover();
    await page.click('[data-testid="edit-category-btn"]');
    await expect(page.locator('[data-testid="modal-title"]')).toContainText('Editar Categoria');
    await expect(page.locator('[data-testid="name-input"]')).toHaveValue('Food');
  });

  test('validates required name field', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await page.click('[data-testid="save-category-btn"]');
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
  });

  test('type selector switches between expense/income', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await page.click('[data-testid="type-income"]');
    await expect(page.locator('[data-testid="type-income"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('icon picker changes icon', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await page.click('[data-testid="icon-car"]');
    await expect(page.locator('[data-testid="preview-icon"]')).toHaveAttribute('data-icon', 'car');
  });

  test('color picker changes color', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await page.click('[data-testid="color-swatch-2"]');
    // Verify preview shows new color
  });

  test('live preview updates with selections', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await page.fill('[data-testid="name-input"]', 'Transport');
    await page.click('[data-testid="icon-car"]');
    await page.click('[data-testid="color-swatch-3"]');
    // Verify preview shows icon with color
  });

  test('successfully creates category', async ({ page }) => {
    await page.route('**/api/v1/categories', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          body: JSON.stringify({
            id: 'new-id',
            name: 'Transport',
            color: '#EF4444',
            icon: 'car',
            type: 'expense',
          }),
        });
      } else {
        route.fulfill({ status: 200, body: JSON.stringify({ categories: [] }) });
      }
    });
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await page.fill('[data-testid="name-input"]', 'Transport');
    await page.click('[data-testid="icon-car"]');
    await page.click('[data-testid="save-category-btn"]');
    await expect(page.locator('[data-testid="category-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('shows loading state during submission', async ({ page }) => {
    await page.route('**/api/v1/categories', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((r) => setTimeout(r, 1000));
        route.fulfill({ status: 201, body: JSON.stringify({}) });
      } else {
        route.fulfill({ status: 200, body: JSON.stringify({ categories: [] }) });
      }
    });
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await page.fill('[data-testid="name-input"]', 'Test');
    await page.click('[data-testid="save-category-btn"]');
    await expect(page.locator('[data-testid="save-category-btn"]')).toHaveAttribute('data-loading', 'true');
  });

  test('handles API error', async ({ page }) => {
    await page.route('**/api/v1/categories', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 409, body: JSON.stringify({ error: 'Category name already exists' }) });
      } else {
        route.fulfill({ status: 200, body: JSON.stringify({ categories: [] }) });
      }
    });
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await page.fill('[data-testid="name-input"]', 'Duplicate');
    await page.click('[data-testid="save-category-btn"]');
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-modal"]')).toBeVisible();
  });

  test('cancel closes modal without saving', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await page.fill('[data-testid="name-input"]', 'Test');
    await page.click('[data-testid="cancel-btn"]');
    await expect(page.locator('[data-testid="category-modal"]')).not.toBeVisible();
  });
});
```

## Files to Create
- `/src/main/features/categories/components/CategoryModal.tsx`
- `/src/main/features/categories/components/CategoryForm.tsx`
- `/src/main/features/categories/components/CategoryPreview.tsx`
- Add to `/src/test/integration/categories.spec.ts` (Playwright)
