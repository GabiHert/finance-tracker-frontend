import { API_BASE, authenticatedFetch } from '@main/lib'
import type {
	PendingCycle,
	LinkedCycle,
	PotentialMatch,
	ReconciliationSummary,
	ReconciliationResult,
	LinkResult,
	PendingCyclesResponse,
	LinkedCyclesResponse,
	Confidence,
} from '../types'

// API Response Types (snake_case from backend)

interface PotentialMatchApiResponse {
	bill_id: string
	bill_date: string // YYYY-MM-DD
	bill_description: string
	bill_amount: string
	category_name?: string
	confidence: string
	amount_difference: string
	amount_difference_percent: string
	score: number
}

interface PendingCycleApiResponse {
	billing_cycle: string
	display_name: string
	transaction_count: number
	total_amount: string
	oldest_date: string // YYYY-MM-DD
	newest_date: string // YYYY-MM-DD
	potential_bills: PotentialMatchApiResponse[]
}

interface LinkedBillApiResponse {
	id: string
	date: string
	description: string
	original_amount: string
	category_name?: string
}

interface LinkedCycleApiResponse {
	billing_cycle: string
	display_name: string
	transaction_count: number
	total_amount: string
	bill: LinkedBillApiResponse
	amount_difference: string
	has_mismatch: boolean
}

interface ReconciliationSummaryApiResponse {
	total_pending: number
	total_linked: number
	months_covered: number
}

interface PendingCyclesApiResponse {
	pending_cycles: PendingCycleApiResponse[]
	summary: ReconciliationSummaryApiResponse
}

interface LinkedCyclesApiResponse {
	linked_cycles: LinkedCycleApiResponse[]
	summary: ReconciliationSummaryApiResponse
}

interface AutoLinkedCycleApiResponse {
	billing_cycle: string
	bill_id: string
	bill_description: string
	transaction_count: number
	confidence: string
	amount_difference: string
}

interface PendingWithMatchesApiResponse {
	billing_cycle: string
	potential_bills: PotentialMatchApiResponse[]
}

interface NoMatchCycleApiResponse {
	billing_cycle: string
	transaction_count: number
	total_amount: string
}

interface ReconciliationResultSummaryApiResponse {
	auto_linked: number
	requires_selection: number
	no_match: number
}

interface ReconciliationResultApiResponse {
	auto_linked: AutoLinkedCycleApiResponse[]
	requires_selection: PendingWithMatchesApiResponse[]
	no_match: NoMatchCycleApiResponse[]
	summary: ReconciliationResultSummaryApiResponse
}

interface LinkResultApiResponse {
	billing_cycle: string
	bill_payment_id: string
	transactions_linked: number
	amount_difference: string
	has_mismatch: boolean
}

// Transform functions

function formatDateForDisplay(dateStr: string): string {
	if (!dateStr || dateStr.length < 10) return dateStr
	const [year, month, day] = dateStr.split('-')
	return `${day}/${month}/${year}`
}

function transformConfidence(confidence: string): Confidence {
	if (confidence === 'high' || confidence === 'medium' || confidence === 'low') {
		return confidence
	}
	return 'low'
}

function transformPotentialMatch(api: PotentialMatchApiResponse): PotentialMatch {
	return {
		billId: api.bill_id,
		billDate: formatDateForDisplay(api.bill_date),
		billDescription: api.bill_description,
		billAmount: parseFloat(api.bill_amount),
		categoryName: api.category_name || undefined,
		confidence: transformConfidence(api.confidence),
		amountDifference: parseFloat(api.amount_difference),
		amountDifferencePercent: parseFloat(api.amount_difference_percent),
		score: api.score,
	}
}

function transformPendingCycle(api: PendingCycleApiResponse): PendingCycle {
	return {
		billingCycle: api.billing_cycle,
		displayName: api.display_name,
		transactionCount: api.transaction_count,
		totalAmount: parseFloat(api.total_amount),
		oldestDate: formatDateForDisplay(api.oldest_date),
		newestDate: formatDateForDisplay(api.newest_date),
		potentialBills: (api.potential_bills || []).map(transformPotentialMatch),
	}
}

function transformLinkedCycle(api: LinkedCycleApiResponse): LinkedCycle {
	return {
		billingCycle: api.billing_cycle,
		displayName: api.display_name,
		transactionCount: api.transaction_count,
		totalAmount: parseFloat(api.total_amount),
		bill: {
			id: api.bill.id,
			date: formatDateForDisplay(api.bill.date),
			description: api.bill.description,
			originalAmount: parseFloat(api.bill.original_amount),
			categoryName: api.bill.category_name || undefined,
		},
		amountDifference: parseFloat(api.amount_difference),
		hasMismatch: api.has_mismatch,
	}
}

function transformSummary(api: ReconciliationSummaryApiResponse): ReconciliationSummary {
	return {
		totalPending: api.total_pending,
		totalLinked: api.total_linked,
		monthsCovered: api.months_covered,
	}
}

function transformReconciliationResult(api: ReconciliationResultApiResponse): ReconciliationResult {
	return {
		autoLinked: (api.auto_linked || []).map((item) => ({
			billingCycle: item.billing_cycle,
			billId: item.bill_id,
			billDescription: item.bill_description,
			transactionCount: item.transaction_count,
			confidence: transformConfidence(item.confidence),
			amountDifference: parseFloat(item.amount_difference),
		})),
		requiresSelection: (api.requires_selection || []).map((item) => ({
			billingCycle: item.billing_cycle,
			potentialBills: (item.potential_bills || []).map(transformPotentialMatch),
		})),
		noMatch: (api.no_match || []).map((item) => ({
			billingCycle: item.billing_cycle,
			transactionCount: item.transaction_count,
			totalAmount: parseFloat(item.total_amount),
		})),
		summary: {
			autoLinked: api.summary.auto_linked,
			requiresSelection: api.summary.requires_selection,
			noMatch: api.summary.no_match,
		},
	}
}

function transformLinkResult(api: LinkResultApiResponse): LinkResult {
	return {
		billingCycle: api.billing_cycle,
		billId: api.bill_payment_id,
		transactionsLinked: api.transactions_linked,
		amountDifference: parseFloat(api.amount_difference),
		hasMismatch: api.has_mismatch,
	}
}

// API Functions

const RECONCILIATION_BASE = `${API_BASE}/transactions/credit-card/reconciliation`

/**
 * Get pending billing cycles with unlinked CC transactions
 */
export async function fetchPendingCycles(
	limit: number = 10,
	offset: number = 0
): Promise<PendingCyclesResponse> {
	const params = new URLSearchParams()
	params.set('limit', limit.toString())
	params.set('offset', offset.toString())

	const response = await authenticatedFetch(
		`${RECONCILIATION_BASE}/pending?${params.toString()}`,
		{ method: 'GET' }
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao carregar ciclos pendentes' }))
		throw new Error(error.error || 'Erro ao carregar ciclos pendentes')
	}

	const data: PendingCyclesApiResponse = await response.json()
	return {
		cycles: (data.pending_cycles || []).map(transformPendingCycle),
		summary: transformSummary(data.summary),
	}
}

/**
 * Get linked billing cycles with their bill payments
 */
export async function fetchLinkedCycles(
	limit: number = 10,
	offset: number = 0
): Promise<LinkedCyclesResponse> {
	const params = new URLSearchParams()
	params.set('limit', limit.toString())
	params.set('offset', offset.toString())

	const response = await authenticatedFetch(
		`${RECONCILIATION_BASE}/linked?${params.toString()}`,
		{ method: 'GET' }
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao carregar ciclos vinculados' }))
		throw new Error(error.error || 'Erro ao carregar ciclos vinculados')
	}

	const data: LinkedCyclesApiResponse = await response.json()
	return {
		cycles: (data.linked_cycles || []).map(transformLinkedCycle),
		summary: transformSummary(data.summary),
	}
}

/**
 * Get reconciliation summary statistics
 */
export async function fetchReconciliationSummary(): Promise<ReconciliationSummary> {
	const response = await authenticatedFetch(
		`${RECONCILIATION_BASE}/summary`,
		{ method: 'GET' }
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao carregar resumo' }))
		throw new Error(error.error || 'Erro ao carregar resumo de reconciliação')
	}

	const data: ReconciliationSummaryApiResponse = await response.json()
	return transformSummary(data)
}

/**
 * Manually link a billing cycle to a bill payment
 */
export async function linkCycleToBill(
	billingCycle: string,
	billId: string,
	force: boolean = false
): Promise<LinkResult> {
	const response = await authenticatedFetch(
		`${RECONCILIATION_BASE}/link`,
		{
			method: 'POST',
			body: JSON.stringify({
				billing_cycle: billingCycle,
				bill_payment_id: billId,
				force,
			}),
		}
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao vincular' }))

		if (response.status === 404) {
			throw new Error('Ciclo de faturamento ou fatura não encontrada')
		}
		if (response.status === 409) {
			throw new Error('Este ciclo já está vinculado a uma fatura')
		}
		if (response.status === 422) {
			throw new Error(error.error || 'Diferença de valor acima da tolerância')
		}

		throw new Error(error.error || 'Erro ao vincular ciclo à fatura')
	}

	const data: LinkResultApiResponse = await response.json()
	return transformLinkResult(data)
}

/**
 * Unlink a billing cycle from its bill payment
 */
export async function unlinkCycle(billingCycle: string): Promise<void> {
	const response = await authenticatedFetch(
		`${RECONCILIATION_BASE}/unlink`,
		{
			method: 'POST',
			body: JSON.stringify({
				billing_cycle: billingCycle,
			}),
		}
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao desvincular' }))

		if (response.status === 404) {
			throw new Error('Ciclo de faturamento não encontrado')
		}

		throw new Error(error.error || 'Erro ao desvincular ciclo')
	}
}

/**
 * Trigger on-demand reconciliation
 * Returns cycles that were auto-linked, need selection, or have no match
 */
export async function triggerReconciliation(): Promise<ReconciliationResult> {
	const response = await authenticatedFetch(
		`${RECONCILIATION_BASE}/trigger`,
		{ method: 'POST' }
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao reconciliar' }))
		throw new Error(error.error || 'Erro ao executar reconciliação')
	}

	const data: ReconciliationResultApiResponse = await response.json()
	return transformReconciliationResult(data)
}
