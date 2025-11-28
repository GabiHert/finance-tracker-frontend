# M3-F5: Color Picker Component

## Feature Overview
- **Task ID:** M3-F5
- **Points:** 2
- **Domain:** Frontend
- **Reference:** Frontend UI v3.0 Section 4.4.2 and 3.7.1

## Description
Color picker with preset colors and custom hex input for category colors.

## Acceptance Criteria
- 12 preset colors from chart palette
- Custom hex input option
- Color swatches: 32px × 32px circles
- Selected swatch: 2px white border with shadow
- Hover state: scale(1.1) transform
- Grid: 6 columns (desktop), 4 columns (mobile)
- Hex input: validates format, shows error for invalid
- Live preview of selected color

## Preset Colors
Based on chart palette (Section 3.7.1):
1. Teal: #1A5F7A
2. Green: #22C55E
3. Amber: #F59E0B
4. Red: #EF4444
5. Purple: #8B5CF6
6. Pink: #EC4899
7. Cyan: #06B6D4
8. Lime: #84CC16
9. Orange: #F97316
10. Indigo: #6366F1
11. Rose: #F43F5E
12. Slate: #64748B

## Component Props
```typescript
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  allowCustom?: boolean;
  'data-testid'?: string;
}
```

## Playwright Tests Required
```typescript
test.describe('Color Picker Component', () => {
  test('displays preset color swatches', async ({ page }) => {
    await page.goto('/test/components');
    const swatches = page.locator('[data-testid^="color-swatch"]');
    await expect(swatches).toHaveCount(12);
  });

  test('selects preset color on click', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="color-swatch-0"]');
    await expect(page.locator('[data-testid="color-swatch-0"]')).toHaveClass(/selected/);
  });

  test('custom hex input works', async ({ page }) => {
    await page.goto('/test/components');
    await page.fill('[data-testid="color-hex-input"]', '#FF5500');
    await page.keyboard.press('Enter');
    // Verify color was applied
  });

  test('validates hex format', async ({ page }) => {
    await page.goto('/test/components');
    await page.fill('[data-testid="color-hex-input"]', 'invalid');
    await expect(page.locator('[data-testid="color-error"]')).toBeVisible();
  });

  test('shows preview of selected color', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="color-swatch-2"]');
    const preview = page.locator('[data-testid="color-preview"]');
    await expect(preview).toHaveCSS('background-color', 'rgb(245, 158, 11)');
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/test/components');
    await page.locator('[data-testid="color-picker"]').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
  });
});
```

## Files to Create
- `/src/main/components/ui/ColorPicker/ColorPicker.tsx`
- `/src/main/components/ui/ColorPicker/ColorPicker.css`
- `/src/main/components/ui/ColorPicker/colors.ts` (preset colors)
- `/src/main/components/ui/ColorPicker/index.ts`
- `/src/test/integration/color-picker.spec.ts` (Playwright)
