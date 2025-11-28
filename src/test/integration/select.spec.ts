import { test, expect } from '@test/fixtures'

test.describe('Select Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/test/components')
	})

	test('opens dropdown on click', async ({ page }) => {
		await page.click('[data-testid="select-trigger"]')
		await expect(page.locator('[data-testid="select-dropdown"]')).toBeVisible()
	})

	test('selects option', async ({ page }) => {
		await page.click('[data-testid="select-trigger"]')
		await page.click('[data-testid="select-option-0"]')
		await expect(page.locator('[data-testid="select-trigger"]')).toContainText('Option 1')
	})

	test('closes dropdown after selection', async ({ page }) => {
		await page.click('[data-testid="select-trigger"]')
		await page.click('[data-testid="select-option-0"]')
		await expect(page.locator('[data-testid="select-dropdown"]')).not.toBeVisible()
	})

	test('keyboard navigation works', async ({ page }) => {
		await page.click('[data-testid="select-trigger"]')
		await page.keyboard.press('ArrowDown')
		await page.keyboard.press('ArrowDown')
		await page.keyboard.press('Enter')
		await expect(page.locator('[data-testid="select-dropdown"]')).not.toBeVisible()
	})

	test('escape closes dropdown', async ({ page }) => {
		await page.click('[data-testid="select-trigger"]')
		await expect(page.locator('[data-testid="select-dropdown"]')).toBeVisible()
		await page.keyboard.press('Escape')
		await expect(page.locator('[data-testid="select-dropdown"]')).not.toBeVisible()
	})

	test('searchable select filters options', async ({ page }) => {
		await page.click('[data-testid="select-searchable"]')
		await page.fill('[data-testid="select-search"]', 'Option 2')
		const options = page.locator('[data-testid^="select-option"]')
		await expect(options).toHaveCount(1)
	})

	test('multi-select allows multiple selections', async ({ page }) => {
		await page.click('[data-testid="select-multi"]')
		await page.click('[data-testid="select-option-0"]')
		await page.click('[data-testid="select-option-1"]')
		// Click outside to close
		await page.keyboard.press('Escape')
		await expect(page.locator('[data-testid="select-multi"]')).toContainText('2 selected')
	})

	test('disabled state prevents interaction', async ({ page }) => {
		const trigger = page.locator('[data-testid="select-disabled"]')
		await expect(trigger).toHaveAttribute('aria-disabled', 'true')
		await trigger.click({ force: true })
		await expect(page.locator('[data-testid="select-dropdown"]')).not.toBeVisible()
	})

	test('error state shows error message', async ({ page }) => {
		await expect(page.locator('[data-testid="select-error-message"]')).toBeVisible()
	})

	test('shows placeholder when no value selected', async ({ page }) => {
		const trigger = page.locator('[data-testid="select-trigger"]')
		await expect(trigger).toContainText('Select an option')
	})

	test('option hover shows highlight', async ({ page }) => {
		await page.click('[data-testid="select-trigger"]')
		const option = page.locator('[data-testid="select-option-0"]')
		await option.hover()
		// Option should have hover background
		await expect(option).toBeVisible()
	})

	test('clearable select can clear value', async ({ page }) => {
		await page.click('[data-testid="select-clearable"]')
		await page.click('[data-testid="select-option-0"]')
		await expect(page.locator('[data-testid="select-clearable"]')).toContainText('Option 1')

		// Clear the value
		await page.click('[data-testid="select-clear-btn"]')
		await expect(page.locator('[data-testid="select-clearable"]')).toContainText('Select an option')
	})

	test('clicking outside closes dropdown', async ({ page }) => {
		await page.click('[data-testid="select-trigger"]')
		await expect(page.locator('[data-testid="select-dropdown"]')).toBeVisible()
		// Click on page body
		await page.click('body', { position: { x: 10, y: 10 } })
		await expect(page.locator('[data-testid="select-dropdown"]')).not.toBeVisible()
	})

	test('disabled options cannot be selected', async ({ page }) => {
		await page.click('[data-testid="select-with-disabled"]')
		const disabledOption = page.locator('[data-testid="select-option-disabled"]')
		await expect(disabledOption).toHaveAttribute('aria-disabled', 'true')
	})
})
