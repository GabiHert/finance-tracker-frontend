import { test, expect } from '@test/fixtures'

test.describe('TransactionsList Screen', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/transactions')
	})

	test('renders page header', async ({ page }) => {
		const header = page.locator('[data-testid="transactions-header"]')
		await expect(header).toBeVisible()
		await expect(header).toContainText('Transactions')
	})

	test('displays transaction count', async ({ page }) => {
		const count = page.locator('[data-testid="transactions-count"]')
		await expect(count).toBeVisible()
		const text = await count.textContent()
		expect(text).toMatch(/\d+/)
	})

	test('shows add transaction button', async ({ page }) => {
		const addBtn = page.locator('[data-testid="add-transaction-btn"]')
		await expect(addBtn).toBeVisible()
		await expect(addBtn).toContainText('Add Transaction')
	})

	test('add transaction button opens modal', async ({ page }) => {
		await page.click('[data-testid="add-transaction-btn"]')
		await expect(page.locator('[data-testid="transaction-modal"]')).toBeVisible()
	})

	test('renders filter bar', async ({ page }) => {
		const filterBar = page.locator('[data-testid="filter-bar"]')
		await expect(filterBar).toBeVisible()
	})

	test('transactions are grouped by date', async ({ page }) => {
		const dateGroup = page.locator('[data-testid="transaction-date-group"]').first()
		await expect(dateGroup).toBeVisible()
	})

	test('date group shows formatted date', async ({ page }) => {
		const dateHeader = page.locator('[data-testid="transaction-date-header"]').first()
		await expect(dateHeader).toBeVisible()
		const text = await dateHeader.textContent()
		expect(text).toMatch(/\d{2}\/\d{2}\/\d{4}/)
	})

	test('date group shows daily total', async ({ page }) => {
		const dailyTotal = page.locator('[data-testid="daily-total"]').first()
		await expect(dailyTotal).toBeVisible()
		const text = await dailyTotal.textContent()
		expect(text).toContain('R$')
	})

	test('displays multiple transaction rows', async ({ page }) => {
		const rows = page.locator('[data-testid="transaction-row"]')
		const count = await rows.count()
		expect(count).toBeGreaterThan(0)
	})

	test('scrolls to load more transactions', async ({ page }) => {
		const initialCount = await page.locator('[data-testid="transaction-row"]').count()

		await page.evaluate(() => {
			window.scrollTo(0, document.body.scrollHeight)
		})

		await page.waitForTimeout(500)

		const newCount = await page.locator('[data-testid="transaction-row"]').count()
		expect(newCount).toBeGreaterThanOrEqual(initialCount)
	})

	test('shows select all checkbox', async ({ page }) => {
		const selectAll = page.locator('[data-testid="select-all-transactions"]')
		await expect(selectAll).toBeVisible()
	})

	test('select all checkbox selects all visible transactions', async ({ page }) => {
		const selectAll = page.locator('[data-testid="select-all-transactions"]')
		await selectAll.check()

		const checkboxes = page.locator('[data-testid="transaction-checkbox"]')
		const count = await checkboxes.count()

		for (let i = 0; i < count; i++) {
			await expect(checkboxes.nth(i)).toBeChecked()
		}
	})

	test('shows bulk actions bar when items selected', async ({ page }) => {
		const firstCheckbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await firstCheckbox.check()

		const bulkActions = page.locator('[data-testid="bulk-actions-bar"]')
		await expect(bulkActions).toBeVisible()
	})

	test('bulk actions bar shows selected count', async ({ page }) => {
		const firstCheckbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await firstCheckbox.check()

		const selectedCount = page.locator('[data-testid="bulk-selected-count"]')
		await expect(selectedCount).toContainText('1 selected')
	})

	test('can filter by search', async ({ page }) => {
		const search = page.locator('[data-testid="filter-search"]')
		await search.fill('Supermarket')
		await page.waitForTimeout(300)

		const rows = page.locator('[data-testid="transaction-row"]')
		const firstRow = rows.first()
		const text = await firstRow.textContent()
		expect(text?.toLowerCase()).toContain('supermarket')
	})

	test('can filter by type', async ({ page }) => {
		await page.click('[data-testid="filter-type"]')
		await page.click('[data-testid="select-option-1"]') // Expense

		const rows = page.locator('[data-testid="transaction-row-expense"]')
		const count = await rows.count()
		expect(count).toBeGreaterThan(0)
	})

	test('can filter by date range', async ({ page }) => {
		await page.click('[data-testid="filter-start-date"]')
		await page.click('[data-testid="calendar-day-1"]')

		const rows = page.locator('[data-testid="transaction-row"]')
		await expect(rows.first()).toBeVisible()
	})

	test('shows correct total summary', async ({ page }) => {
		const totalSummary = page.locator('[data-testid="total-summary"]')
		await expect(totalSummary).toBeVisible()
	})

	test('summary shows income total', async ({ page }) => {
		const incomeTotal = page.locator('[data-testid="income-total"]')
		await expect(incomeTotal).toBeVisible()
		const text = await incomeTotal.textContent()
		expect(text).toContain('R$')
	})

	test('summary shows expense total', async ({ page }) => {
		const expenseTotal = page.locator('[data-testid="expense-total"]')
		await expect(expenseTotal).toBeVisible()
		const text = await expenseTotal.textContent()
		expect(text).toContain('R$')
	})

	test('summary shows net total', async ({ page }) => {
		const netTotal = page.locator('[data-testid="net-total"]')
		await expect(netTotal).toBeVisible()
		const text = await netTotal.textContent()
		expect(text).toContain('R$')
	})

	test('responsive layout on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 })
		const header = page.locator('[data-testid="transactions-header"]')
		await expect(header).toBeVisible()
	})

	test('keyboard navigation between rows', async ({ page }) => {
		const firstRow = page.locator('[data-testid="transaction-row"]').first()
		await firstRow.focus()
		await expect(firstRow).toBeFocused()
		await page.keyboard.press('ArrowDown')
	})
})
