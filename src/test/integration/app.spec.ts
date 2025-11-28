import { test, expect } from '@test/fixtures'

test.describe('Finance Tracker App', () => {
	test('should load the application', async ({ page }) => {
		await page.goto('/')

		await expect(page).toHaveTitle(/Finance Tracker|Vite \+ React \+ TS/)
	})

	test('should redirect to login page', async ({ page }) => {
		await page.goto('/')

		// App should redirect to login
		await expect(page).toHaveURL(/.*login/)
	})

	test('should display the Finance Tracker logo', async ({ page }) => {
		await page.goto('/')

		const logo = page.getByTestId('logo')
		await expect(logo).toBeVisible()
		await expect(logo).toContainText('Finance Tracker')
	})

	test('should display the welcome message', async ({ page }) => {
		await page.goto('/')

		const welcomeText = page.getByText(/Bem-vindo/i)
		await expect(welcomeText).toBeVisible()
	})
})
