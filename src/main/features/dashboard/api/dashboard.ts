import { fetchTransactions, type FetchTransactionsResult } from '@main/features/transactions/api/transactions'
import type {
	DashboardSummary,
	CategoryBreakdown,
	TrendDataPoint,
	RecentTransaction,
	GoalProgress,
	DashboardAlert,
	Period,
} from '../types'

/**
 * Calculate date range based on period
 */
function getDateRangeForPeriod(period: Period): { startDate: string; endDate: string } {
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

	let startDate: Date
	let endDate: Date = today

	switch (period) {
		case 'this_month':
			startDate = new Date(today.getFullYear(), today.getMonth(), 1)
			endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
			break
		case 'last_month':
			startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
			endDate = new Date(today.getFullYear(), today.getMonth(), 0)
			break
		case 'this_week': {
			const dayOfWeek = today.getDay()
			const sunday = dayOfWeek === 0 ? 0 : dayOfWeek
			startDate = new Date(today)
			startDate.setDate(today.getDate() - sunday)
			endDate = new Date(startDate)
			endDate.setDate(startDate.getDate() + 6)
			break
		}
		case 'last_week': {
			const dayOfWeek = today.getDay()
			const sunday = dayOfWeek === 0 ? 7 : dayOfWeek
			endDate = new Date(today)
			endDate.setDate(today.getDate() - sunday)
			startDate = new Date(endDate)
			startDate.setDate(endDate.getDate() - 6)
			break
		}
		default:
			startDate = new Date(today.getFullYear(), today.getMonth(), 1)
			endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
	}

	const formatDate = (d: Date) => d.toISOString().split('T')[0]
	return {
		startDate: formatDate(startDate),
		endDate: formatDate(endDate),
	}
}

/**
 * Get the previous period for comparison
 */
function getPreviousPeriodRange(period: Period): { startDate: string; endDate: string } {
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

	let startDate: Date
	let endDate: Date

	switch (period) {
		case 'this_month':
			startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
			endDate = new Date(today.getFullYear(), today.getMonth(), 0)
			break
		case 'last_month':
			startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1)
			endDate = new Date(today.getFullYear(), today.getMonth() - 1, 0)
			break
		case 'this_week': {
			const dayOfWeek = today.getDay()
			const sunday = dayOfWeek === 0 ? 7 : dayOfWeek
			endDate = new Date(today)
			endDate.setDate(today.getDate() - sunday)
			startDate = new Date(endDate)
			startDate.setDate(endDate.getDate() - 6)
			break
		}
		case 'last_week': {
			const dayOfWeek = today.getDay()
			const sunday = dayOfWeek === 0 ? 7 : dayOfWeek
			const lastWeekEnd = new Date(today)
			lastWeekEnd.setDate(today.getDate() - sunday)
			endDate = new Date(lastWeekEnd)
			endDate.setDate(lastWeekEnd.getDate() - 7)
			startDate = new Date(endDate)
			startDate.setDate(endDate.getDate() - 6)
			break
		}
		default:
			startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
			endDate = new Date(today.getFullYear(), today.getMonth(), 0)
	}

	const formatDate = (d: Date) => d.toISOString().split('T')[0]
	return {
		startDate: formatDate(startDate),
		endDate: formatDate(endDate),
	}
}

/**
 * Calculate percentage change between two values
 */
function calculateChange(current: number, previous: number): number {
	if (previous === 0) {
		return current > 0 ? 100 : 0
	}
	return ((current - previous) / previous) * 100
}

export interface DashboardData {
	summary: DashboardSummary
	categoryBreakdown: CategoryBreakdown[]
	trendsData: TrendDataPoint[]
	recentTransactions: RecentTransaction[]
	goalsProgress: GoalProgress[]
	alerts: DashboardAlert[]
}

/**
 * Fetch all dashboard data from the transactions API
 */
export async function fetchDashboardData(period: Period): Promise<DashboardData> {
	const { startDate, endDate } = getDateRangeForPeriod(period)
	const previousPeriod = getPreviousPeriodRange(period)

	// Fetch current period transactions with high limit to get all
	const currentResult = await fetchTransactions({
		startDate,
		endDate,
		limit: 1000,
	})

	// Fetch previous period transactions for comparison
	let previousResult: FetchTransactionsResult | null = null
	try {
		previousResult = await fetchTransactions({
			startDate: previousPeriod.startDate,
			endDate: previousPeriod.endDate,
			limit: 1000,
		})
	} catch {
		// Previous period data not available
	}

	// Calculate summary
	const totalIncome = currentResult.totals.income
	const totalExpenses = currentResult.totals.expense
	const netSavings = totalIncome - totalExpenses

	// Calculate balance (for now, same as net savings since we don't have balance history)
	const totalBalance = netSavings

	// Calculate changes
	let incomeChange: number | undefined
	let expensesChange: number | undefined
	let savingsChange: number | undefined

	if (previousResult) {
		const prevIncome = previousResult.totals.income
		const prevExpenses = previousResult.totals.expense
		const prevSavings = prevIncome - prevExpenses

		incomeChange = calculateChange(totalIncome, prevIncome)
		expensesChange = calculateChange(totalExpenses, prevExpenses)
		savingsChange = calculateChange(netSavings, prevSavings)
	}

	const summary: DashboardSummary = {
		totalBalance,
		totalIncome,
		totalExpenses,
		netSavings,
		incomeChange,
		expensesChange,
		savingsChange,
	}

	// Calculate category breakdown (expenses only)
	const categoryMap = new Map<string, {
		categoryId: string
		categoryName: string
		categoryColor: string
		amount: number
	}>()

	for (const txn of currentResult.transactions) {
		if (txn.type === 'expense') {
			const existing = categoryMap.get(txn.categoryId || 'uncategorized')
			if (existing) {
				existing.amount += Math.abs(txn.amount)
			} else {
				categoryMap.set(txn.categoryId || 'uncategorized', {
					categoryId: txn.categoryId || 'uncategorized',
					categoryName: txn.categoryName || 'Sem categoria',
					categoryColor: txn.categoryColor || '#6B7280',
					amount: Math.abs(txn.amount),
				})
			}
		}
	}

	const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.values())
		.map((cat) => ({
			...cat,
			percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0,
		}))
		.sort((a, b) => b.amount - a.amount)

	// Calculate trends (group by date)
	const trendsMap = new Map<string, { income: number; expenses: number }>()

	for (const txn of currentResult.transactions) {
		// Convert DD/MM/YYYY to YYYY-MM-DD for sorting
		const [day, month, year] = txn.date.split('/')
		const dateKey = `${year}-${month}-${day}`

		const existing = trendsMap.get(dateKey) || { income: 0, expenses: 0 }
		if (txn.type === 'income') {
			existing.income += txn.amount
		} else {
			existing.expenses += Math.abs(txn.amount)
		}
		trendsMap.set(dateKey, existing)
	}

	const trendsData: TrendDataPoint[] = Array.from(trendsMap.entries())
		.map(([date, values]) => ({
			date,
			income: values.income,
			expenses: values.expenses,
		}))
		.sort((a, b) => a.date.localeCompare(b.date))

	// Recent transactions (last 5)
	const recentTransactions: RecentTransaction[] = currentResult.transactions
		.sort((a, b) => {
			// Sort by date descending (DD/MM/YYYY format)
			const [dayA, monthA, yearA] = a.date.split('/')
			const [dayB, monthB, yearB] = b.date.split('/')
			const dateA = `${yearA}-${monthA}-${dayA}`
			const dateB = `${yearB}-${monthB}-${dayB}`
			return dateB.localeCompare(dateA)
		})
		.slice(0, 5)
		.map((txn) => ({
			id: txn.id,
			description: txn.description,
			amount: txn.type === 'expense' ? -Math.abs(txn.amount) : txn.amount,
			date: txn.date,
			categoryName: txn.categoryName || 'Sem categoria',
			categoryColor: txn.categoryColor || '#6B7280',
			categoryIcon: txn.categoryIcon || 'folder',
		}))

	// Goals progress - empty for now (no goals API yet)
	const goalsProgress: GoalProgress[] = []

	// Alerts - empty for now (will be populated when goals are over limit)
	const alerts: DashboardAlert[] = []

	return {
		summary,
		categoryBreakdown,
		trendsData,
		recentTransactions,
		goalsProgress,
		alerts,
	}
}
