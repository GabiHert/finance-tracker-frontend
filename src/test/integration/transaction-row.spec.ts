import { test, expect } from '@test/fixtures'

test.describe('TransactionRow Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/transactions')
	})

	test('renders transaction with category icon', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		const icon = row.locator('[data-testid="category-icon"]')
		await expect(icon).toBeVisible()
	})

	test('displays transaction description', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		const description = row.locator('[data-testid="transaction-description"]')
		await expect(description).toBeVisible()
	})

	test('displays formatted amount', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		const amount = row.locator('[data-testid="transaction-amount"]')
		await expect(amount).toBeVisible()
		const text = await amount.textContent()
		expect(text).toMatch(/R\$/)
	})

	test('shows expense in negative format', async ({ page }) => {
		const expenseRow = page.locator('[data-testid="transaction-row-expense"]').first()
		const amount = expenseRow.locator('[data-testid="transaction-amount"]')
		const text = await amount.textContent()
		expect(text).toContain('-')
	})

	test('shows income in positive format', async ({ page }) => {
		const incomeRow = page.locator('[data-testid="transaction-row-income"]').first()
		const amount = incomeRow.locator('[data-testid="transaction-amount"]')
		const text = await amount.textContent()
		expect(text).not.toContain('-')
	})

	test('displays category name', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		const category = row.locator('[data-testid="transaction-category"]')
		await expect(category).toBeVisible()
	})

	test('checkbox is visible', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		const checkbox = row.locator('[data-testid="transaction-checkbox"]')
		await expect(checkbox).toBeVisible()
	})

	test('checkbox can be checked', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		const checkbox = row.locator('[data-testid="transaction-checkbox"]')
		await checkbox.check()
		await expect(checkbox).toBeChecked()
	})

	test('checkbox can be unchecked', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		const checkbox = row.locator('[data-testid="transaction-checkbox"]')
		await checkbox.check()
		await checkbox.uncheck()
		await expect(checkbox).not.toBeChecked()
	})

	test('shows edit button on hover', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		await row.hover()
		const editBtn = row.locator('[data-testid="transaction-edit-btn"]')
		await expect(editBtn).toBeVisible()
	})

	test('shows delete button on hover', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		await row.hover()
		const deleteBtn = row.locator('[data-testid="transaction-delete-btn"]')
		await expect(deleteBtn).toBeVisible()
	})

	test('edit button opens modal', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		await row.hover()
		await page.click('[data-testid="transaction-edit-btn"]')
		await expect(page.locator('[data-testid="transaction-modal"]')).toBeVisible()
	})

	test('delete button shows confirmation', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		await row.hover()
		await page.click('[data-testid="transaction-delete-btn"]')
		await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible()
	})

	test('displays transaction date', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		const date = row.locator('[data-testid="transaction-date"]')
		await expect(date).toBeVisible()
		const text = await date.textContent()
		expect(text).toMatch(/\d{2}\/\d{2}\/\d{4}/)
	})

	test('displays notes if present', async ({ page }) => {
		const rowWithNotes = page.locator('[data-testid="transaction-row-with-notes"]').first()
		const notes = rowWithNotes.locator('[data-testid="transaction-notes"]')
		await expect(notes).toBeVisible()
	})

	test('row has proper hover effect', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		await row.hover()
		// Row should have hover background
		await expect(row).toBeVisible()
	})

	test('clicking row selects it', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		await row.click()
		const checkbox = row.locator('[data-testid="transaction-checkbox"]')
		await expect(checkbox).toBeChecked()
	})

	test('keyboard navigation works', async ({ page }) => {
		const row = page.locator('[data-testid="transaction-row"]').first()
		await row.focus()
		await expect(row).toBeFocused()
		await page.keyboard.press('Space')
		const checkbox = row.locator('[data-testid="transaction-checkbox"]')
		await expect(checkbox).toBeChecked()
	})

	test('shows correct color for expense', async ({ page }) => {
		const expenseRow = page.locator('[data-testid="transaction-row-expense"]').first()
		const amount = expenseRow.locator('[data-testid="transaction-amount"]')
		// Should have error/red color class
		await expect(amount).toHaveClass(/text-\[var\(--color-error\)\]/)
	})

	test('shows correct color for income', async ({ page }) => {
		const incomeRow = page.locator('[data-testid="transaction-row-income"]').first()
		const amount = incomeRow.locator('[data-testid="transaction-amount"]')
		// Should have success/green color class
		await expect(amount).toHaveClass(/text-\[var\(--color-success\)\]/)
	})
})
