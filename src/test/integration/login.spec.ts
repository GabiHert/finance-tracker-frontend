import { test, expect } from '@playwright/test'

test.describe('Login Screen', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login')
	})

	test('displays all UI elements correctly', async ({ page }) => {
		// Logo
		await expect(page.getByTestId('logo')).toBeVisible()

		// Heading
		await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible()

		// Subtitle
		await expect(page.getByText('Entre na sua conta')).toBeVisible()

		// Email input
		await expect(page.getByLabel('E-mail')).toBeVisible()

		// Password input
		await expect(page.getByTestId('input-password')).toBeVisible()

		// Remember me checkbox
		await expect(page.getByText('Lembrar de mim')).toBeVisible()

		// Forgot password link
		await expect(page.getByRole('link', { name: 'Esqueceu a senha?' })).toBeVisible()

		// Login button
		await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()

		// Sign up link
		await expect(page.getByText('Não tem uma conta?')).toBeVisible()
		await expect(page.getByRole('link', { name: 'Criar conta' })).toBeVisible()
	})

	test('validates email format before submit', async ({ page }) => {
		const emailInput = page.getByLabel('E-mail')
		const passwordInput = page.getByTestId('input-password')
		const submitButton = page.getByRole('button', { name: 'Entrar' })

		await emailInput.fill('invalid-email')
		await passwordInput.fill('password123')
		await submitButton.click()

		await expect(page.getByText('E-mail inválido')).toBeVisible()
	})

	test('validates password is required', async ({ page }) => {
		const emailInput = page.getByLabel('E-mail')
		const submitButton = page.getByRole('button', { name: 'Entrar' })

		await emailInput.fill('test@example.com')
		await submitButton.click()

		await expect(page.getByText('Senha é obrigatória')).toBeVisible()
	})

	test('remember me checkbox toggles', async ({ page }) => {
		const checkbox = page.getByRole('checkbox')

		await expect(checkbox).not.toBeChecked()
		await checkbox.click()
		await expect(checkbox).toBeChecked()
		await checkbox.click()
		await expect(checkbox).not.toBeChecked()
	})

	test('forgot password link navigates correctly', async ({ page }) => {
		await page.getByRole('link', { name: 'Esqueceu a senha?' }).click()

		await expect(page).toHaveURL(/.*forgot-password/)
	})

	test('sign up link navigates correctly', async ({ page }) => {
		await page.getByRole('link', { name: 'Criar conta' }).click()

		await expect(page).toHaveURL(/.*register/)
	})

	test('shows loading state during form submission', async ({ page }) => {
		// Mock API to delay response
		await page.route('**/api/v1/auth/login', async route => {
			await new Promise(resolve => setTimeout(resolve, 500))
			await route.fulfill({ status: 401, json: { message: 'Invalid credentials' } })
		})

		await page.getByLabel('E-mail').fill('test@example.com')
		await page.getByTestId('input-password').fill('password123')
		await page.getByRole('button', { name: 'Entrar' }).click()

		// Button should show loading state
		await expect(page.getByTestId('loading-spinner')).toBeVisible()
	})

	test('keyboard navigation works', async ({ page }) => {
		await page.keyboard.press('Tab')
		await expect(page.getByLabel('E-mail')).toBeFocused()

		await page.keyboard.press('Tab')
		await expect(page.getByTestId('input-password')).toBeFocused()
	})
})
