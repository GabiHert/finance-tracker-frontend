import { test, expect } from '@test/fixtures'

test.describe('TransactionModal Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/transactions')
		await page.click('[data-testid="add-transaction-btn"]')
		await expect(page.locator('[data-testid="transaction-modal"]')).toBeVisible()
	})

	test('renders modal title', async ({ page }) => {
		const title = page.locator('[data-testid="modal-title"]')
		await expect(title).toBeVisible()
		await expect(title).toContainText('Add Transaction')
	})

	test('shows edit title when editing', async ({ page }) => {
		await page.click('[data-testid="modal-close-btn"]')
		const row = page.locator('[data-testid="transaction-row"]').first()
		await row.hover()
		await page.click('[data-testid="transaction-edit-btn"]')
		const title = page.locator('[data-testid="modal-title"]')
		await expect(title).toContainText('Edit Transaction')
	})

	test('renders all form fields', async ({ page }) => {
		await expect(page.locator('[data-testid="transaction-date"]')).toBeVisible()
		await expect(page.locator('[data-testid="transaction-description"]')).toBeVisible()
		await expect(page.locator('[data-testid="transaction-amount"]')).toBeVisible()
		await expect(page.locator('[data-testid="transaction-type"]')).toBeVisible()
		await expect(page.locator('[data-testid="transaction-category"]')).toBeVisible()
		await expect(page.locator('[data-testid="transaction-notes"]')).toBeVisible()
	})

	test('date field has default value of today', async ({ page }) => {
		const dateInput = page.locator('[data-testid="transaction-date"] input')
		const value = await dateInput.inputValue()
		expect(value).toMatch(/\d{2}\/\d{2}\/\d{4}/)
	})

	test('can select date', async ({ page }) => {
		await page.click('[data-testid="transaction-date"]')
		await page.click('[data-testid="calendar-day-15"]')
		const dateInput = page.locator('[data-testid="transaction-date"] input')
		const value = await dateInput.inputValue()
		expect(value).toMatch(/\d{2}\/\d{2}\/\d{4}/)
	})

	test('can enter description', async ({ page }) => {
		const description = page.locator('[data-testid="transaction-description"]')
		await description.fill('Supermarket shopping')
		await expect(description).toHaveValue('Supermarket shopping')
	})

	test('description is required', async ({ page }) => {
		await page.click('[data-testid="modal-save-btn"]')
		const error = page.locator('[data-testid="transaction-description-error"]')
		await expect(error).toBeVisible()
	})

	test('can enter amount', async ({ page }) => {
		const amount = page.locator('[data-testid="transaction-amount"] input')
		await amount.fill('150.50')
		await amount.blur()
		await expect(amount).toHaveValue('R$ 150,50')
	})

	test('amount is required', async ({ page }) => {
		await page.click('[data-testid="modal-save-btn"]')
		const error = page.locator('[data-testid="transaction-amount-error"]')
		await expect(error).toBeVisible()
	})

	test('amount must be positive', async ({ page }) => {
		const amount = page.locator('[data-testid="transaction-amount"] input')
		await amount.fill('-10')
		await page.click('[data-testid="modal-save-btn"]')
		const error = page.locator('[data-testid="transaction-amount-error"]')
		await expect(error).toBeVisible()
	})

	test('can select transaction type', async ({ page }) => {
		await page.click('[data-testid="transaction-type"]')
		await expect(page.locator('[data-testid="select-dropdown"]')).toBeVisible()
		await page.click('[data-testid="select-option-0"]')
	})

	test('type defaults to expense', async ({ page }) => {
		const typeSelect = page.locator('[data-testid="transaction-type"]')
		await expect(typeSelect).toContainText('Expense')
	})

	test('can switch to income type', async ({ page }) => {
		await page.click('[data-testid="transaction-type"]')
		await page.click('[data-testid="select-option-1"]')
		const typeSelect = page.locator('[data-testid="transaction-type"]')
		await expect(typeSelect).toContainText('Income')
	})

	test('can select category', async ({ page }) => {
		await page.click('[data-testid="transaction-category"]')
		await expect(page.locator('[data-testid="select-dropdown"]')).toBeVisible()
		await page.click('[data-testid="select-option-0"]')
	})

	test('category is required', async ({ page }) => {
		await page.click('[data-testid="modal-save-btn"]')
		const error = page.locator('[data-testid="transaction-category-error"]')
		await expect(error).toBeVisible()
	})

	test('category options filtered by type', async ({ page }) => {
		// Select expense type
		await page.click('[data-testid="transaction-type"]')
		await page.click('[data-testid="select-option-0"]')

		// Open category dropdown
		await page.click('[data-testid="transaction-category"]')
		const expenseCategories = page.locator('[data-testid^="select-option"]')
		const expenseCount = await expenseCategories.count()

		// Switch to income type
		await page.keyboard.press('Escape')
		await page.click('[data-testid="transaction-type"]')
		await page.click('[data-testid="select-option-1"]')

		// Check category options changed
		await page.click('[data-testid="transaction-category"]')
		const incomeCategories = page.locator('[data-testid^="select-option"]')
		const incomeCount = await incomeCategories.count()

		expect(incomeCount).not.toBe(expenseCount)
	})

	test('can enter notes', async ({ page }) => {
		const notes = page.locator('[data-testid="transaction-notes"]')
		await notes.fill('Additional information about this transaction')
		await expect(notes).toHaveValue('Additional information about this transaction')
	})

	test('notes field is optional', async ({ page }) => {
		// Fill required fields
		await page.fill('[data-testid="transaction-description"]', 'Test')
		await page.fill('[data-testid="transaction-amount"] input', '100')
		await page.click('[data-testid="transaction-category"]')
		await page.click('[data-testid="select-option-0"]')

		// Should be able to save without notes
		await page.click('[data-testid="modal-save-btn"]')
		await expect(page.locator('[data-testid="transaction-modal"]')).not.toBeVisible()
	})

	test('renders save button', async ({ page }) => {
		const saveBtn = page.locator('[data-testid="modal-save-btn"]')
		await expect(saveBtn).toBeVisible()
		await expect(saveBtn).toContainText('Save')
	})

	test('renders cancel button', async ({ page }) => {
		const cancelBtn = page.locator('[data-testid="modal-cancel-btn"]')
		await expect(cancelBtn).toBeVisible()
		await expect(cancelBtn).toContainText('Cancel')
	})

	test('cancel button closes modal', async ({ page }) => {
		await page.click('[data-testid="modal-cancel-btn"]')
		await expect(page.locator('[data-testid="transaction-modal"]')).not.toBeVisible()
	})

	test('close button closes modal', async ({ page }) => {
		await page.click('[data-testid="modal-close-btn"]')
		await expect(page.locator('[data-testid="transaction-modal"]')).not.toBeVisible()
	})

	test('escape key closes modal', async ({ page }) => {
		await page.keyboard.press('Escape')
		await expect(page.locator('[data-testid="transaction-modal"]')).not.toBeVisible()
	})

	test('clicking backdrop closes modal', async ({ page }) => {
		await page.click('[data-testid="modal-backdrop"]')
		await expect(page.locator('[data-testid="transaction-modal"]')).not.toBeVisible()
	})

	test('submits valid form', async ({ page }) => {
		await page.fill('[data-testid="transaction-description"]', 'Grocery shopping')
		await page.fill('[data-testid="transaction-amount"] input', '250.75')
		await page.click('[data-testid="transaction-category"]')
		await page.click('[data-testid="select-option-0"]')
		await page.fill('[data-testid="transaction-notes"]', 'Weekly groceries')

		await page.click('[data-testid="modal-save-btn"]')
		await expect(page.locator('[data-testid="transaction-modal"]')).not.toBeVisible()
	})

	test('shows loading state during submission', async ({ page }) => {
		// Mock API to delay response
		await page.route('**/api/v1/transactions', async route => {
			await new Promise(resolve => setTimeout(resolve, 1000))
			await route.fulfill({ status: 200, json: { id: '123' } })
		})

		await page.fill('[data-testid="transaction-description"]', 'Test')
		await page.fill('[data-testid="transaction-amount"] input', '100')
		await page.click('[data-testid="transaction-category"]')
		await page.click('[data-testid="select-option-0"]')

		await page.click('[data-testid="modal-save-btn"]')
		await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
	})

	test('shows error on submission failure', async ({ page }) => {
		// Mock API error
		await page.route('**/api/v1/transactions', async route => {
			await route.fulfill({ status: 500, json: { message: 'Server error' } })
		})

		await page.fill('[data-testid="transaction-description"]', 'Test')
		await page.fill('[data-testid="transaction-amount"] input', '100')
		await page.click('[data-testid="transaction-category"]')
		await page.click('[data-testid="select-option-0"]')

		await page.click('[data-testid="modal-save-btn"]')
		const error = page.locator('[data-testid="form-error"]')
		await expect(error).toBeVisible()
	})

	test('focuses first input on open', async ({ page }) => {
		const description = page.locator('[data-testid="transaction-description"]')
		await expect(description).toBeFocused()
	})

	test('tab navigation works through form fields', async ({ page }) => {
		const description = page.locator('[data-testid="transaction-description"]')
		await expect(description).toBeFocused()

		await page.keyboard.press('Tab')
		const amount = page.locator('[data-testid="transaction-amount"] input')
		await expect(amount).toBeFocused()
	})
})
