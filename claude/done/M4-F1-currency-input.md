# Feature: Currency Input Component (BRL)

## Description
A currency input component formatted for Brazilian Real (BRL) with automatic formatting, negative values for expenses, and proper decimal handling.

## Specifications

### Acceptance Criteria
- Formats values as BRL currency (R$ 1.234,56)
- Supports negative values (displays with minus sign or red color)
- Automatic thousand separators
- Decimal precision (2 places)
- Clears to empty on focus, shows formatted on blur
- Validates numeric input only
- Supports paste handling
- Accessible with proper ARIA labels

### Props Interface
```typescript
interface CurrencyInputProps {
  value: number | null
  onChange: (value: number | null) => void
  placeholder?: string
  allowNegative?: boolean
  error?: string
  disabled?: boolean
  'data-testid'?: string
}
```

### Playwright Tests (Required First)
```typescript
test.describe('Currency Input Component', () => {
  test('formats value as BRL currency', async ({ page }) => {
    await page.goto('/test-components')
    const input = page.locator('[data-testid="currency-input"]')
    await input.fill('1234.56')
    await input.blur()
    await expect(input).toHaveValue('R$ 1.234,56')
  })

  test('allows negative values when enabled', async ({ page }) => {
    const input = page.locator('[data-testid="currency-input-negative"]')
    await input.fill('-500')
    await expect(input).toHaveValue('-R$ 500,00')
  })

  test('only accepts numeric input', async ({ page }) => {
    const input = page.locator('[data-testid="currency-input"]')
    await input.fill('abc123')
    await expect(input).toHaveValue('R$ 123,00')
  })

  test('handles decimal input correctly', async ({ page }) => {
    const input = page.locator('[data-testid="currency-input"]')
    await input.fill('99.99')
    await expect(input).toHaveValue('R$ 99,99')
  })

  test('clears to raw value on focus', async ({ page }) => {
    const input = page.locator('[data-testid="currency-input"]')
    await input.fill('1000')
    await input.blur()
    await input.focus()
    // Should show editable format
  })

  test('shows error state', async ({ page }) => {
    await expect(page.locator('[data-testid="currency-input-error"]')).toHaveClass(/error/)
  })

  test('disabled state prevents input', async ({ page }) => {
    const input = page.locator('[data-testid="currency-input-disabled"]')
    await expect(input).toBeDisabled()
  })
})
```
