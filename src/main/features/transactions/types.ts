export type TransactionType = 'income' | 'expense'

export interface Transaction {
	id: string
	date: string // DD/MM/YYYY format
	description: string
	amount: number
	type: TransactionType
	categoryId: string
	categoryName: string
	categoryIcon: string
	categoryColor: string
	notes?: string
	createdAt: string
	updatedAt: string
}

export interface TransactionFilters {
	search: string
	startDate: string
	endDate: string
	categoryId: string
	type: TransactionType | 'all'
}

export interface TransactionFormData {
	date: string
	description: string
	amount: number
	type: TransactionType
	categoryId: string
	notes?: string
}

export interface DailyTransactions {
	date: string
	transactions: Transaction[]
	total: number
}

export interface TransactionSummary {
	income: number
	expense: number
	net: number
}
