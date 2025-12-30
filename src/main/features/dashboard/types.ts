export interface DashboardSummary {
	totalBalance: number
	totalIncome: number
	totalExpenses: number
	netSavings: number
	incomeChange?: number
	expensesChange?: number
	savingsChange?: number
}

export interface CategoryBreakdown {
	categoryId: string
	categoryName: string
	categoryColor: string
	amount: number
	percentage: number
}

export interface TrendDataPoint {
	date: string
	income: number
	expenses: number
	cumulativeBalance: number
}

export interface RecentTransaction {
	id: string
	description: string
	amount: number
	date: string
	categoryName: string
	categoryColor: string
	categoryIcon: string
}

export interface GoalProgress {
	id: string
	categoryId: string
	categoryName: string
	categoryColor: string
	currentAmount: number
	limitAmount: number
	percentage: number
	isOverLimit: boolean
}

export interface DashboardAlert {
	id: string
	type: 'goal_over_limit' | 'recurring_expense' | 'unusual_spending' | 'goal_exceeded' | 'goal_warning'
	message: string
	goalId?: string
	categoryId?: string
	severity: 'warning' | 'danger' | 'info'
}

export type Period = 'this_month' | 'last_month' | 'this_week' | 'last_week' | 'custom'

export type Granularity = 'daily' | 'weekly' | 'monthly'

// Category Trends Types
export interface CategoryTrendInfo {
	id: string
	name: string
	color: string
	totalAmount: number
	isOthers: boolean
}

export interface CategoryTrendAmount {
	categoryId: string
	amount: number
}

export interface CategoryTrendDataPoint {
	date: string
	periodLabel: string
	amounts: CategoryTrendAmount[]
}

export interface CategoryTrendsData {
	period: {
		startDate: string
		endDate: string
		granularity: Granularity
	}
	categories: CategoryTrendInfo[]
	trends: CategoryTrendDataPoint[]
}

export function formatCurrency(value: number, useAbsoluteValue = false): string {
	const numericValue = useAbsoluteValue ? Math.abs(value) : value
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(numericValue)
}

export function formatPercentage(value: number): string {
	const sign = value >= 0 ? '+' : ''
	return `${sign}${value.toFixed(1)}%`
}

export function formatDate(dateString: string): string {
	let date: Date

	// Handle DD/MM/YYYY format (Brazilian date format)
	if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
		const [day, month, year] = dateString.split('/')
		date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
	} else {
		// Handle YYYY-MM-DD format (ISO format)
		date = new Date(dateString)
	}

	// Check for invalid date
	if (isNaN(date.getTime())) {
		return dateString // Return original string if parsing fails
	}

	return new Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		month: 'short',
	}).format(date)
}
