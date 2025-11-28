# Feature: Transaction UI Components (M4-F3 to M4-F8)

## Description
Complete transaction management UI including row component, filter bar, list screen, modal, bulk actions, and loading states.

## M4-F3: Transaction Row Component (3 pts)

### Acceptance Criteria
- Category icon with color
- Description text (truncated if long)
- Notes indicator (tooltip on hover)
- Amount formatted as BRL (red for expense, green for income)
- Checkbox for bulk selection
- Hover shows edit/delete buttons
- Click opens edit modal

### Playwright Tests
```typescript
test.describe('Transaction Row', () => {
  test('displays category icon and name', async ({ page }) => {
    await expect(page.locator('[data-testid="transaction-row"]').first().locator('[data-testid="category-icon"]')).toBeVisible()
  })
  test('shows amount with correct color', async ({ page }) => {
    await expect(page.locator('[data-testid="transaction-amount"]').first()).toHaveClass(/expense/)
  })
  test('hover reveals action buttons', async ({ page }) => {
    await page.hover('[data-testid="transaction-row"]')
    await expect(page.locator('[data-testid="edit-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="delete-btn"]')).toBeVisible()
  })
  test('checkbox enables selection', async ({ page }) => {
    await page.click('[data-testid="transaction-checkbox"]')
    await expect(page.locator('[data-testid="transaction-row"]').first()).toHaveClass(/selected/)
  })
})
```

## M4-F4: Filter Bar Component (3 pts)

### Acceptance Criteria
- Search input with magnifying glass icon
- Date range picker (start/end)
- Category multi-select dropdown
- Type filter (All | Expense | Income)
- Clear filters button (when filters active)
- Filters persist in URL query params

### Playwright Tests
```typescript
test.describe('Filter Bar', () => {
  test('search input filters transactions', async ({ page }) => {
    await page.fill('[data-testid="filter-search"]', 'uber')
    await page.waitForTimeout(300)
    // Transactions should be filtered
  })
  test('date range filter works', async ({ page }) => {
    await page.click('[data-testid="filter-date-start"]')
    await page.click('[data-testid="date-day-1"]')
    // Should filter by date
  })
  test('category filter shows multi-select', async ({ page }) => {
    await page.click('[data-testid="filter-categories"]')
    await expect(page.locator('[role="option"]')).toHaveCount.greaterThan(0)
  })
  test('type filter toggles', async ({ page }) => {
    await page.click('[data-testid="filter-type-expense"]')
    await expect(page.locator('[data-testid="filter-type-expense"]')).toHaveClass(/active/)
  })
  test('clear filters button resets all', async ({ page }) => {
    await page.fill('[data-testid="filter-search"]', 'test')
    await page.click('[data-testid="clear-filters"]')
    await expect(page.locator('[data-testid="filter-search"]')).toHaveValue('')
  })
})
```

## M4-F5: Transactions List Screen (5 pts)

### Acceptance Criteria
- Header with title, transaction count, action buttons
- Filter bar
- Grouped by date with sticky headers
- Daily total in date header
- Transaction rows
- Pagination or infinite scroll
- Empty state when no results

### Playwright Tests
```typescript
test.describe('Transactions List Screen', () => {
  test('displays page header with count', async ({ page }) => {
    await page.goto('/transactions')
    await expect(page.locator('h1')).toContainText('Transactions')
    await expect(page.locator('[data-testid="transaction-count"]')).toBeVisible()
  })
  test('shows grouped transactions by date', async ({ page }) => {
    await expect(page.locator('[data-testid="date-header"]').first()).toBeVisible()
  })
  test('date header shows daily total', async ({ page }) => {
    await expect(page.locator('[data-testid="daily-total"]').first()).toBeVisible()
  })
  test('add transaction button opens modal', async ({ page }) => {
    await page.click('[data-testid="add-transaction-btn"]')
    await expect(page.locator('[data-testid="transaction-modal"]')).toBeVisible()
  })
  test('clicking row opens edit modal', async ({ page }) => {
    await page.click('[data-testid="transaction-row"]')
    await expect(page.locator('[data-testid="transaction-modal"]')).toBeVisible()
  })
})
```

## M4-F6: Transaction Create/Edit Modal (5 pts)

### Acceptance Criteria
- Date picker (required)
- Description input (required)
- Amount currency input (required)
- Type toggle (expense/income)
- Category selector (optional)
- Notes textarea (optional)
- Is recurring checkbox
- Save/Cancel buttons
- Validation errors shown

### Playwright Tests
```typescript
test.describe('Transaction Modal', () => {
  test('displays all form fields', async ({ page }) => {
    await page.click('[data-testid="add-transaction-btn"]')
    await expect(page.locator('[data-testid="transaction-date"]')).toBeVisible()
    await expect(page.locator('[data-testid="transaction-description"]')).toBeVisible()
    await expect(page.locator('[data-testid="transaction-amount"]')).toBeVisible()
    await expect(page.locator('[data-testid="transaction-type"]')).toBeVisible()
    await expect(page.locator('[data-testid="transaction-category"]')).toBeVisible()
  })
  test('validates required fields', async ({ page }) => {
    await page.click('[data-testid="add-transaction-btn"]')
    await page.click('[data-testid="save-transaction-btn"]')
    await expect(page.locator('[data-testid="error-date"]')).toBeVisible()
  })
  test('creates transaction on submit', async ({ page }) => {
    await page.click('[data-testid="add-transaction-btn"]')
    await page.fill('[data-testid="transaction-description"]', 'Test Transaction')
    await page.fill('[data-testid="transaction-amount"]', '100')
    // Fill other fields and submit
  })
  test('populates form in edit mode', async ({ page }) => {
    await page.click('[data-testid="transaction-row"]')
    await expect(page.locator('[data-testid="transaction-description"]')).not.toHaveValue('')
  })
})
```

## M4-F7: Bulk Selection & Actions (5 pts)

### Acceptance Criteria
- Select all checkbox in header
- Individual row checkboxes
- Selection counter in header
- Bulk action bar appears when items selected
- Bulk delete with confirmation
- Bulk categorize with category picker
- Keyboard shortcuts (Ctrl+A select all)

### Playwright Tests
```typescript
test.describe('Bulk Selection', () => {
  test('select all checkbox works', async ({ page }) => {
    await page.click('[data-testid="select-all-checkbox"]')
    await expect(page.locator('[data-testid="transaction-checkbox"]:checked')).toHaveCount.greaterThan(0)
  })
  test('shows selection count', async ({ page }) => {
    await page.click('[data-testid="transaction-checkbox"]').first()
    await expect(page.locator('[data-testid="selection-count"]')).toContainText('1')
  })
  test('bulk action bar appears', async ({ page }) => {
    await page.click('[data-testid="transaction-checkbox"]').first()
    await expect(page.locator('[data-testid="bulk-action-bar"]')).toBeVisible()
  })
  test('bulk delete shows confirmation', async ({ page }) => {
    await page.click('[data-testid="select-all-checkbox"]')
    await page.click('[data-testid="bulk-delete-btn"]')
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
  })
  test('bulk categorize opens category picker', async ({ page }) => {
    await page.click('[data-testid="select-all-checkbox"]')
    await page.click('[data-testid="bulk-categorize-btn"]')
    await expect(page.locator('[data-testid="category-picker"]')).toBeVisible()
  })
})
```

## M4-F8: Empty & Loading States (3 pts)

### Acceptance Criteria
- Skeleton loading state while fetching
- Empty state with illustration when no transactions
- Empty state with CTA to add first transaction
- Filter empty state ("No results match your filters")
- Error state with retry button

### Playwright Tests
```typescript
test.describe('Empty & Loading States', () => {
  test('shows loading skeleton', async ({ page }) => {
    await page.route('**/transactions*', r => r.fulfill({ status: 200, body: '[]', headers: { 'X-Delay': '1000' }}))
    await page.goto('/transactions')
    await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible()
  })
  test('shows empty state when no transactions', async ({ page }) => {
    await page.route('**/transactions*', r => r.fulfill({ status: 200, body: JSON.stringify({ transactions: [], totals: {} }) }))
    await page.goto('/transactions')
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
  })
  test('empty state has add transaction CTA', async ({ page }) => {
    await expect(page.locator('[data-testid="empty-state"] button')).toContainText('Add')
  })
  test('filter empty shows different message', async ({ page }) => {
    await page.goto('/transactions?search=nonexistent')
    await expect(page.locator('[data-testid="filter-empty-state"]')).toBeVisible()
  })
})
```
