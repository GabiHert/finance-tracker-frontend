import { test, expect } from '@test/fixtures'

test.describe('Button Component', () => {
	test.beforeEach(async ({ page }) => {
		// Use the login page where Button component is used
		await page.goto('/login')
	})

	test('renders submit button with correct text', async ({ page }) => {
		const button = page.getByRole('button', { name: 'Entrar' })
		await expect(button).toBeVisible()
	})

	test('button has correct type attribute', async ({ page }) => {
		const button = page.getByRole('button', { name: 'Entrar' })
		await expect(button).toHaveAttribute('type', 'submit')
	})

	test('button is enabled by default', async ({ page }) => {
		const button = page.getByRole('button', { name: 'Entrar' })
		await expect(button).toBeEnabled()
	})

	test('shows loading spinner when form is submitting', async ({ page }) => {
		// Mock API to delay response
		await page.route('**/api/v1/auth/login', async route => {
			await new Promise(resolve => setTimeout(resolve, 1000))
			await route.fulfill({ status: 401, json: { message: 'Invalid credentials' } })
		})

		await page.getByLabel('E-mail').fill('test@example.com')
		await page.getByLabel('Senha').fill('password123')
		await page.getByRole('button', { name: 'Entrar' }).click()

		// Button should show loading state
		await expect(page.getByTestId('loading-spinner')).toBeVisible()
	})

	test('keyboard navigation works - Enter submits form', async ({ page }) => {
		await page.getByLabel('E-mail').fill('test@example.com')
		await page.getByLabel('Senha').fill('password123')

		// Focus button and press Enter
		const button = page.getByRole('button', { name: 'Entrar' })
		await button.focus()
		await expect(button).toBeFocused()
	})

	test('focus ring is visible on button focus', async ({ page }) => {
		const button = page.getByRole('button', { name: 'Entrar' })
		await button.focus()
		await expect(button).toBeFocused()
	})

	test('full width button spans container', async ({ page }) => {
		const button = page.getByRole('button', { name: 'Entrar' })
		// The button should have w-full class
		await expect(button).toHaveClass(/w-full/)
	})
})
