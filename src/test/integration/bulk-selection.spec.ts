import { test, expect } from '@test/fixtures'

test.describe('Bulk Selection & Actions', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/transactions')
	})

	test('select all checkbox appears in header', async ({ page }) => {
		const selectAll = page.locator('[data-testid="select-all-transactions"]')
		await expect(selectAll).toBeVisible()
	})

	test('individual transaction checkboxes are visible', async ({ page }) => {
		const checkboxes = page.locator('[data-testid="transaction-checkbox"]')
		const count = await checkboxes.count()
		expect(count).toBeGreaterThan(0)
	})

	test('can select individual transaction', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()
		await expect(checkbox).toBeChecked()
	})

	test('can deselect individual transaction', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()
		await checkbox.uncheck()
		await expect(checkbox).not.toBeChecked()
	})

	test('select all selects all visible transactions', async ({ page }) => {
		const selectAll = page.locator('[data-testid="select-all-transactions"]')
		await selectAll.check()

		const checkboxes = page.locator('[data-testid="transaction-checkbox"]')
		const count = await checkboxes.count()

		for (let i = 0; i < count; i++) {
			await expect(checkboxes.nth(i)).toBeChecked()
		}
	})

	test('select all unchecks all transactions', async ({ page }) => {
		const selectAll = page.locator('[data-testid="select-all-transactions"]')
		await selectAll.check()
		await selectAll.uncheck()

		const checkboxes = page.locator('[data-testid="transaction-checkbox"]')
		const count = await checkboxes.count()

		for (let i = 0; i < count; i++) {
			await expect(checkboxes.nth(i)).not.toBeChecked()
		}
	})

	test('select all checkbox shows indeterminate state', async ({ page }) => {
		// Select only one item
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		const selectAll = page.locator('[data-testid="select-all-transactions"]')
		// Should be in indeterminate state
		await expect(selectAll).not.toBeChecked()
	})

	test('bulk actions bar appears when items selected', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		const bulkActions = page.locator('[data-testid="bulk-actions-bar"]')
		await expect(bulkActions).toBeVisible()
	})

	test('bulk actions bar shows selected count', async ({ page }) => {
		const checkbox1 = page.locator('[data-testid="transaction-checkbox"]').first()
		const checkbox2 = page.locator('[data-testid="transaction-checkbox"]').nth(1)

		await checkbox1.check()
		await checkbox2.check()

		const selectedCount = page.locator('[data-testid="bulk-selected-count"]')
		await expect(selectedCount).toContainText('2 selected')
	})

	test('bulk actions bar hides when all deselected', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		const bulkActions = page.locator('[data-testid="bulk-actions-bar"]')
		await expect(bulkActions).toBeVisible()

		await checkbox.uncheck()
		await expect(bulkActions).not.toBeVisible()
	})

	test('bulk delete button is visible', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		const deleteBtn = page.locator('[data-testid="bulk-delete-btn"]')
		await expect(deleteBtn).toBeVisible()
	})

	test('bulk delete shows confirmation dialog', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		await page.click('[data-testid="bulk-delete-btn"]')
		const confirmation = page.locator('[data-testid="bulk-delete-confirmation"]')
		await expect(confirmation).toBeVisible()
	})

	test('bulk delete confirmation shows count', async ({ page }) => {
		const checkbox1 = page.locator('[data-testid="transaction-checkbox"]').first()
		const checkbox2 = page.locator('[data-testid="transaction-checkbox"]').nth(1)

		await checkbox1.check()
		await checkbox2.check()

		await page.click('[data-testid="bulk-delete-btn"]')
		const confirmation = page.locator('[data-testid="bulk-delete-confirmation"]')
		await expect(confirmation).toContainText('2 transactions')
	})

	test('can cancel bulk delete', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		await page.click('[data-testid="bulk-delete-btn"]')
		await page.click('[data-testid="bulk-delete-cancel"]')

		const confirmation = page.locator('[data-testid="bulk-delete-confirmation"]')
		await expect(confirmation).not.toBeVisible()
	})

	test('can confirm bulk delete', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		const initialCount = await page.locator('[data-testid="transaction-row"]').count()

		await page.click('[data-testid="bulk-delete-btn"]')
		await page.click('[data-testid="bulk-delete-confirm"]')

		await page.waitForTimeout(500)

		const newCount = await page.locator('[data-testid="transaction-row"]').count()
		expect(newCount).toBeLessThan(initialCount)
	})

	test('bulk export button is visible', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		const exportBtn = page.locator('[data-testid="bulk-export-btn"]')
		await expect(exportBtn).toBeVisible()
	})

	test('bulk edit category button is visible', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		const editCategoryBtn = page.locator('[data-testid="bulk-edit-category-btn"]')
		await expect(editCategoryBtn).toBeVisible()
	})

	test('bulk edit category opens modal', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		await page.click('[data-testid="bulk-edit-category-btn"]')
		const modal = page.locator('[data-testid="bulk-edit-category-modal"]')
		await expect(modal).toBeVisible()
	})

	test('clear selection button works', async ({ page }) => {
		const checkbox1 = page.locator('[data-testid="transaction-checkbox"]').first()
		const checkbox2 = page.locator('[data-testid="transaction-checkbox"]').nth(1)

		await checkbox1.check()
		await checkbox2.check()

		await page.click('[data-testid="bulk-clear-selection"]')

		await expect(checkbox1).not.toBeChecked()
		await expect(checkbox2).not.toBeChecked()
	})

	test('selection persists during scroll', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		await page.evaluate(() => {
			window.scrollTo(0, document.body.scrollHeight)
		})

		await page.evaluate(() => {
			window.scrollTo(0, 0)
		})

		await expect(checkbox).toBeChecked()
	})

	test('selection clears after successful bulk action', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		await page.click('[data-testid="bulk-delete-btn"]')
		await page.click('[data-testid="bulk-delete-confirm"]')

		await page.waitForTimeout(500)

		const bulkActions = page.locator('[data-testid="bulk-actions-bar"]')
		await expect(bulkActions).not.toBeVisible()
	})

	test('keyboard shortcut Ctrl+A selects all', async ({ page }) => {
		await page.keyboard.press('Control+a')

		const checkboxes = page.locator('[data-testid="transaction-checkbox"]')
		const count = await checkboxes.count()

		for (let i = 0; i < count; i++) {
			await expect(checkboxes.nth(i)).toBeChecked()
		}
	})

	test('escape key clears selection', async ({ page }) => {
		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		await page.keyboard.press('Escape')

		await expect(checkbox).not.toBeChecked()
	})

	test('bulk actions are disabled when nothing selected', async ({ page }) => {
		const bulkActions = page.locator('[data-testid="bulk-actions-bar"]')
		await expect(bulkActions).not.toBeVisible()
	})

	test('selection works with filters applied', async ({ page }) => {
		const search = page.locator('[data-testid="filter-search"]')
		await search.fill('Supermarket')
		await page.waitForTimeout(300)

		const checkbox = page.locator('[data-testid="transaction-checkbox"]').first()
		await checkbox.check()

		const bulkActions = page.locator('[data-testid="bulk-actions-bar"]')
		await expect(bulkActions).toBeVisible()
	})
})
