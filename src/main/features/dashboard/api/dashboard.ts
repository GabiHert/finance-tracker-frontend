import { fetchTransactions, type FetchTransactionsResult } from '@main/features/transactions/api/transactions'
import { fetchGoals } from '@main/features/goals/api/goals'
import type {
	DashboardSummary,
	CategoryBreakdown,
	TrendDataPoint,
	RecentTransaction,
	GoalProgress,
	DashboardAlert,
	Period,
} from '../types'
import { apiGet } from '@main/lib/api-client'

export interface CustomDateRange {
	startDate: string // YYYY-MM-DD format
	endDate: string // YYYY-MM-DD format
}

export interface DataRangeResponse {
	oldest_date: string | null
	newest_date: string | null
	total_transactions: number
	has_data: boolean
}

/**
 * Fetch data range from the dashboard API
 * Returns the oldest and newest transaction dates and whether user has data
 */
export async function fetchDataRange(): Promise<DataRangeResponse> {
	const response = await apiGet<{ data: DataRangeResponse }>('/api/v1/dashboard/data-range')
	return response.data
}

/**
 * Fetch trends data from the dashboard API for a given period
 * Used when navigating to trigger server-side validation
 */
export async function fetchDashboardTrends(startDate: string, endDate: string, granularity?: string): Promise<TrendDataPoint[]> {
	const params = new URLSearchParams({
		start_date: startDate,
		end_date: endDate,
	})
	if (granularity) {
		params.append('granularity', granularity)
	}
	const response = await apiGet<{ data: TrendDataPoint[] }>(`/api/v1/dashboard/trends?${params.toString()}`)
	return response.data
}

export interface FetchDashboardOptions {
	period: Period
	customDateRange?: CustomDateRange
}

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
 * Calculate previous period range for custom date range
 */
function getCustomPreviousPeriodRange(startDate: string, endDate: string): { startDate: string; endDate: string } {
	const start = new Date(startDate)
	const end = new Date(endDate)

	// Calculate duration in days (inclusive)
	const durationMs = end.getTime() - start.getTime()

	// Previous period ends the day before the current period starts
	const prevEnd = new Date(start.getTime() - 86400000) // day before start
	const prevStart = new Date(prevEnd.getTime() - durationMs)

	const formatDate = (d: Date) => d.toISOString().split('T')[0]
	return {
		startDate: formatDate(prevStart),
		endDate: formatDate(prevEnd),
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

export interface HistoricalTrendsData {
	trendsData: TrendDataPoint[]
	startDate: Date
	endDate: Date
}

/**
 * Fetch historical trends data for the past 18 months
 * Used by InteractiveTrendsChart for scrollable navigation
 */
export async function fetchHistoricalTrends(): Promise<HistoricalTrendsData> {
	const today = new Date()
	const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
	const startDate = new Date(today.getFullYear() - 1, today.getMonth() - 5, 1)

	const formatDate = (d: Date) => d.toISOString().split('T')[0]

	const result = await fetchTransactions({
		startDate: formatDate(startDate),
		endDate: formatDate(endDate),
		limit: 5000,
	})

	const trendsMap = new Map<string, { income: number; expenses: number }>()

	for (const txn of result.transactions) {
		if (!txn.date) continue
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

	// Sort by date first, then calculate cumulative balance
	const sortedEntries = Array.from(trendsMap.entries())
		.map(([date, values]) => ({
			date,
			income: values.income,
			expenses: values.expenses,
		}))
		.sort((a, b) => a.date.localeCompare(b.date))

	// Calculate cumulative balance
	let runningBalance = 0
	const trendsData: TrendDataPoint[] = sortedEntries.map(point => {
		runningBalance += point.income - point.expenses
		return {
			...point,
			cumulativeBalance: runningBalance,
		}
	})

	return {
		trendsData,
		startDate,
		endDate,
	}
}

/**
 * Fetch all dashboard data from the transactions API
 */
export async function fetchDashboardData(options: FetchDashboardOptions | Period): Promise<DashboardData> {
	// Support both old signature (period only) and new signature (options object)
	let period: Period
	let customDateRange: CustomDateRange | undefined

	if (typeof options === 'string') {
		period = options
	} else {
		period = options.period
		customDateRange = options.customDateRange
	}

	let startDate: string
	let endDate: string
	let previousPeriod: { startDate: string; endDate: string }

	// Use custom date range if provided and period is 'custom'
	if (period === 'custom' && customDateRange) {
		startDate = customDateRange.startDate
		endDate = customDateRange.endDate
		previousPeriod = getCustomPreviousPeriodRange(startDate, endDate)
	} else {
		const dateRange = getDateRangeForPeriod(period)
		startDate = dateRange.startDate
		endDate = dateRange.endDate
		previousPeriod = getPreviousPeriodRange(period)
	}

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
		if (!txn.date) continue
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

	// Sort by date first, then calculate cumulative balance
	const sortedTrends = Array.from(trendsMap.entries())
		.map(([date, values]) => ({
			date,
			income: values.income,
			expenses: values.expenses,
		}))
		.sort((a, b) => a.date.localeCompare(b.date))

	// Calculate cumulative balance
	let runningBalance = 0
	const trendsData: TrendDataPoint[] = sortedTrends.map(point => {
		runningBalance += point.income - point.expenses
		return {
			...point,
			cumulativeBalance: runningBalance,
		}
	})

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

	// Goals progress - fetch from goals API
	let goalsProgress: GoalProgress[] = []
	const alerts: DashboardAlert[] = []

	try {
		const goals = await fetchGoals()
		goalsProgress = goals.map((goal) => {
			const percentage = goal.limitAmount > 0 ? (goal.currentAmount / goal.limitAmount) * 100 : 0
			return {
				id: goal.id,
				categoryId: goal.categoryId,
				categoryName: goal.categoryName,
				categoryColor: goal.categoryColor,
				categoryIcon: goal.categoryIcon,
				limitAmount: goal.limitAmount,
				currentAmount: goal.currentAmount,
				percentage: Math.min(percentage, 100),
			}
		})

		// Generate alerts for goals over limit or approaching limit (80%+)
		for (const goal of goals) {
			const percentage = goal.limitAmount > 0 ? (goal.currentAmount / goal.limitAmount) * 100 : 0

			if (percentage >= 100) {
				// Over limit alert
				alerts.push({
					id: `alert-${goal.id}`,
					type: 'goal_exceeded',
					severity: 'danger',
					message: `Limite excedido em ${goal.categoryName}: R$ ${goal.currentAmount.toFixed(2)} de R$ ${goal.limitAmount.toFixed(2)}`,
					goalId: goal.id,
					categoryId: goal.categoryId,
				})
			} else if (percentage >= 80) {
				// Warning alert (approaching limit)
				alerts.push({
					id: `alert-${goal.id}`,
					type: 'goal_warning',
					severity: 'warning',
					message: `Aproximando do limite em ${goal.categoryName}: ${percentage.toFixed(0)}% utilizado`,
					goalId: goal.id,
					categoryId: goal.categoryId,
				})
			}
		}
	} catch (error) {
		console.error('Error fetching goals for dashboard:', error)
	}

	return {
		summary,
		categoryBreakdown,
		trendsData,
		recentTransactions,
		goalsProgress,
		alerts,
	}
}
