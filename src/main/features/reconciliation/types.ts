// Reconciliation Types for M15-smart-reconciliation

// Confidence level for bill matches
export type Confidence = 'high' | 'medium' | 'low'

// Potential bill match for a billing cycle
export interface PotentialMatch {
	billId: string
	billDate: string // DD/MM/YYYY format for display
	billDescription: string
	billAmount: number
	categoryName?: string
	confidence: Confidence
	amountDifference: number // CC total - Bill amount (negative if bill > CC)
	amountDifferencePercent: number
	score: number // For ranking (0-1.0)
}

// Pending billing cycle with unlinked CC transactions
export interface PendingCycle {
	billingCycle: string // "YYYY-MM" format
	displayName: string // "Nov/2024" format
	transactionCount: number
	totalAmount: number
	oldestDate: string // DD/MM/YYYY
	newestDate: string // DD/MM/YYYY
	potentialBills: PotentialMatch[]
}

// Linked billing cycle with bill payment
export interface LinkedCycle {
	billingCycle: string
	displayName: string
	transactionCount: number
	totalAmount: number
	bill: LinkedBill
	amountDifference: number
	hasMismatch: boolean
}

// Linked bill payment details
export interface LinkedBill {
	id: string
	date: string // DD/MM/YYYY
	description: string
	originalAmount: number
	categoryName?: string
}

// Reconciliation summary statistics
export interface ReconciliationSummary {
	totalPending: number
	totalLinked: number
	monthsCovered: number
}

// Result from triggering auto-reconciliation
export interface ReconciliationResult {
	autoLinked: AutoLinkedCycle[]
	requiresSelection: PendingWithMatches[]
	noMatch: NoMatchCycle[]
	summary: ReconciliationResultSummary
}

// Auto-linked billing cycle
export interface AutoLinkedCycle {
	billingCycle: string
	billId: string
	billDescription: string
	transactionCount: number
	confidence: Confidence
	amountDifference: number
}

// Pending cycle with multiple potential matches
export interface PendingWithMatches {
	billingCycle: string
	potentialBills: PotentialMatch[]
}

// Billing cycle with no matching bills
export interface NoMatchCycle {
	billingCycle: string
	transactionCount: number
	totalAmount: number
}

// Summary from reconciliation operation
export interface ReconciliationResultSummary {
	autoLinked: number
	requiresSelection: number
	noMatch: number
}

// Result from manual linking
export interface LinkResult {
	billingCycle: string
	billId: string
	transactionsLinked: number
	amountDifference: number
	hasMismatch: boolean
}

// List response with pagination
export interface PendingCyclesResponse {
	cycles: PendingCycle[]
	summary: ReconciliationSummary
}

export interface LinkedCyclesResponse {
	cycles: LinkedCycle[]
	summary: ReconciliationSummary
}

// Request types
export interface LinkRequest {
	billingCycle: string
	billId: string
	force?: boolean // Force link even if amount mismatch exceeds tolerance
}

export interface UnlinkRequest {
	billingCycle: string
}
