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
	bill_transaction_id: string
	bill_date: string
	bill_amount: string
	cc_total: string
	difference: string
	matched_transaction_count: number
	payment_received_date?: string
}

interface ImportPreviewApiResponse {
	matches: BillMatchApiResponse[]
	unmatched_transactions: number
	total_cc_amount: string
	warnings: string[]
}

interface ZeroedBillApiResponse {
	transaction_id: string
	original_amount: string
	linked_transactions: number
}

interface ImportResultApiResponse {
	imported_count: number
	matched_count: number
	unmatched_count: number
	zeroed_bills: ZeroedBillApiResponse[]
	warnings: string[]
}

interface CollapseResultApiResponse {
	restored_amount: string
	deleted_transactions: number
	transaction_id: string
}

interface CreditCardStatusApiResponse {
	total_spending: string
	matched_amount: string
	unmatched_amount: string
	expanded_bills: number
	pending_bills: number
	has_mismatches: boolean
}

// Transform functions
function transformBillMatch(apiMatch: BillMatchApiResponse): BillMatch {
	return {
		billTransactionId: apiMatch.bill_transaction_id,
		billDate: apiMatch.bill_date,
		billAmount: parseFloat(apiMatch.bill_amount),
		ccTotal: parseFloat(apiMatch.cc_total),
		difference: parseFloat(apiMatch.difference),
		matchedTransactionCount: apiMatch.matched_transaction_count,
		paymentReceivedDate: apiMatch.payment_received_date,
	}
}

function transformImportPreview(apiPreview: ImportPreviewApiResponse): ImportPreview {
	return {
		matches: apiPreview.matches.map(transformBillMatch),
		unmatchedTransactionCount: apiPreview.unmatched_transactions,
		totalCCAmount: parseFloat(apiPreview.total_cc_amount),
		warnings: apiPreview.warnings || [],
	}
}

function transformImportResult(apiResult: ImportResultApiResponse): ImportResult {
	return {
		importedCount: apiResult.imported_count,
		matchedCount: apiResult.matched_count,
		unmatchedCount: apiResult.unmatched_count,
		zeroedBills: apiResult.zeroed_bills.map((bill) => ({
			transactionId: bill.transaction_id,
			originalAmount: parseFloat(bill.original_amount),
			linkedTransactions: bill.linked_transactions,
		})),
		warnings: apiResult.warnings || [],
	}
}

function transformCollapseResult(apiResult: CollapseResultApiResponse): CollapseResult {
	return {
		restoredAmount: parseFloat(apiResult.restored_amount),
		deletedTransactions: apiResult.deleted_transactions,
		transactionId: apiResult.transaction_id,
	}
}

function transformCreditCardStatus(apiStatus: CreditCardStatusApiResponse): CreditCardStatus {
	return {
		totalSpending: parseFloat(apiStatus.total_spending),
		matchedAmount: parseFloat(apiStatus.matched_amount),
		unmatchedAmount: parseFloat(apiStatus.unmatched_amount),
		expandedBills: apiStatus.expanded_bills,
		pendingBills: apiStatus.pending_bills,
		hasMismatches: apiStatus.has_mismatches,
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
	return {
		date: tx.date,
		description: tx.title, // Backend expects "description", not "title"
		amount: Math.abs(tx.amount),
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

	const response = await authenticatedFetch(
		`${API_BASE}/transactions/credit-card/import`,
		{
			method: 'POST',
			body: JSON.stringify({
				billing_cycle: billingCycle,
				transactions: transactions.map(transformTransactionToApi),
				confirmed_matches: confirmedMatches.map((match) => ({
					bill_transaction_id: match.billTransactionId,
					payment_received_date: match.paymentReceivedDate,
				})),
				skip_unmatched: skipUnmatched,
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
				bill_transaction_id: billTransactionId,
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
