import { test, expect } from '@test/fixtures'

test.describe('Registration Screen', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/register')
	})

	test('displays all UI elements correctly', async ({ page }) => {
		// Logo
		await expect(page.getByTestId('logo')).toBeVisible()

		// Heading
		await expect(page.getByRole('heading', { name: 'Criar Conta' })).toBeVisible()

		// Subtitle
		await expect(page.getByText('Comece a controlar suas finanças')).toBeVisible()

		// Name input
		await expect(page.getByLabel('Nome completo')).toBeVisible()

		// Email input
		await expect(page.getByLabel('E-mail')).toBeVisible()

		// Password input
		await expect(page.getByLabel('Senha').first()).toBeVisible()

		// Confirm password input
		await expect(page.getByLabel('Confirmar senha')).toBeVisible()

		// Terms checkbox
		await expect(page.getByText('Eu concordo com os')).toBeVisible()
		await expect(page.getByRole('link', { name: 'Termos de Serviço' })).toBeVisible()
		await expect(page.getByRole('link', { name: 'Política de Privacidade' })).toBeVisible()

		// Create account button
		await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible()

		// Sign in link
		await expect(page.getByText('Já tem uma conta?')).toBeVisible()
		await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
	})

	test('validates name minimum length', async ({ page }) => {
		await page.getByLabel('Nome completo').fill('A')
		await page.getByRole('button', { name: 'Criar conta' }).click()

		await expect(page.getByText('Nome deve ter pelo menos 2 caracteres')).toBeVisible()
	})

	test('validates email format', async ({ page }) => {
		await page.getByLabel('Nome completo').fill('Test User')
		await page.getByLabel('E-mail').fill('invalid-email')
		await page.getByRole('button', { name: 'Criar conta' }).click()

		await expect(page.getByText('E-mail inválido')).toBeVisible()
	})

	test('validates password minimum length', async ({ page }) => {
		await page.getByLabel('Nome completo').fill('Test User')
		await page.getByLabel('E-mail').fill('test@example.com')
		await page.getByTestId('input-password').fill('short')
		await page.getByRole('button', { name: 'Criar conta' }).click()

		await expect(page.getByText('Senha deve ter pelo menos 8 caracteres')).toBeVisible()
	})

	test('validates password confirmation matches', async ({ page }) => {
		await page.getByLabel('Nome completo').fill('Test User')
		await page.getByLabel('E-mail').fill('test@example.com')
		await page.getByTestId('input-password').fill('password123')
		await page.getByLabel('Confirmar senha').fill('different123')
		await page.getByRole('button', { name: 'Criar conta' }).click()

		await expect(page.getByText('Senhas não coincidem')).toBeVisible()
	})

	test('terms checkbox is required', async ({ page }) => {
		await page.getByLabel('Nome completo').fill('Test User')
		await page.getByLabel('E-mail').fill('test@example.com')
		await page.getByTestId('input-password').fill('password123')
		await page.getByLabel('Confirmar senha').fill('password123')
		await page.getByRole('button', { name: 'Criar conta' }).click()

		await expect(page.getByText('Você deve aceitar os termos')).toBeVisible()
	})

	test('password visibility toggle works', async ({ page }) => {
		const passwordInput = page.getByTestId('input-password')
		const toggleButton = page.getByTestId('password-toggle').first()

		await passwordInput.fill('password123')

		// Initially hidden
		await expect(passwordInput).toHaveAttribute('type', 'password')

		// Show password
		await toggleButton.click()
		await expect(passwordInput).toHaveAttribute('type', 'text')

		// Hide again
		await toggleButton.click()
		await expect(passwordInput).toHaveAttribute('type', 'password')
	})

	test('sign in link navigates correctly', async ({ page }) => {
		await page.getByRole('link', { name: 'Entrar' }).click()

		await expect(page).toHaveURL(/.*login/)
	})

	test('terms links open in new tab', async ({ page }) => {
		const termsLink = page.getByRole('link', { name: 'Termos de Serviço' })

		await expect(termsLink).toHaveAttribute('target', '_blank')
	})

	test('shows loading state during form submission', async ({ page }) => {
		// Mock API to delay response
		await page.route('**/api/v1/auth/register', async route => {
			await new Promise(resolve => setTimeout(resolve, 500))
			await route.fulfill({ status: 201, json: { access_token: 'test', refresh_token: 'test', user: {} } })
		})

		await page.getByLabel('Nome completo').fill('Test User')
		await page.getByLabel('E-mail').fill('test@example.com')
		await page.getByTestId('input-password').fill('password123')
		await page.getByLabel('Confirmar senha').fill('password123')
		await page.getByRole('checkbox').click()
		await page.getByRole('button', { name: 'Criar conta' }).click()

		// Button should show loading state
		await expect(page.getByTestId('loading-spinner')).toBeVisible()
	})
})
