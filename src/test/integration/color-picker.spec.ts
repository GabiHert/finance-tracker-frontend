import { test, expect } from '@playwright/test'

test.describe('Color Picker Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/test/components')
	})

	test('displays preset color swatches', async ({ page }) => {
		const swatches = page.locator('.color-swatch')
		await expect(swatches.first()).toBeVisible()
		// Should have 12 preset colors
		const count = await swatches.count()
		expect(count).toBeGreaterThanOrEqual(12)
	})

	test('selects color on click', async ({ page }) => {
		await page.click('[data-testid="color-swatch-blue"]')
		await expect(page.locator('[data-testid="color-swatch-blue"]')).toHaveClass(/selected/)
	})

	test('shows selected color value', async ({ page }) => {
		await page.click('[data-testid="color-swatch-red"]')
		await expect(page.locator('[data-testid="selected-color-value"]')).toContainText(/#/)
	})

	test('custom hex input changes color', async ({ page }) => {
		await page.fill('[data-testid="color-hex-input"]', '#FF5733')
		await page.keyboard.press('Enter')
		await expect(page.locator('[data-testid="selected-color-value"]')).toContainText('#FF5733')
	})

	test('invalid hex shows error', async ({ page }) => {
		await page.fill('[data-testid="color-hex-input"]', 'invalid')
		await page.keyboard.press('Enter')
		await expect(page.locator('[data-testid="color-error"]')).toBeVisible()
	})

	test('color preview updates', async ({ page }) => {
		await page.click('[data-testid="color-swatch-green"]')
		const preview = page.locator('[data-testid="color-preview"]')
		const bgColor = await preview.evaluate(el => getComputedStyle(el).backgroundColor)
		// Should have a green color
		expect(bgColor).toMatch(/rgb/)
	})

	test('swatches have correct size', async ({ page }) => {
		const swatch = page.locator('.color-swatch').first()
		const box = await swatch.boundingBox()
		expect(box?.width).toBeGreaterThanOrEqual(28)
		expect(box?.height).toBeGreaterThanOrEqual(28)
	})

	test('selected swatch has visual distinction', async ({ page }) => {
		await page.click('[data-testid="color-swatch-purple"]')
		const swatch = page.locator('[data-testid="color-swatch-purple"]')
		const hasSelectedClass = await swatch.evaluate(el => el.classList.contains('selected'))
		expect(hasSelectedClass).toBe(true)
	})
})
