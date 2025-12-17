import { API_BASE, authenticatedFetch } from '@main/lib'
import type {
	CategorizationStatus,
	StartCategorizationResponse,
	SuggestionsResponse,
	ApprovalResult,
	RejectResult,
	ClearResult,
	AISuggestion,
	EditSuggestionInput,
	RejectAction,
	AffectedTransaction,
	SkippedTransaction,
	AIProcessingError,
} from '../types'

// API Response types (snake_case from backend)
interface ErrorApiResponse {
	code: string
	message: string
	retryable: boolean
	timestamp: string
}

interface StatusApiResponse {
	uncategorized_count: number
	is_processing: boolean
	pending_suggestions_count: number
	skipped_count: number
	last_processed_at: string | null
	has_error: boolean
	error: ErrorApiResponse | null
}

interface StartApiResponse {
	job_id: string
	status: string
	message: string
}

interface AffectedTransactionApi {
	id: string
	description: string
	amount: number
	date: string
}

interface SuggestionApiResponse {
	id: string
	category: {
		type: 'existing' | 'new'
		existing_id?: string
		existing_name?: string
		existing_icon?: string
		existing_color?: string
		new_name?: string
		new_icon?: string
		new_color?: string
	}
	match: {
		type: 'contains' | 'startsWith' | 'exact'
		keyword: string
	}
	affected_transactions: AffectedTransactionApi[]
	affected_count: number
	status: string
	created_at: string
}

interface SkippedTransactionApi {
	id: string
	description: string
	amount: number
	date: string
	skip_reason: string
}

interface SuggestionsApiResponse {
	suggestions: SuggestionApiResponse[]
	skipped_transactions: SkippedTransactionApi[]
	total_pending: number
	total_skipped: number
}

interface ApprovalApiResponse {
	suggestion_id: string
	category_id: string
	category_name: string
	rule_id: string
	transactions_categorized: number
	is_new_category: boolean
}

interface RejectApiResponse {
	suggestion_id: string
	action: 'skip' | 'retry'
	new_suggestion?: SuggestionApiResponse
	message: string
}

interface ClearApiResponse {
	deleted_count: number
}

// Transform functions
function transformAffectedTransaction(api: AffectedTransactionApi): AffectedTransaction {
	return {
		id: api.id,
		description: api.description,
		amount: api.amount,
		date: api.date,
	}
}

function transformSuggestion(api: SuggestionApiResponse): AISuggestion {
	return {
		id: api.id,
		category: {
			type: api.category.type,
			existingId: api.category.existing_id,
			existingName: api.category.existing_name,
			existingIcon: api.category.existing_icon,
			existingColor: api.category.existing_color,
			newName: api.category.new_name,
			newIcon: api.category.new_icon,
			newColor: api.category.new_color,
		},
		match: {
			type: api.match.type,
			keyword: api.match.keyword,
		},
		affectedTransactions: api.affected_transactions.map(transformAffectedTransaction),
		affectedCount: api.affected_count,
		status: api.status as AISuggestion['status'],
		createdAt: api.created_at,
	}
}

function transformSkippedTransaction(api: SkippedTransactionApi): SkippedTransaction {
	return {
		id: api.id,
		description: api.description,
		amount: api.amount,
		date: api.date,
		skipReason: api.skip_reason as SkippedTransaction['skipReason'],
	}
}

// API Functions

export async function getCategorizationStatus(): Promise<CategorizationStatus> {
	const response = await authenticatedFetch(`${API_BASE}/ai/categorization/status`, {
		method: 'GET',
	})

	if (!response.ok) {
		throw new Error('Erro ao carregar status da categorização')
	}

	const data: StatusApiResponse = await response.json()
	return {
		uncategorizedCount: data.uncategorized_count,
		isProcessing: data.is_processing,
		pendingSuggestionsCount: data.pending_suggestions_count,
		skippedCount: data.skipped_count,
		lastProcessedAt: data.last_processed_at,
		hasError: data.has_error ?? false,
		error: data.error
			? {
					code: data.error.code,
					message: data.error.message,
					retryable: data.error.retryable,
					timestamp: data.error.timestamp,
				}
			: null,
	}
}

export async function startCategorization(): Promise<StartCategorizationResponse> {
	const response = await authenticatedFetch(`${API_BASE}/ai/categorization/start`, {
		method: 'POST',
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao iniciar categorização' }))
		throw new Error(error.error || error.message || 'Erro ao iniciar categorização')
	}

	const data: StartApiResponse = await response.json()
	return {
		jobId: data.job_id,
		status: data.status,
		message: data.message,
	}
}

export async function getSuggestions(): Promise<SuggestionsResponse> {
	const response = await authenticatedFetch(`${API_BASE}/ai/categorization/suggestions`, {
		method: 'GET',
	})

	if (!response.ok) {
		throw new Error('Erro ao carregar sugestões')
	}

	const data: SuggestionsApiResponse = await response.json()
	return {
		suggestions: data.suggestions.map(transformSuggestion),
		skippedTransactions: data.skipped_transactions.map(transformSkippedTransaction),
		totalPending: data.total_pending,
		totalSkipped: data.total_skipped,
	}
}

export async function approveSuggestion(
	id: string,
	edits?: EditSuggestionInput
): Promise<ApprovalResult> {
	const body = edits
		? JSON.stringify({
				category: {
					type: edits.category.type,
					existing_id: edits.category.existingId,
					new_name: edits.category.newName,
					new_icon: edits.category.newIcon,
					new_color: edits.category.newColor,
				},
				match: {
					type: edits.match.type,
					keyword: edits.match.keyword,
				},
			})
		: undefined

	const response = await authenticatedFetch(
		`${API_BASE}/ai/categorization/suggestions/${id}/approve`,
		{
			method: 'POST',
			body,
		}
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao aprovar sugestão' }))
		throw new Error(error.error || error.message || 'Erro ao aprovar sugestão')
	}

	const data: ApprovalApiResponse = await response.json()
	return {
		suggestionId: data.suggestion_id,
		categoryId: data.category_id,
		categoryName: data.category_name,
		ruleId: data.rule_id,
		transactionsCategorized: data.transactions_categorized,
		isNewCategory: data.is_new_category,
	}
}

export async function rejectSuggestion(
	id: string,
	action: RejectAction,
	reason?: string
): Promise<RejectResult> {
	const response = await authenticatedFetch(
		`${API_BASE}/ai/categorization/suggestions/${id}/reject`,
		{
			method: 'POST',
			body: JSON.stringify({ action, reason }),
		}
	)

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao rejeitar sugestão' }))
		throw new Error(error.error || error.message || 'Erro ao rejeitar sugestão')
	}

	const data: RejectApiResponse = await response.json()
	return {
		suggestionId: data.suggestion_id,
		action: data.action,
		newSuggestion: data.new_suggestion ? transformSuggestion(data.new_suggestion) : undefined,
		message: data.message,
	}
}

export async function clearAllSuggestions(): Promise<ClearResult> {
	const response = await authenticatedFetch(`${API_BASE}/ai/categorization/suggestions`, {
		method: 'DELETE',
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao limpar sugestões' }))
		throw new Error(error.error || error.message || 'Erro ao limpar sugestões')
	}

	const data: ClearApiResponse = await response.json()
	return {
		deletedCount: data.deleted_count,
	}
}
