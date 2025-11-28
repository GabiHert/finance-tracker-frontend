# M3-F4: Icon Picker Component

## Feature Overview
- **Task ID:** M3-F4
- **Points:** 2
- **Domain:** Frontend
- **Reference:** Frontend UI v3.0 Section 4.4.2

## Description
Grid-based icon picker for selecting category icons.

## Acceptance Criteria
- Grid of 48 common category icons
- Searchable with filter input
- Icons: 24px size, gray-500 color
- Icon button: 40px × 40px touch target
- Selected icon: primary-50 background, primary-600 icon color, 2px primary border
- Hover state: gray-50 background
- Focus state: focus ring visible
- Grouped by category (if more than 48 icons)
- Keyboard navigation: arrow keys to move, enter to select

## Icon Categories
- Finance: wallet, credit-card, bank, receipt, coins
- Food: utensils, coffee, shopping-cart, pizza
- Transport: car, bus, plane, train, bike
- Home: home, bed, sofa, lamp
- Entertainment: music, film, gamepad, tv
- Health: heart, medical-kit, pill
- Education: book, graduation-cap, pencil
- Shopping: bag, tag, gift, percent
- Utilities: bolt, wifi, phone, water

## Component Props
```typescript
interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
  searchable?: boolean;
  'data-testid'?: string;
}
```

## Playwright Tests Required
```typescript
test.describe('Icon Picker Component', () => {
  test('displays icon grid', async ({ page }) => {
    await page.goto('/test/components');
    const icons = page.locator('[data-testid="icon-option"]');
    await expect(icons.first()).toBeVisible();
    await expect(icons).toHaveCount(48);
  });

  test('selects icon on click', async ({ page }) => {
    await page.goto('/test/components');
    await page.click('[data-testid="icon-wallet"]');
    await expect(page.locator('[data-testid="icon-wallet"]')).toHaveClass(/selected/);
  });

  test('search filters icons', async ({ page }) => {
    await page.goto('/test/components');
    await page.fill('[data-testid="icon-search"]', 'car');
    const icons = page.locator('[data-testid^="icon-"]');
    // Should show fewer icons
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/test/components');
    await page.locator('[data-testid="icon-picker"]').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
  });

  test('applies preview color to icons', async ({ page }) => {
    await page.goto('/test/components');
    // Icons should show in the specified preview color
  });
});
```

## Files to Create
- `/src/main/components/ui/IconPicker/IconPicker.tsx`
- `/src/main/components/ui/IconPicker/IconPicker.css`
- `/src/main/components/ui/IconPicker/icons.ts` (icon list)
- `/src/main/components/ui/IconPicker/index.ts`
- `/src/test/integration/icon-picker.spec.ts` (Playwright)
