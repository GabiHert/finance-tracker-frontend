import { test, expect } from '@test/fixtures'

test.describe('Category Create/Edit Modal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/categories')
	})

	test.describe('Create Mode', () => {
		test('opens modal with create title', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			await expect(page.locator('[data-testid="category-modal"]')).toBeVisible()
			await expect(page.getByRole('heading', { name: /new category/i })).toBeVisible()
		})

		test('shows empty form fields', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			const nameInput = page.locator('[data-testid="category-name-input"]')
			await expect(nameInput).toBeVisible()
			await expect(nameInput).toHaveValue('')
		})

		test('shows icon picker', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			await expect(page.locator('[data-testid="category-icon-picker"]')).toBeVisible()
		})

		test('shows color picker', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			await expect(page.locator('[data-testid="category-color-picker"]')).toBeVisible()
		})

		test('shows type selector with expense/income options', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			const typeSelect = page.locator('[data-testid="category-type-select"]')
			await expect(typeSelect).toBeVisible()
		})

		test('validates required name field', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			await page.click('[data-testid="save-category-btn"]')
			// Should show error message
			await expect(page.getByText('Name is required')).toBeVisible()
		})

		test('validates name length', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			await page.fill('[data-testid="category-name-input"]', 'A')
			await page.click('[data-testid="save-category-btn"]')
			await expect(page.getByText('Name must be at least 2 characters')).toBeVisible()
		})

		test('closes modal on cancel', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			await page.getByRole('button', { name: 'Cancel' }).click()
			await expect(page.locator('[data-testid="category-modal"]')).not.toBeVisible()
		})

		test('closes modal on X button', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			await page.click('[data-testid="modal-close-btn"]')
			await expect(page.locator('[data-testid="category-modal"]')).not.toBeVisible()
		})
	})

	test.describe('Edit Mode', () => {
		test('opens modal with edit title', async ({ page }) => {
			await page.click('[data-testid="category-card"]')
			await expect(page.locator('[data-testid="category-modal"]')).toBeVisible()
			await expect(page.getByRole('heading', { name: /edit category/i })).toBeVisible()
		})

		test('populates form with category data', async ({ page }) => {
			await page.click('[data-testid="category-card"]')
			const nameInput = page.locator('[data-testid="category-name-input"]')
			await expect(nameInput).not.toHaveValue('')
		})

		test('shows save changes button', async ({ page }) => {
			await page.click('[data-testid="category-card"]')
			await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible()
		})
	})

	test.describe('Form Interaction', () => {
		test('can select different icon', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			await page.fill('[data-testid="category-name-input"]', 'Test Category')
			// Click on an icon in the picker
			const iconOption = page.locator('.icon-option').nth(5)
			await iconOption.click()
			await expect(iconOption).toHaveClass(/selected/)
		})

		test('can select different color', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			await page.fill('[data-testid="category-name-input"]', 'Test Category')
			// Click on a color swatch
			await page.click('[data-testid="color-swatch-red"]')
			await expect(page.locator('[data-testid="color-swatch-red"]')).toHaveClass(/selected/)
		})

		test('can change category type', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			const typeSelect = page.locator('[data-testid="category-type-select"]')
			await typeSelect.click()
			await page.getByRole('option', { name: 'Income' }).click()
		})

		test('can add description', async ({ page }) => {
			await page.click('[data-testid="add-category-btn"]')
			const descInput = page.locator('[data-testid="category-description-input"]')
			await descInput.fill('Test description')
			await expect(descInput).toHaveValue('Test description')
		})
	})
})
