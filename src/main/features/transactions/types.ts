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
	// Credit card import fields
	billingCycle?: string // "YYYY-MM" format if imported from CC statement
	creditCardPaymentId?: string // ID of linked bill payment, undefined if pending
	isExpandedBill?: boolean // True if this is a bill payment that has been expanded
	linkedTransactionCount?: number // Number of CC transactions linked to this bill
	installmentCurrent?: number // Current installment number
	installmentTotal?: number // Total installments
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
