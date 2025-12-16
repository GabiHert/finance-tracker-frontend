import { API_BASE, authenticatedFetch } from '@main/lib'
import type {
	CreditCardTransaction,
	BillMatch,
	ImportPreview,
	ImportResult,
	CollapseResult,
	CreditCardStatus,
	ConfirmedMatch,
} from '../types'

// API Response Types (snake_case from backend)
interface BillMatchApiResponse {
	bill_payment_id: string
	bill_payment_date: string
	bill_payment_amount: string
	bill_description: string
	cc_payment_date: string
	cc_payment_amount: string
	amount_difference: string
	days_difference: number
	match_score: number
}

interface ImportPreviewApiResponse {
	billing_cycle: string
	total_transactions: number
	total_amount: string
	potential_matches: BillMatchApiResponse[]
	transactions_to_import: {
		date: string
		description: string
		amount: number
		installment_current?: number
		installment_total?: number
	}[]
	payment_received_amount: string
	has_existing_import: boolean
}

interface ImportResultApiResponse {
	imported_count: number
	categorized_count: number
	bill_payment_id: string
	billing_cycle: string
	original_bill_amount: string
	imported_at: string
	transactions: {
		id: string
		date: string
		description: string
		amount: string
		category_id?: string
	}[]
}

interface CollapseResultApiResponse {
	bill_payment_id: string
	restored_amount: string
	deleted_transactions: number
	collapsed_at: string
}

interface CreditCardStatusApiResponse {
	billing_cycle: string
	is_expanded: boolean
	bill_payment_id?: string
	bill_payment_date?: string
	original_amount?: string
	current_amount?: string
	linked_transactions: number
	expanded_at?: string
	transactions_summary?: {
		id: string
		date: string
		description: string
		amount: string
		category_id?: string
		is_hidden: boolean
	}[]
}

// Transform functions
function transformBillMatch(apiMatch: BillMatchApiResponse): BillMatch {
	return {
		billTransactionId: apiMatch.bill_payment_id,
		billDate: apiMatch.bill_payment_date,
		billAmount: parseFloat(apiMatch.bill_payment_amount),
		ccTotal: parseFloat(apiMatch.cc_payment_amount),
		difference: parseFloat(apiMatch.amount_difference),
		matchedTransactionCount: 1, // Each match represents one bill
		paymentReceivedDate: apiMatch.cc_payment_date,
	}
}

function transformImportPreview(apiPreview: ImportPreviewApiResponse): ImportPreview {
	const potentialMatches = apiPreview.potential_matches || []
	const transactionsToImport = apiPreview.transactions_to_import || []

	// Calculate unmatched count - transactions to import that aren't the payment received
	const unmatchedCount = transactionsToImport.length - (potentialMatches.length > 0 ? 1 : 0)

	return {
		matches: potentialMatches.map(transformBillMatch),
		unmatchedTransactionCount: Math.max(0, unmatchedCount),
		totalCCAmount: parseFloat(apiPreview.total_amount || '0'),
		warnings: apiPreview.has_existing_import ? ['This billing cycle has already been imported'] : [],
	}
}

function transformImportResult(apiResult: ImportResultApiResponse): ImportResult {
	return {
		importedCount: apiResult.imported_count,
		matchedCount: 1, // One bill matched
		unmatchedCount: 0,
		zeroedBills: [{
			transactionId: apiResult.bill_payment_id,
			originalAmount: parseFloat(apiResult.original_bill_amount),
			linkedTransactions: apiResult.imported_count,
		}],
		warnings: [],
	}
}

function transformCollapseResult(apiResult: CollapseResultApiResponse): CollapseResult {
	return {
		restoredAmount: parseFloat(apiResult.restored_amount),
		deletedTransactions: apiResult.deleted_transactions,
		transactionId: apiResult.bill_payment_id,
	}
}

function transformCreditCardStatus(apiStatus: CreditCardStatusApiResponse): CreditCardStatus {
	const originalAmount = apiStatus.original_amount ? parseFloat(apiStatus.original_amount) : 0

	// Calculate total CC transactions amount from summary
	// Use algebraic sum (not absolute) so refunds subtract from total
	// Refunds have negative amounts, expenses have positive amounts
	const ccTransactionsTotal = (apiStatus.transactions_summary || []).reduce((sum, tx) => {
		return sum + parseFloat(tx.amount || '0')
	}, 0)

	// Determine if there are mismatches:
	// 1. If there are CC transactions but no bill linked (orphan transactions)
	// 2. If there are CC transactions linked to bill but amounts differ significantly
	const hasOrphanTransactions = !apiStatus.is_expanded &&
		apiStatus.linked_transactions > 0

	const hasAmountMismatch = apiStatus.is_expanded &&
		originalAmount > 0 &&
		ccTransactionsTotal > 0 &&
		Math.abs(originalAmount - ccTransactionsTotal) > 0.01

	const hasMismatches = hasOrphanTransactions || hasAmountMismatch

	// Calculate unmatched amount
	// - For orphan transactions, the entire CC total is unmatched
	// - For amount mismatch, it's the difference
	let unmatchedAmount = 0
	if (hasOrphanTransactions) {
		unmatchedAmount = ccTransactionsTotal
	} else if (hasAmountMismatch) {
		unmatchedAmount = Math.abs(ccTransactionsTotal - originalAmount)
	}

	// Debug logging
	console.log('[CC Status] API Response:', JSON.stringify(apiStatus, null, 2))
	console.log('[CC Status] originalAmount:', originalAmount)
	console.log('[CC Status] ccTransactionsTotal:', ccTransactionsTotal)
	console.log('[CC Status] is_expanded:', apiStatus.is_expanded)
	console.log('[CC Status] linked_transactions:', apiStatus.linked_transactions)
	console.log('[CC Status] hasOrphanTransactions:', hasOrphanTransactions)
	console.log('[CC Status] hasAmountMismatch:', hasAmountMismatch)
	console.log('[CC Status] hasMismatches:', hasMismatches)
	console.log('[CC Status] unmatchedAmount:', unmatchedAmount)

	return {
		totalSpending: apiStatus.is_expanded ? originalAmount : ccTransactionsTotal,
		matchedAmount: apiStatus.is_expanded ? ccTransactionsTotal : 0,
		unmatchedAmount,
		expandedBills: apiStatus.is_expanded ? 1 : 0,
		pendingBills: apiStatus.is_expanded ? 0 : (apiStatus.linked_transactions > 0 ? 1 : 0),
		hasMismatches,
	}
}

/**
 * Extract billing cycle from transactions.
 * Uses the "Pagamento recebido" date to determine the billing cycle.
 * Format: "YYYY-MM"
 */
function extractBillingCycle(transactions: CreditCardTransaction[]): string {
	// Find "Pagamento recebido" transaction
	const paymentReceived = transactions.find((tx) => tx.isPaymentReceived)

	if (paymentReceived) {
		// Use the date of "Pagamento recebido" for billing cycle
		// Format: "YYYY-MM-DD" -> "YYYY-MM"
		return paymentReceived.date.substring(0, 7)
	}

	// Fallback: use the most recent transaction date
	if (transactions.length > 0) {
		// Sort by date descending and take the first
		const sortedDates = transactions.map((tx) => tx.date).sort((a, b) => b.localeCompare(a))
		return sortedDates[0].substring(0, 7)
	}

	// Last resort: use current month
	const now = new Date()
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Transform frontend transaction to API format
function transformTransactionToApi(tx: CreditCardTransaction): Record<string, unknown> {
	// For "Pagamento recebido", always use absolute value as it's just a reference
	// For all other transactions (including refunds like "Estorno"), preserve the sign
	// Refunds have negative amounts and should be stored as such
	const amount = tx.isPaymentReceived
		? Math.abs(tx.amount) // Payment received is a reference amount, always positive
		: tx.amount // Preserve sign for refunds (negative) and expenses (positive)

	return {
		date: tx.date,
		description: tx.title, // Backend expects "description", not "title"
		amount,
		installment_current: tx.installmentCurrent,
		installment_total: tx.installmentTotal,
		is_payment_received: tx.isPaymentReceived,
	}
}

// API Functions

/**
 * Preview credit card import - analyze transactions and find potential bill matches
 */
export async function previewCreditCardImport(
	transactions: CreditCardTransaction[]
): Promise<ImportPreview> {
	const billingCycle = extractBillingCycle(transactions)

	const response = await authenticatedFetch(
		`${API_BASE}/transactions/credit-card/preview`,
		{
			method: 'POST',
			body: JSON.stringify({
				billing_cycle: billingCycle,
				transactions: transactions.map(transformTransactionToApi),
			}),
		}
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao analisar transacoes' }))
		throw new Error(error.error || 'Erro ao analisar transacoes do cartao')
	}

	const data = await response.json()
	return transformImportPreview(data.data || data)
}

/**
 * Import credit card transactions and link them to bill payments
 */
export async function importCreditCardTransactions(
	transactions: CreditCardTransaction[],
	confirmedMatches: ConfirmedMatch[],
	skipUnmatched: boolean = false
): Promise<ImportResult> {
	const billingCycle = extractBillingCycle(transactions)

	// Get the bill payment ID from the first confirmed match
	// The backend expects a single bill_payment_id, not an array
	const billPaymentId = confirmedMatches.length > 0 ? confirmedMatches[0].billTransactionId : ''

	// Filter out payment received transactions - only import actual purchases
	const transactionsToImport = transactions.filter(tx => !tx.isPaymentReceived)

	const response = await authenticatedFetch(
		`${API_BASE}/transactions/credit-card/import`,
		{
			method: 'POST',
			body: JSON.stringify({
				billing_cycle: billingCycle,
				bill_payment_id: billPaymentId,
				transactions: transactionsToImport.map(transformTransactionToApi),
				apply_auto_category: true,
			}),
		}
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao importar transacoes' }))

		// Handle specific error codes
		if (response.status === 409) {
			throw new Error('Esta fatura ja foi expandida anteriormente')
		}
		if (response.status === 422) {
			throw new Error(error.error || 'Fatura nao encontrada')
		}

		throw new Error(error.error || 'Erro ao importar transacoes do cartao')
	}

	const data = await response.json()
	return transformImportResult(data.data || data)
}

/**
 * Collapse credit card expansion - restore original bill and delete CC transactions
 */
export async function collapseCreditCardExpansion(
	billTransactionId: string
): Promise<CollapseResult> {
	const response = await authenticatedFetch(
		`${API_BASE}/transactions/credit-card/collapse`,
		{
			method: 'POST',
			body: JSON.stringify({
				bill_payment_id: billTransactionId,
			}),
		}
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao reverter expansao' }))

		if (response.status === 404) {
			throw new Error('Fatura nao encontrada')
		}
		if (response.status === 422) {
			throw new Error('Esta fatura nao foi expandida')
		}

		throw new Error(error.error || 'Erro ao reverter expansao do cartao')
	}

	const data = await response.json()
	return transformCollapseResult(data.data || data)
}

/**
 * Get credit card status for a billing cycle (month)
 */
export async function getCreditCardStatus(month?: string): Promise<CreditCardStatus> {
	const queryParams = new URLSearchParams()
	if (month) {
		queryParams.set('month', month)
	}

	const queryString = queryParams.toString()
	const url = `${API_BASE}/transactions/credit-card/status${queryString ? `?${queryString}` : ''}`

	const response = await authenticatedFetch(url, { method: 'GET' })

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao carregar status' }))
		throw new Error(error.error || 'Erro ao carregar status do cartao')
	}

	const data = await response.json()
	return transformCreditCardStatus(data.data || data)
}
