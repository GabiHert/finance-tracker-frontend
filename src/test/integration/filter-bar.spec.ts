import { test, expect } from '@test/fixtures'

test.describe('FilterBar Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/transactions')
	})

	test('renders search input', async ({ page }) => {
		const search = page.locator('[data-testid="filter-search"]')
		await expect(search).toBeVisible()
	})

	test('search input has placeholder', async ({ page }) => {
		const search = page.locator('[data-testid="filter-search"]')
		await expect(search).toHaveAttribute('placeholder', /Search/)
	})

	test('can type in search input', async ({ page }) => {
		const search = page.locator('[data-testid="filter-search"]')
		await search.fill('groceries')
		await expect(search).toHaveValue('groceries')
	})

	test('renders date range picker', async ({ page }) => {
		const dateRange = page.locator('[data-testid="filter-date-range"]')
		await expect(dateRange).toBeVisible()
	})

	test('date range picker shows start date', async ({ page }) => {
		const startDate = page.locator('[data-testid="filter-start-date"]')
		await expect(startDate).toBeVisible()
	})

	test('date range picker shows end date', async ({ page }) => {
		const endDate = page.locator('[data-testid="filter-end-date"]')
		await expect(endDate).toBeVisible()
	})

	test('can select start date', async ({ page }) => {
		await page.click('[data-testid="filter-start-date"]')
		await page.click('[data-testid="calendar-day-1"]')
		const input = page.locator('[data-testid="filter-start-date-input"]')
		const value = await input.inputValue()
		expect(value).toMatch(/\d{2}\/\d{2}\/\d{4}/)
	})

	test('can select end date', async ({ page }) => {
		await page.click('[data-testid="filter-end-date"]')
		await page.click('[data-testid="calendar-day-15"]')
		const input = page.locator('[data-testid="filter-end-date-input"]')
		const value = await input.inputValue()
		expect(value).toMatch(/\d{2}\/\d{2}\/\d{4}/)
	})

	test('renders category filter', async ({ page }) => {
		const categoryFilter = page.locator('[data-testid="filter-category"]')
		await expect(categoryFilter).toBeVisible()
	})

	test('category filter opens dropdown', async ({ page }) => {
		await page.click('[data-testid="filter-category"]')
		await expect(page.locator('[data-testid="select-dropdown"]')).toBeVisible()
	})

	test('can select category from filter', async ({ page }) => {
		await page.click('[data-testid="filter-category"]')
		await page.click('[data-testid="select-option-0"]')
		await expect(page.locator('[data-testid="filter-category"]')).not.toContainText('All Categories')
	})

	test('renders type filter', async ({ page }) => {
		const typeFilter = page.locator('[data-testid="filter-type"]')
		await expect(typeFilter).toBeVisible()
	})

	test('type filter opens dropdown', async ({ page }) => {
		await page.click('[data-testid="filter-type"]')
		await expect(page.locator('[data-testid="select-dropdown"]')).toBeVisible()
	})

	test('can select expense type', async ({ page }) => {
		await page.click('[data-testid="filter-type"]')
		await page.click('[data-testid="select-option-1"]')
		await expect(page.locator('[data-testid="filter-type"]')).toContainText('Expense')
	})

	test('can select income type', async ({ page }) => {
		await page.click('[data-testid="filter-type"]')
		await page.click('[data-testid="select-option-2"]')
		await expect(page.locator('[data-testid="filter-type"]')).toContainText('Income')
	})

	test('renders clear filters button', async ({ page }) => {
		const clearBtn = page.locator('[data-testid="filter-clear-btn"]')
		await expect(clearBtn).toBeVisible()
	})

	test('clear button resets all filters', async ({ page }) => {
		const search = page.locator('[data-testid="filter-search"]')
		await search.fill('groceries')

		await page.click('[data-testid="filter-type"]')
		await page.click('[data-testid="select-option-1"]')

		await page.click('[data-testid="filter-clear-btn"]')

		await expect(search).toHaveValue('')
		await expect(page.locator('[data-testid="filter-type"]')).toContainText('All')
	})

	test('shows active filter count', async ({ page }) => {
		await page.click('[data-testid="filter-type"]')
		await page.click('[data-testid="select-option-1"]')

		const filterCount = page.locator('[data-testid="filter-count"]')
		await expect(filterCount).toBeVisible()
		await expect(filterCount).toContainText('1')
	})

	test('filter count updates when adding filters', async ({ page }) => {
		await page.click('[data-testid="filter-type"]')
		await page.click('[data-testid="select-option-1"]')

		await page.click('[data-testid="filter-category"]')
		await page.click('[data-testid="select-option-0"]')

		const filterCount = page.locator('[data-testid="filter-count"]')
		await expect(filterCount).toContainText('2')
	})

	test('search filters transactions in real-time', async ({ page }) => {
		const search = page.locator('[data-testid="filter-search"]')
		await search.fill('Supermarket')

		// Should see filtered results
		await page.waitForTimeout(300) // Debounce
		const rows = page.locator('[data-testid="transaction-row"]')
		const count = await rows.count()
		expect(count).toBeGreaterThan(0)
	})

	test('date range filter updates transactions', async ({ page }) => {
		await page.click('[data-testid="filter-start-date"]')
		await page.click('[data-testid="calendar-day-1"]')

		// Should see filtered results
		const rows = page.locator('[data-testid="transaction-row"]')
		await expect(rows.first()).toBeVisible()
	})

	test('responsive layout on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 })
		const filterBar = page.locator('[data-testid="filter-bar"]')
		await expect(filterBar).toBeVisible()
	})

	test('filters persist across page navigation', async ({ page }) => {
		const search = page.locator('[data-testid="filter-search"]')
		await search.fill('groceries')

		await page.goto('/categories')
		await page.goto('/transactions')

		// Filter should still be applied
		await expect(search).toHaveValue('groceries')
	})
})
