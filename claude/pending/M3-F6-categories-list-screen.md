# M3-F6: Categories List Screen

## Feature Overview
- **Task ID:** M3-F6
- **Points:** 3
- **Domain:** Frontend
- **Reference:** Frontend UI v3.0 Section 4.4.1

## Description
Screen displaying user's categories in a grid layout with filtering and management.

## Acceptance Criteria
- Tabs: "Minhas Categorias" | "Categorias do Grupo" (if in groups)
- Tab style: Underline indicator, primary-500
- Grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Card size: Flexible width, 120px height
- Gap: 16px between cards
- Empty state: "Nenhuma categoria" with "Criar Categoria" CTA
- Header: Page title, category count, "Nova Categoria" button
- Loading state: Skeleton grid

## Category Card Content
- Icon: Left side, 48px circle with category color background, white 24px icon
- Name: 16px, font-semibold, truncate if needed
- Type badge: 12px chip, "DESPESA" or "RECEITA", subtle colors
- Stats: "X transações" and "R$ X.XXX este mês"
- Hover actions: Edit and Delete icons appear

## Component Props
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'expense' | 'income';
  transactionCount?: number;
  periodTotal?: number;
}

interface CategoriesScreenProps {
  // Internal state managed by component
}
```

## Playwright Tests Required
```typescript
test.describe('Categories List Screen', () => {
  test('displays categories grid', async ({ page }) => {
    await page.route('**/api/v1/categories**', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          categories: [
            { id: '1', name: 'Food', color: '#FF5733', icon: 'utensils', type: 'expense' },
            { id: '2', name: 'Transport', color: '#33FF57', icon: 'car', type: 'expense' },
          ],
        }),
      })
    );
    await page.goto('/categories');
    await expect(page.locator('[data-testid="category-card"]')).toHaveCount(2);
  });

  test('shows empty state when no categories', async ({ page }) => {
    await page.route('**/api/v1/categories**', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ categories: [] }),
      })
    );
    await page.goto('/categories');
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-category-btn"]')).toBeVisible();
  });

  test('tabs switch between personal and group categories', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="tab-group"]');
    await expect(page.locator('[data-testid="tab-group"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('hover shows edit/delete actions', async ({ page }) => {
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
    await expect(page.locator('[data-testid="edit-category-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-category-btn"]')).toBeVisible();
  });

  test('new category button opens modal', async ({ page }) => {
    await page.goto('/categories');
    await page.click('[data-testid="new-category-btn"]');
    await expect(page.locator('[data-testid="category-modal"]')).toBeVisible();
  });

  test('category card shows stats', async ({ page }) => {
    await page.route('**/api/v1/categories**', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          categories: [
            { id: '1', name: 'Food', color: '#FF5733', icon: 'utensils', type: 'expense', transaction_count: 15, period_total: -1250 },
          ],
        }),
      })
    );
    await page.goto('/categories');
    await expect(page.locator('[data-testid="category-stats"]')).toContainText('15 transações');
  });

  test('responsive grid layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/categories');
    // Verify single column on mobile
  });

  test('loading state shows skeleton', async ({ page }) => {
    await page.route('**/api/v1/categories**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      route.fulfill({ status: 200, body: JSON.stringify({ categories: [] }) });
    });
    await page.goto('/categories');
    await expect(page.locator('[data-testid="skeleton-card"]').first()).toBeVisible();
  });
});
```

## Files to Create
- `/src/main/features/categories/components/CategoriesScreen.tsx`
- `/src/main/features/categories/components/CategoryCard.tsx`
- `/src/main/features/categories/components/CategoriesGrid.tsx`
- `/src/main/features/categories/api/categories.ts`
- `/src/main/features/categories/types.ts`
- `/src/main/features/categories/index.ts`
- `/src/test/integration/categories.spec.ts` (Playwright)
