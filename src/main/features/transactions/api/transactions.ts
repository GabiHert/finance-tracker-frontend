import type { Transaction, TransactionFormData } from '../types'

const API_BASE = '/api/v1'

// API Response types
export interface TransactionCategoryResponse {
	id: string
	name: string
	color: string
	icon: string
	type: string
}

export interface TransactionApiResponse {
	id: string
	user_id: string
	date: string
	description: string
	amount: string
	type: 'expense' | 'income'
	category_id?: string
	category?: TransactionCategoryResponse
	notes: string
	is_recurring: boolean
	created_at: string
	updated_at: string
}

export interface TransactionPaginationResponse {
	page: number
	limit: number
	total: number
	total_pages: number
}

export interface TransactionTotalsResponse {
	income_total: string
	expense_total: string
	net_total: string
}

export interface TransactionListResponse {
	transactions: TransactionApiResponse[]
	pagination: TransactionPaginationResponse
	totals: TransactionTotalsResponse
}

// Transform API response to frontend Transaction type
function transformTransaction(apiTxn: TransactionApiResponse): Transaction {
	// Parse date from YYYY-MM-DD to DD/MM/YYYY format
	const [year, month, day] = apiTxn.date.split('-')
	const formattedDate = `${day}/${month}/${year}`

	return {
		id: apiTxn.id,
		date: formattedDate,
		description: apiTxn.description,
		amount: parseFloat(apiTxn.amount),
		type: apiTxn.type,
		categoryId: apiTxn.category_id || '',
		categoryName: apiTxn.category?.name || 'Uncategorized',
		categoryIcon: apiTxn.category?.icon || 'folder',
		categoryColor: apiTxn.category?.color || '#6B7280',
		notes: apiTxn.notes,
		createdAt: apiTxn.created_at,
		updatedAt: apiTxn.updated_at,
	}
}

function getAuthHeader(): Record<string, string> {
	const token = localStorage.getItem('access_token')
	return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface FetchTransactionsParams {
	page?: number
	limit?: number
	type?: 'expense' | 'income' | 'all'
	categoryId?: string
	search?: string
	startDate?: string
	endDate?: string
}

export interface FetchTransactionsResult {
	transactions: Transaction[]
	pagination: TransactionPaginationResponse
	totals: {
		income: number
		expense: number
		net: number
	}
}

export async function fetchTransactions(params: FetchTransactionsParams = {}): Promise<FetchTransactionsResult> {
	const queryParams = new URLSearchParams()

	if (params.page) queryParams.set('page', params.page.toString())
	if (params.limit) queryParams.set('limit', params.limit.toString())
	if (params.type && params.type !== 'all') queryParams.set('type', params.type)
	if (params.categoryId) queryParams.set('category_id', params.categoryId)
	if (params.search) queryParams.set('search', params.search)
	if (params.startDate) queryParams.set('start_date', params.startDate)
	if (params.endDate) queryParams.set('end_date', params.endDate)

	const queryString = queryParams.toString()
	const url = `${API_BASE}/transactions${queryString ? `?${queryString}` : ''}`

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
	})

	if (!response.ok) {
		throw new Error('Erro ao carregar transacoes')
	}

	const data: TransactionListResponse = await response.json()

	return {
		transactions: data.transactions.map(transformTransaction),
		pagination: data.pagination,
		totals: {
			income: parseFloat(data.totals.income_total),
			expense: parseFloat(data.totals.expense_total),
			net: parseFloat(data.totals.net_total),
		},
	}
}

export interface CreateTransactionInput {
	date: string // YYYY-MM-DD format
	description: string
	amount: number
	type: 'expense' | 'income'
	categoryId?: string
	notes?: string
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
	const response = await fetch(`${API_BASE}/transactions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
		body: JSON.stringify({
			date: input.date,
			description: input.description,
			amount: input.amount,
			type: input.type,
			category_id: input.categoryId || null,
			notes: input.notes || '',
		}),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao criar transacao' }))
		throw new Error(error.error || 'Erro ao criar transacao')
	}

	const apiTxn: TransactionApiResponse = await response.json()
	return transformTransaction(apiTxn)
}

export async function updateTransaction(
	id: string,
	input: Partial<CreateTransactionInput>
): Promise<Transaction> {
	const body: Record<string, unknown> = {}
	if (input.date !== undefined) body.date = input.date
	if (input.description !== undefined) body.description = input.description
	if (input.amount !== undefined) body.amount = input.amount
	if (input.type !== undefined) body.type = input.type
	if (input.categoryId !== undefined) body.category_id = input.categoryId || null
	if (input.notes !== undefined) body.notes = input.notes

	const response = await fetch(`${API_BASE}/transactions/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
		body: JSON.stringify(body),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao atualizar transacao' }))
		throw new Error(error.error || 'Erro ao atualizar transacao')
	}

	const apiTxn: TransactionApiResponse = await response.json()
	return transformTransaction(apiTxn)
}

export async function deleteTransaction(id: string): Promise<void> {
	const response = await fetch(`${API_BASE}/transactions/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao excluir transacao' }))
		throw new Error(error.error || 'Erro ao excluir transacao')
	}
}

export async function bulkDeleteTransactions(ids: string[]): Promise<number> {
	const response = await fetch(`${API_BASE}/transactions/bulk-delete`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
		body: JSON.stringify({ ids }),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao excluir transacoes' }))
		throw new Error(error.error || 'Erro ao excluir transacoes')
	}

	const result = await response.json()
	return result.deleted_count
}

export async function bulkCategorizeTransactions(ids: string[], categoryId: string): Promise<number> {
	const response = await fetch(`${API_BASE}/transactions/bulk-categorize`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
		body: JSON.stringify({ ids, category_id: categoryId }),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao categorizar transacoes' }))
		throw new Error(error.error || 'Erro ao categorizar transacoes')
	}

	const result = await response.json()
	return result.updated_count
}
