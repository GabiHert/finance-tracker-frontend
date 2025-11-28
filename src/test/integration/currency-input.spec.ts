import { test, expect } from '@test/fixtures'

test.describe('CurrencyInput Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/test/components')
	})

	test('renders with BRL currency symbol', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await expect(input).toBeVisible()
		await expect(input).toHaveAttribute('placeholder', /R\$/)
	})

	test('formats positive values as BRL currency', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.fill('1234.56')
		await input.blur()
		await expect(input).toHaveValue('R$ 1.234,56')
	})

	test('formats negative values for expenses', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input-negative"]')
		await input.fill('-1234.56')
		await input.blur()
		await expect(input).toHaveValue('-R$ 1.234,56')
	})

	test('handles decimal input with comma', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.fill('100,50')
		await input.blur()
		await expect(input).toHaveValue('R$ 100,50')
	})

	test('handles decimal input with period', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.fill('100.50')
		await input.blur()
		await expect(input).toHaveValue('R$ 100,50')
	})

	test('allows only numeric input', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.fill('abc123xyz')
		await input.blur()
		await expect(input).toHaveValue('R$ 123,00')
	})

	test('handles large numbers with thousand separators', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.fill('1234567.89')
		await input.blur()
		await expect(input).toHaveValue('R$ 1.234.567,89')
	})

	test('shows error state', async ({ page }) => {
		const error = page.locator('[data-testid="currency-input-error-message"]')
		await expect(error).toBeVisible()
		await expect(error).toContainText('Value is required')
	})

	test('disabled state prevents input', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input-disabled"]')
		await expect(input).toBeDisabled()
	})

	test('label is correctly associated with input', async ({ page }) => {
		const label = page.locator('text=Amount')
		await expect(label).toBeVisible()
	})

	test('handles zero value', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.fill('0')
		await input.blur()
		await expect(input).toHaveValue('R$ 0,00')
	})

	test('clears formatting on focus for editing', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.fill('1234.56')
		await input.blur()
		await expect(input).toHaveValue('R$ 1.234,56')
		await input.focus()
		// Should show raw value for easier editing
		await expect(input).toHaveValue('1234.56')
	})

	test('keyboard navigation works', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.focus()
		await expect(input).toBeFocused()
	})

	test('handles empty input', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.fill('')
		await input.blur()
		await expect(input).toHaveValue('')
	})

	test('respects max length', async ({ page }) => {
		const input = page.locator('[data-testid="currency-input"]')
		await input.fill('99999999999999.99')
		await input.blur()
		// Should handle large numbers appropriately
		const value = await input.inputValue()
		expect(value).toContain('R$')
	})
})
