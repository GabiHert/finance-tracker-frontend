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
	type: 'goal_over_limit' | 'recurring_expense' | 'unusual_spending'
	message: string
	goalId?: string
	severity: 'warning' | 'danger' | 'info'
}

export type Period = 'this_month' | 'last_month' | 'this_week' | 'last_week' | 'custom'

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(Math.abs(value))
}

export function formatPercentage(value: number): string {
	const sign = value >= 0 ? '+' : ''
	return `${sign}${value.toFixed(1)}%`
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString)
	return new Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		month: 'short',
	}).format(date)
}
