# Feature: Date Picker Component

## Description
A date picker component with calendar dropdown, date range support, and Brazilian locale formatting.

## Specifications

### Acceptance Criteria
- Calendar popup on click/focus
- Brazilian date format (DD/MM/YYYY)
- Portuguese month names and day abbreviations
- Navigation between months/years
- Date range mode for start/end dates
- Keyboard navigation support
- Today highlight
- Disabled dates support
- Accessible with ARIA attributes

### Props Interface
```typescript
interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  error?: string
  'data-testid'?: string
}

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onChange: (start: Date | null, end: Date | null) => void
  'data-testid'?: string
}
```

### Playwright Tests (Required First)
```typescript
test.describe('Date Picker Component', () => {
  test('opens calendar on click', async ({ page }) => {
    await page.goto('/test-components')
    await page.click('[data-testid="date-picker"]')
    await expect(page.locator('[data-testid="date-calendar"]')).toBeVisible()
  })

  test('selects date and formats as DD/MM/YYYY', async ({ page }) => {
    await page.click('[data-testid="date-picker"]')
    await page.click('[data-testid="date-day-15"]')
    await expect(page.locator('[data-testid="date-picker"]')).toContainText('/15/')
  })

  test('navigates between months', async ({ page }) => {
    await page.click('[data-testid="date-picker"]')
    await page.click('[data-testid="next-month-btn"]')
    // Should show next month
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.click('[data-testid="date-picker"]')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
  })

  test('closes on escape', async ({ page }) => {
    await page.click('[data-testid="date-picker"]')
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="date-calendar"]')).not.toBeVisible()
  })

  test('closes on outside click', async ({ page }) => {
    await page.click('[data-testid="date-picker"]')
    await page.click('body')
    await expect(page.locator('[data-testid="date-calendar"]')).not.toBeVisible()
  })

  test('shows today highlighted', async ({ page }) => {
    await page.click('[data-testid="date-picker"]')
    await expect(page.locator('[data-testid="date-today"]')).toHaveClass(/today/)
  })

  test('respects min/max date constraints', async ({ page }) => {
    // Dates outside range should be disabled
  })
})
```
