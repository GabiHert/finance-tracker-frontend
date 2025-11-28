import { test, expect } from '@playwright/test'

test.describe('Input Component', () => {
	test.beforeEach(async ({ page }) => {
		// Use the login page where Input components are used
		await page.goto('/login')
	})

	test('renders email input with label', async ({ page }) => {
		const emailInput = page.getByLabel('E-mail')
		await expect(emailInput).toBeVisible()
		await expect(emailInput).toHaveAttribute('type', 'email')
	})

	test('renders password input with label', async ({ page }) => {
		const passwordInput = page.getByTestId('input-password')
		await expect(passwordInput).toBeVisible()
		await expect(passwordInput).toHaveAttribute('type', 'password')
	})

	test('shows error message when validation fails', async ({ page }) => {
		// Submit form with invalid email
		await page.getByLabel('E-mail').fill('invalid-email')
		await page.getByRole('button', { name: 'Entrar' }).click()

		await expect(page.getByText('E-mail inválido')).toBeVisible()
	})

	test('password toggle shows/hides password', async ({ page }) => {
		const passwordInput = page.getByTestId('input-password')
		const toggleButton = page.getByTestId('password-toggle')

		await passwordInput.fill('password123')

		// Initially password is hidden
		await expect(passwordInput).toHaveAttribute('type', 'password')

		// Click toggle to show password
		await toggleButton.click()
		await expect(passwordInput).toHaveAttribute('type', 'text')

		// Click again to hide
		await toggleButton.click()
		await expect(passwordInput).toHaveAttribute('type', 'password')
	})

	test('focus state works correctly', async ({ page }) => {
		const emailInput = page.getByLabel('E-mail')
		await emailInput.focus()
		await expect(emailInput).toBeFocused()
	})

	test('keyboard input works', async ({ page }) => {
		const emailInput = page.getByLabel('E-mail')
		await emailInput.focus()
		await page.keyboard.type('test@example.com')
		await expect(emailInput).toHaveValue('test@example.com')
	})

	test('placeholder is visible', async ({ page }) => {
		const emailInput = page.getByLabel('E-mail')
		await expect(emailInput).toHaveAttribute('placeholder', 'Digite seu e-mail')
	})

	test('required attribute is set', async ({ page }) => {
		const emailInput = page.getByLabel('E-mail')
		await expect(emailInput).toHaveAttribute('required', '')
	})

	test('left icon is rendered', async ({ page }) => {
		// Email input should have an envelope icon
		const inputContainer = page.locator('[data-testid="input-email"]').locator('..')
		// The icon should be within the input wrapper
		await expect(inputContainer.locator('svg')).toBeVisible()
	})
})
