import type {
	DashboardSummary,
	CategoryBreakdown,
	TrendDataPoint,
	RecentTransaction,
	GoalProgress,
	DashboardAlert,
} from './types'

export const mockSummary: DashboardSummary = {
	totalBalance: 15270.5,
	totalIncome: 8500,
	totalExpenses: 6230,
	netSavings: 2270,
	incomeChange: 5.2,
	expensesChange: -3.1,
	savingsChange: 12.5,
}

export const mockCategoryBreakdown: CategoryBreakdown[] = [
	{
		categoryId: 'cat-1',
		categoryName: 'Alimentacao',
		categoryColor: '#F59E0B',
		amount: 1500,
		percentage: 24.1,
	},
	{
		categoryId: 'cat-2',
		categoryName: 'Transporte',
		categoryColor: '#3B82F6',
		amount: 800,
		percentage: 12.8,
	},
	{
		categoryId: 'cat-3',
		categoryName: 'Moradia',
		categoryColor: '#8B5CF6',
		amount: 2500,
		percentage: 40.1,
	},
	{
		categoryId: 'cat-4',
		categoryName: 'Lazer',
		categoryColor: '#10B981',
		amount: 430,
		percentage: 6.9,
	},
	{
		categoryId: 'cat-5',
		categoryName: 'Outros',
		categoryColor: '#6B7280',
		amount: 1000,
		percentage: 16.1,
	},
]

export const mockTrendsData: TrendDataPoint[] = [
	{ date: '2025-09-01', income: 8000, expenses: 5800, cumulativeBalance: 2200 },
	{ date: '2025-10-01', income: 8200, expenses: 6100, cumulativeBalance: 4300 },
	{ date: '2025-11-01', income: 8500, expenses: 6230, cumulativeBalance: 6570 },
]

export const mockRecentTransactions: RecentTransaction[] = [
	{
		id: 'tx-1',
		description: 'Supermercado Extra',
		amount: -245.5,
		date: '2025-11-28',
		categoryName: 'Alimentacao',
		categoryColor: '#F59E0B',
		categoryIcon: 'utensils',
	},
	{
		id: 'tx-2',
		description: 'Uber',
		amount: -32.9,
		date: '2025-11-28',
		categoryName: 'Transporte',
		categoryColor: '#3B82F6',
		categoryIcon: 'car',
	},
	{
		id: 'tx-3',
		description: 'Aluguel',
		amount: -2500,
		date: '2025-11-27',
		categoryName: 'Moradia',
		categoryColor: '#8B5CF6',
		categoryIcon: 'home',
	},
	{
		id: 'tx-4',
		description: 'Salario',
		amount: 8500,
		date: '2025-11-25',
		categoryName: 'Salario',
		categoryColor: '#10B981',
		categoryIcon: 'wallet',
	},
	{
		id: 'tx-5',
		description: 'Netflix',
		amount: -55.9,
		date: '2025-11-20',
		categoryName: 'Lazer',
		categoryColor: '#10B981',
		categoryIcon: 'tv',
	},
]

export const mockGoalsProgress: GoalProgress[] = [
	{
		id: 'goal-1',
		categoryId: 'cat-1',
		categoryName: 'Alimentacao',
		categoryColor: '#F59E0B',
		currentAmount: 1500,
		limitAmount: 2000,
		percentage: 75,
		isOverLimit: false,
	},
	{
		id: 'goal-2',
		categoryId: 'cat-4',
		categoryName: 'Lazer',
		categoryColor: '#10B981',
		currentAmount: 650,
		limitAmount: 500,
		percentage: 130,
		isOverLimit: true,
	},
]

export const mockAlerts: DashboardAlert[] = [
	{
		id: 'alert-1',
		type: 'goal_over_limit',
		message: 'Limite de Lazer excedido em R$ 150,00',
		goalId: 'goal-2',
		severity: 'danger',
	},
]
