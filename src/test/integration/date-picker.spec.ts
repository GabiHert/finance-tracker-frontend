import { test, expect } from '@test/fixtures'

test.describe('DatePicker Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/test/components')
	})

	test('renders with calendar icon', async ({ page }) => {
		const datePicker = page.locator('[data-testid="date-picker"]')
		await expect(datePicker).toBeVisible()
		const icon = datePicker.locator('[data-testid="calendar-icon"]')
		await expect(icon).toBeVisible()
	})

	test('opens calendar on click', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		await expect(page.locator('[data-testid="calendar-dropdown"]')).toBeVisible()
	})

	test('displays dates in Brazilian format DD/MM/YYYY', async ({ page }) => {
		const input = page.locator('[data-testid="date-picker-input"]')
		await input.fill('15/03/2024')
		await expect(input).toHaveValue('15/03/2024')
	})

	test('selects date from calendar', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		await page.click('[data-testid="calendar-day-15"]')
		const input = page.locator('[data-testid="date-picker-input"]')
		const value = await input.inputValue()
		expect(value).toMatch(/\d{2}\/\d{2}\/\d{4}/)
	})

	test('navigates to next month', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		const currentMonth = await page.locator('[data-testid="calendar-month"]').textContent()
		await page.click('[data-testid="calendar-next-month"]')
		const nextMonth = await page.locator('[data-testid="calendar-month"]').textContent()
		expect(nextMonth).not.toBe(currentMonth)
	})

	test('navigates to previous month', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		const currentMonth = await page.locator('[data-testid="calendar-month"]').textContent()
		await page.click('[data-testid="calendar-prev-month"]')
		const prevMonth = await page.locator('[data-testid="calendar-month"]').textContent()
		expect(prevMonth).not.toBe(currentMonth)
	})

	test('navigates to next year', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		const currentYear = await page.locator('[data-testid="calendar-year"]').textContent()
		await page.click('[data-testid="calendar-next-year"]')
		const nextYear = await page.locator('[data-testid="calendar-year"]').textContent()
		expect(Number(nextYear)).toBe(Number(currentYear) + 1)
	})

	test('navigates to previous year', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		const currentYear = await page.locator('[data-testid="calendar-year"]').textContent()
		await page.click('[data-testid="calendar-prev-year"]')
		const prevYear = await page.locator('[data-testid="calendar-year"]').textContent()
		expect(Number(prevYear)).toBe(Number(currentYear) - 1)
	})

	test('highlights current date', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		const today = page.locator('[data-testid="calendar-today"]')
		await expect(today).toBeVisible()
	})

	test('highlights selected date', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		await page.click('[data-testid="calendar-day-15"]')
		await page.click('[data-testid="date-picker"]')
		const selected = page.locator('[data-testid="calendar-selected"]')
		await expect(selected).toBeVisible()
	})

	test('closes calendar on date selection', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		await page.click('[data-testid="calendar-day-15"]')
		await expect(page.locator('[data-testid="calendar-dropdown"]')).not.toBeVisible()
	})

	test('closes calendar on escape key', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		await expect(page.locator('[data-testid="calendar-dropdown"]')).toBeVisible()
		await page.keyboard.press('Escape')
		await expect(page.locator('[data-testid="calendar-dropdown"]')).not.toBeVisible()
	})

	test('closes calendar when clicking outside', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		await expect(page.locator('[data-testid="calendar-dropdown"]')).toBeVisible()
		await page.click('body', { position: { x: 10, y: 10 } })
		await expect(page.locator('[data-testid="calendar-dropdown"]')).not.toBeVisible()
	})

	test('shows error state', async ({ page }) => {
		const error = page.locator('[data-testid="date-picker-error-message"]')
		await expect(error).toBeVisible()
		await expect(error).toContainText('Date is required')
	})

	test('disabled state prevents interaction', async ({ page }) => {
		const datePicker = page.locator('[data-testid="date-picker-disabled"]')
		await expect(datePicker).toHaveAttribute('aria-disabled', 'true')
		await datePicker.click({ force: true })
		await expect(page.locator('[data-testid="calendar-dropdown"]')).not.toBeVisible()
	})

	test('label is correctly associated', async ({ page }) => {
		const label = page.locator('text=Date')
		await expect(label).toBeVisible()
	})

	test('validates date format on manual input', async ({ page }) => {
		const input = page.locator('[data-testid="date-picker-input"]')
		await input.fill('invalid')
		await input.blur()
		const error = page.locator('[data-testid="date-picker-error-message"]')
		await expect(error).toBeVisible()
	})

	test('allows clearing selected date', async ({ page }) => {
		const input = page.locator('[data-testid="date-picker-input"]')
		await input.fill('15/03/2024')
		await page.click('[data-testid="date-picker-clear"]')
		await expect(input).toHaveValue('')
	})

	test('shows placeholder text', async ({ page }) => {
		const input = page.locator('[data-testid="date-picker-input"]')
		await expect(input).toHaveAttribute('placeholder', 'DD/MM/YYYY')
	})

	test('keyboard navigation in calendar', async ({ page }) => {
		await page.click('[data-testid="date-picker"]')
		await page.keyboard.press('ArrowRight')
		await page.keyboard.press('ArrowDown')
		await page.keyboard.press('Enter')
		const input = page.locator('[data-testid="date-picker-input"]')
		const value = await input.inputValue()
		expect(value).toMatch(/\d{2}\/\d{2}\/\d{4}/)
	})
})
