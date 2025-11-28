import { test, expect } from '@test/fixtures'

test.describe('Loading & Empty States', () => {
	test.describe('Skeleton Loading State', () => {
		test.beforeEach(async ({ page }) => {
			// Mock slow API response
			await page.route('**/api/v1/transactions*', async route => {
				await new Promise(resolve => setTimeout(resolve, 2000))
				await route.fulfill({ status: 200, json: [] })
			})
			await page.goto('/transactions')
		})

		test('shows skeleton loader while loading', async ({ page }) => {
			const skeleton = page.locator('[data-testid="transactions-skeleton"]')
			await expect(skeleton).toBeVisible()
		})

		test('skeleton has multiple rows', async ({ page }) => {
			const skeletonRows = page.locator('[data-testid="skeleton-row"]')
			const count = await skeletonRows.count()
			expect(count).toBeGreaterThanOrEqual(5)
		})

		test('skeleton rows have animated pulse', async ({ page }) => {
			const skeletonRow = page.locator('[data-testid="skeleton-row"]').first()
			await expect(skeletonRow).toHaveClass(/animate-pulse/)
		})

		test('skeleton shows date group headers', async ({ page }) => {
			const skeletonDateHeader = page.locator('[data-testid="skeleton-date-header"]')
			await expect(skeletonDateHeader.first()).toBeVisible()
		})

		test('skeleton hides after data loads', async ({ page }) => {
			await page.waitForTimeout(2500)
			const skeleton = page.locator('[data-testid="transactions-skeleton"]')
			await expect(skeleton).not.toBeVisible()
		})
	})

	test.describe('Empty State - No Transactions', () => {
		test.beforeEach(async ({ page }) => {
			// Mock empty response
			await page.route('**/api/v1/transactions*', async route => {
				await route.fulfill({ status: 200, json: [] })
			})
			await page.goto('/transactions')
		})

		test('shows empty state when no transactions', async ({ page }) => {
			const emptyState = page.locator('[data-testid="empty-state"]')
			await expect(emptyState).toBeVisible()
		})

		test('empty state has icon', async ({ page }) => {
			const icon = page.locator('[data-testid="empty-state-icon"]')
			await expect(icon).toBeVisible()
		})

		test('empty state has title', async ({ page }) => {
			const title = page.locator('[data-testid="empty-state-title"]')
			await expect(title).toBeVisible()
			await expect(title).toContainText('No transactions yet')
		})

		test('empty state has description', async ({ page }) => {
			const description = page.locator('[data-testid="empty-state-description"]')
			await expect(description).toBeVisible()
		})

		test('empty state has CTA button', async ({ page }) => {
			const ctaBtn = page.locator('[data-testid="empty-state-cta"]')
			await expect(ctaBtn).toBeVisible()
			await expect(ctaBtn).toContainText('Add Transaction')
		})

		test('CTA button opens transaction modal', async ({ page }) => {
			await page.click('[data-testid="empty-state-cta"]')
			await expect(page.locator('[data-testid="transaction-modal"]')).toBeVisible()
		})

		test('empty state is centered on page', async ({ page }) => {
			const emptyState = page.locator('[data-testid="empty-state"]')
			await expect(emptyState).toHaveClass(/text-center/)
		})
	})

	test.describe('Empty State - Filtered Results', () => {
		test.beforeEach(async ({ page }) => {
			// Mock transactions that won't match filter
			await page.route('**/api/v1/transactions*', async route => {
				await route.fulfill({
					status: 200,
					json: [
						{ id: '1', description: 'Groceries', amount: 100, type: 'expense' },
					],
				})
			})
			await page.goto('/transactions')
		})

		test('shows filter empty state when no results match', async ({ page }) => {
			const search = page.locator('[data-testid="filter-search"]')
			await search.fill('nonexistent search term xyz')
			await page.waitForTimeout(300)

			const filterEmptyState = page.locator('[data-testid="filter-empty-state"]')
			await expect(filterEmptyState).toBeVisible()
		})

		test('filter empty state has title', async ({ page }) => {
			const search = page.locator('[data-testid="filter-search"]')
			await search.fill('nonexistent')
			await page.waitForTimeout(300)

			const title = page.locator('[data-testid="filter-empty-state-title"]')
			await expect(title).toContainText('No transactions found')
		})

		test('filter empty state has description', async ({ page }) => {
			const search = page.locator('[data-testid="filter-search"]')
			await search.fill('nonexistent')
			await page.waitForTimeout(300)

			const description = page.locator('[data-testid="filter-empty-state-description"]')
			await expect(description).toContainText('Try adjusting your filters')
		})

		test('filter empty state has clear filters button', async ({ page }) => {
			const search = page.locator('[data-testid="filter-search"]')
			await search.fill('nonexistent')
			await page.waitForTimeout(300)

			const clearBtn = page.locator('[data-testid="filter-empty-state-clear"]')
			await expect(clearBtn).toBeVisible()
		})

		test('clear filters button resets filters', async ({ page }) => {
			const search = page.locator('[data-testid="filter-search"]')
			await search.fill('nonexistent')
			await page.waitForTimeout(300)

			await page.click('[data-testid="filter-empty-state-clear"]')
			await expect(search).toHaveValue('')

			// Should show transactions again
			const rows = page.locator('[data-testid="transaction-row"]')
			await expect(rows.first()).toBeVisible()
		})
	})

	test.describe('Loading State - Pagination', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/transactions')
		})

		test('shows loading spinner when scrolling to load more', async ({ page }) => {
			await page.evaluate(() => {
				window.scrollTo(0, document.body.scrollHeight)
			})

			const loadingSpinner = page.locator('[data-testid="pagination-loading"]')
			await expect(loadingSpinner).toBeVisible()
		})

		test('loading spinner disappears after data loads', async ({ page }) => {
			await page.evaluate(() => {
				window.scrollTo(0, document.body.scrollHeight)
			})

			await page.waitForTimeout(1000)

			const loadingSpinner = page.locator('[data-testid="pagination-loading"]')
			await expect(loadingSpinner).not.toBeVisible()
		})
	})

	test.describe('Loading State - Form Submission', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/transactions')
			await page.click('[data-testid="add-transaction-btn"]')
		})

		test('shows loading spinner on form submit', async ({ page }) => {
			// Mock slow API response
			await page.route('**/api/v1/transactions', async route => {
				await new Promise(resolve => setTimeout(resolve, 1000))
				await route.fulfill({ status: 200, json: { id: '123' } })
			})

			await page.fill('[data-testid="transaction-description"]', 'Test')
			await page.fill('[data-testid="transaction-amount"] input', '100')
			await page.click('[data-testid="transaction-category"]')
			await page.click('[data-testid="select-option-0"]')

			await page.click('[data-testid="modal-save-btn"]')

			const spinner = page.locator('[data-testid="loading-spinner"]')
			await expect(spinner).toBeVisible()
		})

		test('disables form inputs while submitting', async ({ page }) => {
			// Mock slow API response
			await page.route('**/api/v1/transactions', async route => {
				await new Promise(resolve => setTimeout(resolve, 1000))
				await route.fulfill({ status: 200, json: { id: '123' } })
			})

			await page.fill('[data-testid="transaction-description"]', 'Test')
			await page.fill('[data-testid="transaction-amount"] input', '100')
			await page.click('[data-testid="transaction-category"]')
			await page.click('[data-testid="select-option-0"]')

			await page.click('[data-testid="modal-save-btn"]')

			const description = page.locator('[data-testid="transaction-description"]')
			await expect(description).toBeDisabled()
		})
	})

	test.describe('Error State', () => {
		test.beforeEach(async ({ page }) => {
			// Mock API error
			await page.route('**/api/v1/transactions*', async route => {
				await route.fulfill({ status: 500, json: { message: 'Server error' } })
			})
			await page.goto('/transactions')
		})

		test('shows error state on API failure', async ({ page }) => {
			const errorState = page.locator('[data-testid="error-state"]')
			await expect(errorState).toBeVisible()
		})

		test('error state has icon', async ({ page }) => {
			const icon = page.locator('[data-testid="error-state-icon"]')
			await expect(icon).toBeVisible()
		})

		test('error state has error message', async ({ page }) => {
			const message = page.locator('[data-testid="error-state-message"]')
			await expect(message).toBeVisible()
			await expect(message).toContainText('Failed to load transactions')
		})

		test('error state has retry button', async ({ page }) => {
			const retryBtn = page.locator('[data-testid="error-state-retry"]')
			await expect(retryBtn).toBeVisible()
		})

		test('retry button refetches data', async ({ page }) => {
			// Update mock to succeed on retry
			await page.unroute('**/api/v1/transactions*')
			await page.route('**/api/v1/transactions*', async route => {
				await route.fulfill({ status: 200, json: [] })
			})

			await page.click('[data-testid="error-state-retry"]')

			const errorState = page.locator('[data-testid="error-state"]')
			await expect(errorState).not.toBeVisible()
		})
	})

	test.describe('Optimistic Updates', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/transactions')
		})

		test('shows new transaction immediately on create', async ({ page }) => {
			await page.click('[data-testid="add-transaction-btn"]')
			await page.fill('[data-testid="transaction-description"]', 'New Transaction')
			await page.fill('[data-testid="transaction-amount"] input', '100')
			await page.click('[data-testid="transaction-category"]')
			await page.click('[data-testid="select-option-0"]')
			await page.click('[data-testid="modal-save-btn"]')

			// Should see transaction immediately (optimistic update)
			const transaction = page.locator('text=New Transaction')
			await expect(transaction).toBeVisible()
		})
	})
})
