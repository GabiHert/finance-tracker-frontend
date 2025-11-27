import { test, expect } from '@playwright/test'

test.describe('Finance Tracker App', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Finance Tracker|Vite \+ React \+ TS/)
  })

  test('should display the welcome header', async ({ page }) => {
    await page.goto('/')

    const header = page.getByRole('heading', { name: /Finance Tracker/i })
    await expect(header).toBeVisible()
  })

  test('should display the welcome message', async ({ page }) => {
    await page.goto('/')

    const welcomeCard = page.getByText(/Bem-vindo/i)
    await expect(welcomeCard).toBeVisible()
  })

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/')

    const main = page.locator('main')
    await expect(main).toBeVisible()

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })
})
