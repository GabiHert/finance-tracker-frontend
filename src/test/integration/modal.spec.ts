import { test, expect } from '@test/fixtures'

test.describe('Modal Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/test/components')
	})

	test('opens and displays content', async ({ page }) => {
		await page.click('[data-testid="open-modal-btn"]')
		await expect(page.locator('[data-testid="modal"]')).toBeVisible()
		await expect(page.locator('[data-testid="modal-title"]')).toBeVisible()
		await expect(page.locator('[data-testid="modal-title"]')).toContainText('Modal Title')
	})

	test('closes on escape key', async ({ page }) => {
		await page.click('[data-testid="open-modal-btn"]')
		await expect(page.locator('[data-testid="modal"]')).toBeVisible()
		await page.keyboard.press('Escape')
		await expect(page.locator('[data-testid="modal"]')).not.toBeVisible()
	})

	test('closes on backdrop click', async ({ page }) => {
		await page.click('[data-testid="open-modal-btn"]')
		await expect(page.locator('[data-testid="modal"]')).toBeVisible()
		// Click on backdrop (outside modal content)
		await page.locator('[data-testid="modal-backdrop"]').click({ position: { x: 10, y: 10 } })
		await expect(page.locator('[data-testid="modal"]')).not.toBeVisible()
	})

	test('close button works', async ({ page }) => {
		await page.click('[data-testid="open-modal-btn"]')
		await expect(page.locator('[data-testid="modal"]')).toBeVisible()
		await page.click('[data-testid="modal-close-btn"]')
		await expect(page.locator('[data-testid="modal"]')).not.toBeVisible()
	})

	test('traps focus within modal', async ({ page }) => {
		await page.click('[data-testid="open-modal-btn"]')
		const modal = page.locator('[data-testid="modal"]')
		await expect(modal).toBeVisible()

		// Modal should have focus management
		// After opening, focus should be on close button or first focusable element
		await page.keyboard.press('Tab')
		await page.keyboard.press('Tab')

		// Focus should still be within the modal
		const activeElement = await page.evaluate(() => document.activeElement?.closest('[data-testid="modal"]'))
		expect(activeElement).not.toBeNull()
	})

	test('renders small size correctly', async ({ page }) => {
		await page.click('[data-testid="open-modal-sm"]')
		const modalContent = page.locator('[data-testid="modal-content"]')
		await expect(modalContent).toBeVisible()
		await expect(modalContent).toHaveCSS('max-width', '400px')
	})

	test('renders medium size correctly', async ({ page }) => {
		await page.click('[data-testid="open-modal-md"]')
		const modalContent = page.locator('[data-testid="modal-content"]')
		await expect(modalContent).toBeVisible()
		await expect(modalContent).toHaveCSS('max-width', '560px')
	})

	test('renders large size correctly', async ({ page }) => {
		await page.click('[data-testid="open-modal-lg"]')
		const modalContent = page.locator('[data-testid="modal-content"]')
		await expect(modalContent).toBeVisible()
		await expect(modalContent).toHaveCSS('max-width', '720px')
	})

	test('renders footer correctly', async ({ page }) => {
		await page.click('[data-testid="open-modal-btn"]')
		const footer = page.locator('[data-testid="modal-footer"]')
		await expect(footer).toBeVisible()
	})

	test('has correct aria attributes', async ({ page }) => {
		await page.click('[data-testid="open-modal-btn"]')
		const modal = page.locator('[data-testid="modal"]')
		await expect(modal).toHaveAttribute('role', 'dialog')
		await expect(modal).toHaveAttribute('aria-modal', 'true')
	})

	test('backdrop has correct opacity', async ({ page }) => {
		await page.click('[data-testid="open-modal-btn"]')
		const backdrop = page.locator('[data-testid="modal-backdrop"]')
		await expect(backdrop).toBeVisible()
		// Backdrop should be semi-transparent (50% opacity)
		// Color format can be rgba or oklab depending on browser/css implementation
		const bgColor = await backdrop.evaluate(el => getComputedStyle(el).backgroundColor)
		expect(bgColor).toMatch(/0\.5|50%/)
	})

	test('modal can stay open when closeOnEscape is false', async ({ page }) => {
		await page.click('[data-testid="open-modal-no-escape"]')
		await expect(page.locator('[data-testid="modal"]')).toBeVisible()
		await page.keyboard.press('Escape')
		// Modal should still be visible
		await expect(page.locator('[data-testid="modal"]')).toBeVisible()
		// Close manually
		await page.click('[data-testid="modal-close-btn"]')
	})

	test('modal scrolls body content when overflowing', async ({ page }) => {
		await page.click('[data-testid="open-modal-scrollable"]')
		const body = page.locator('[data-testid="modal-body"]')
		await expect(body).toBeVisible()
		await expect(body).toHaveCSS('overflow-y', 'auto')
	})
})
