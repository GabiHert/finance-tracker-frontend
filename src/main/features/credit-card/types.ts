// Credit Card Import Types

export interface CreditCardTransaction {
	date: string // YYYY-MM-DD
	title: string
	amount: number // positive = expense
	installmentCurrent?: number
	installmentTotal?: number
	isPaymentReceived: boolean
}

export interface BillMatch {
	billTransactionId: string
	billDate: string // YYYY-MM-DD
	billAmount: number
	ccTotal: number
	difference: number
	matchedTransactionCount: number
	paymentReceivedDate?: string
}

export interface ImportPreview {
	matches: BillMatch[]
	unmatchedTransactionCount: number
	totalCCAmount: number
	warnings: string[]
}

export interface ConfirmedMatch {
	billTransactionId: string
	paymentReceivedDate: string
}

export interface ZeroedBill {
	transactionId: string
	originalAmount: number
	linkedTransactions: number
}

export interface ImportResult {
	importedCount: number
	matchedCount: number
	unmatchedCount: number
	zeroedBills: ZeroedBill[]
	warnings: string[]
}

export interface CollapseResult {
	restoredAmount: number
	deletedTransactions: number
	transactionId: string
}

export interface CreditCardStatus {
	totalSpending: number
	matchedAmount: number
	unmatchedAmount: number
	expandedBills: number
	pendingBills: number
	hasMismatches: boolean
}

// Extended Transaction with CC fields
export interface TransactionWithCC {
	id: string
	date: string // DD/MM/YYYY
	description: string
	amount: number
	type: 'income' | 'expense'
	categoryId: string
	categoryName: string
	categoryIcon: string
	categoryColor: string
	notes?: string
	createdAt: string
	updatedAt: string
	// CC fields
	creditCardPaymentId?: string
	billingCycle?: string
	originalAmount?: number
	isCreditCardPayment?: boolean
	expandedAt?: string
	installmentCurrent?: number
	installmentTotal?: number
	isHidden?: boolean
	linkedTransactionCount?: number
}

// CSV parsing types
export interface ParsedCCLine {
	date: Date
	title: string
	amount: number
	installmentCurrent?: number
	installmentTotal?: number
	isPaymentReceived: boolean
}
