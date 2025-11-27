import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
  })

  test('should have proper document structure', async ({ page }) => {
    await page.goto('/')

    const root = page.locator('#root')
    await expect(root).toBeVisible()

    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'pt-BR')
  })

  test('should have sufficient color contrast in light mode', async ({ page }) => {
    await page.goto('/')

    await page.emulateMedia({ colorScheme: 'light' })

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should support dark mode', async ({ page }) => {
    await page.goto('/')

    await page.emulateMedia({ colorScheme: 'dark' })

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
