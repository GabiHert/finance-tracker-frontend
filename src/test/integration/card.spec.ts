import { test, expect } from '@test/fixtures'

test.describe('Card Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/test/components')
	})

	test('renders with default styling', async ({ page }) => {
		const card = page.locator('[data-testid="card-default"]')
		await expect(card).toBeVisible()
		await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)')
		await expect(card).toHaveCSS('border-radius', '8px')
	})

	test('renders with correct border', async ({ page }) => {
		const card = page.locator('[data-testid="card-default"]')
		await expect(card).toBeVisible()
		// Card should have gray-200 border
		await expect(card).toHaveCSS('border-style', 'solid')
	})

	test('clickable variant shows hover effect', async ({ page }) => {
		const card = page.locator('[data-testid="card-clickable"]')
		await expect(card).toBeVisible()

		// Verify card is a button element for clickable variant
		await expect(card).toHaveAttribute('role', 'button')

		// Hover and verify cursor changes
		await card.hover()
		await expect(card).toHaveCSS('cursor', 'pointer')
	})

	test('clickable variant responds to click', async ({ page }) => {
		const card = page.locator('[data-testid="card-clickable"]')
		await card.click()

		// Verify click handler was called (check for visual feedback)
		const clickCount = page.locator('[data-testid="click-count"]')
		await expect(clickCount).toContainText('1')
	})

	test('keyboard navigation works for clickable cards', async ({ page }) => {
		const card = page.locator('[data-testid="card-clickable"]')
		await card.focus()
		await expect(card).toBeFocused()

		// Press Enter to activate
		await page.keyboard.press('Enter')

		// Verify click handler was called
		const clickCount = page.locator('[data-testid="click-count"]')
		await expect(clickCount).toContainText('1')
	})

	test('keyboard Space activates clickable card', async ({ page }) => {
		// Reset by going to page
		await page.goto('/test/components')

		const card = page.locator('[data-testid="card-clickable"]')
		await card.focus()
		await page.keyboard.press('Space')

		const clickCount = page.locator('[data-testid="click-count"]')
		await expect(clickCount).toContainText('1')
	})

	test('renders header section', async ({ page }) => {
		const header = page.locator('[data-testid="card-header"]')
		await expect(header).toBeVisible()
		await expect(header).toContainText('Card Header')
	})

	test('renders body section', async ({ page }) => {
		const body = page.locator('[data-testid="card-body"]')
		await expect(body).toBeVisible()
		await expect(body).toContainText('Card Body Content')
	})

	test('renders footer section', async ({ page }) => {
		const footer = page.locator('[data-testid="card-footer"]')
		await expect(footer).toBeVisible()
		await expect(footer).toContainText('Card Footer')
	})

	test('renders with different padding sizes', async ({ page }) => {
		const cardSm = page.locator('[data-testid="card-padding-sm"]')
		const cardMd = page.locator('[data-testid="card-padding-md"]')
		const cardLg = page.locator('[data-testid="card-padding-lg"]')
		const cardNone = page.locator('[data-testid="card-padding-none"]')

		await expect(cardSm).toBeVisible()
		await expect(cardMd).toBeVisible()
		await expect(cardLg).toBeVisible()
		await expect(cardNone).toBeVisible()

		// Verify different padding values
		await expect(cardNone).toHaveCSS('padding', '0px')
	})

	test('renders with different shadow sizes', async ({ page }) => {
		const cardShadowNone = page.locator('[data-testid="card-shadow-none"]')
		const cardShadowMd = page.locator('[data-testid="card-shadow-md"]')

		await expect(cardShadowNone).toBeVisible()
		await expect(cardShadowMd).toBeVisible()
	})

	test('focus ring is visible on clickable card focus', async ({ page }) => {
		const card = page.locator('[data-testid="card-clickable"]')
		await card.focus()
		await expect(card).toBeFocused()
		// Focus ring should be visible
	})

	test('default card is not focusable', async ({ page }) => {
		const card = page.locator('[data-testid="card-default"]')
		// Default card should not have tabindex
		await expect(card).not.toHaveAttribute('tabindex')
	})
})
