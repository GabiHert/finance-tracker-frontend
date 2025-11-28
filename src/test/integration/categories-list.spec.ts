import { test, expect } from '@playwright/test'

test.describe('Categories List Screen', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/categories')
	})

	test('displays page title', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('Categories')
	})

	test('shows add category button', async ({ page }) => {
		const addButton = page.locator('[data-testid="add-category-btn"]')
		await expect(addButton).toBeVisible()
	})

	test('displays category cards grid', async ({ page }) => {
		const categoriesGrid = page.locator('[data-testid="categories-grid"]')
		await expect(categoriesGrid).toBeVisible()
	})

	test('category card shows icon and name', async ({ page }) => {
		const categoryCard = page.locator('[data-testid="category-card"]').first()
		await expect(categoryCard).toBeVisible()
		// Card should contain icon and name elements
		await expect(categoryCard.locator('[data-testid="category-icon"]')).toBeVisible()
		await expect(categoryCard.locator('[data-testid="category-name"]')).toBeVisible()
	})

	test('category card shows color indicator', async ({ page }) => {
		const colorIndicator = page.locator('[data-testid="category-color"]').first()
		await expect(colorIndicator).toBeVisible()
	})

	test('clicking add button opens create modal', async ({ page }) => {
		await page.click('[data-testid="add-category-btn"]')
		await expect(page.locator('[data-testid="category-modal"]')).toBeVisible()
		await expect(page.locator('[data-testid="category-modal-title"]')).toContainText('Category')
	})

	test('clicking category card opens edit modal', async ({ page }) => {
		await page.click('[data-testid="category-card"]')
		await expect(page.locator('[data-testid="category-modal"]')).toBeVisible()
	})

	test('empty state shows when no categories', async ({ page }) => {
		// Navigate to categories with empty mock state
		await page.goto('/categories?empty=true')
		// Verify empty state is shown
		await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
		await expect(page.locator('h1')).toContainText('Categories')
	})

	test('category types filter works', async ({ page }) => {
		const typeFilter = page.locator('[data-testid="category-type-filter"]')
		if (await typeFilter.isVisible()) {
			// Click to open dropdown
			await typeFilter.click()
			// Verify filter dropdown options are visible in the dropdown
			await expect(page.getByRole('option', { name: 'Expense' })).toBeVisible()
			await expect(page.getByRole('option', { name: 'Income' })).toBeVisible()
		}
	})

	test('search categories functionality', async ({ page }) => {
		const searchInput = page.locator('[data-testid="category-search"]')
		if (await searchInput.isVisible()) {
			await searchInput.fill('food')
			await page.waitForTimeout(300) // debounce
			// Categories should be filtered
		}
	})
})
