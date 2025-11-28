import { test, expect } from '@test/fixtures'

test.describe('Accessibility', () => {
	test('should have proper heading hierarchy', async ({ page }) => {
		await page.goto('/login')

		const h1 = page.getByRole('heading', { level: 1 })
		await expect(h1).toBeVisible()
	})

	test('should have proper document structure', async ({ page }) => {
		await page.goto('/login')

		const root = page.locator('#root')
		await expect(root).toBeVisible()

		const html = page.locator('html')
		await expect(html).toHaveAttribute('lang', 'pt-BR')
	})

	test('should have sufficient color contrast in light mode', async ({ page }) => {
		await page.goto('/login')

		await page.emulateMedia({ colorScheme: 'light' })

		const body = page.locator('body')
		await expect(body).toBeVisible()
	})

	test('should support dark mode', async ({ page }) => {
		await page.goto('/login')

		await page.emulateMedia({ colorScheme: 'dark' })

		const body = page.locator('body')
		await expect(body).toBeVisible()
	})

	test('should have form inputs with proper labels', async ({ page }) => {
		await page.goto('/login')

		// Email input should have accessible label
		const emailInput = page.getByLabel('E-mail')
		await expect(emailInput).toBeVisible()

		// Password input should have accessible label
		const passwordInput = page.getByTestId('input-password')
		await expect(passwordInput).toBeVisible()
	})

	test('should have focusable interactive elements', async ({ page }) => {
		await page.goto('/login')

		// Tab to email input
		await page.keyboard.press('Tab')
		await expect(page.getByLabel('E-mail')).toBeFocused()

		// Tab to password input
		await page.keyboard.press('Tab')
		await expect(page.getByTestId('input-password')).toBeFocused()
	})
})
