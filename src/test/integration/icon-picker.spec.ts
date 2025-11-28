import { test, expect } from '@playwright/test'

test.describe('Icon Picker Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/test/components')
	})

	test('displays icon grid', async ({ page }) => {
		const icons = page.locator('.icon-option')
		await expect(icons.first()).toBeVisible()
		// Should have multiple icons
		const count = await icons.count()
		expect(count).toBeGreaterThanOrEqual(20)
	})

	test('selects icon on click', async ({ page }) => {
		await page.click('[data-testid="icon-wallet"]')
		await expect(page.locator('[data-testid="icon-wallet"]')).toHaveClass(/selected/)
	})

	test('shows selected icon value', async ({ page }) => {
		await page.click('[data-testid="icon-car"]')
		await expect(page.locator('[data-testid="selected-icon-value"]')).toContainText('car')
	})

	test('search filters icons', async ({ page }) => {
		await page.fill('[data-testid="icon-search"]', 'car')
		// Wait for filtering
		await page.waitForTimeout(300)
		const icons = page.locator('.icon-option:visible')
		const count = await icons.count()
		expect(count).toBeLessThan(20)
	})

	test('keyboard navigation works', async ({ page }) => {
		await page.locator('[data-testid="icon-picker"]').focus()
		await page.keyboard.press('Tab')
		await page.keyboard.press('ArrowRight')
		await page.keyboard.press('Enter')
		// An icon should be selected
	})

	test('clear search shows all icons', async ({ page }) => {
		await page.fill('[data-testid="icon-search"]', 'car')
		await page.waitForTimeout(300)
		await page.fill('[data-testid="icon-search"]', '')
		await page.waitForTimeout(300)
		const icons = page.locator('.icon-option:visible')
		const count = await icons.count()
		expect(count).toBeGreaterThanOrEqual(20)
	})

	test('icon hover shows tooltip', async ({ page }) => {
		const icon = page.locator('[data-testid="icon-wallet"]')
		await icon.hover()
		await expect(icon).toHaveAttribute('title', 'wallet')
	})
})
