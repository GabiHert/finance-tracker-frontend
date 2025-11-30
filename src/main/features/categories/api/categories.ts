import type { Category, CreateCategoryInput } from '../types'

const API_BASE = '/api/v1'

// Response types from backend
export interface CategoryApiResponse {
	id: string
	name: string
	color: string
	icon: string
	owner_type: string
	owner_id: string
	type: 'expense' | 'income'
	transaction_count: number
	period_total: number
	created_at: string
	updated_at: string
}

export interface CategoryListResponse {
	categories: CategoryApiResponse[]
}

// Transform API response to frontend Category type
function transformCategory(apiCategory: CategoryApiResponse): Category {
	return {
		id: apiCategory.id,
		name: apiCategory.name,
		icon: apiCategory.icon || 'folder',
		color: apiCategory.color || '#6B7280',
		type: apiCategory.type,
		transactionCount: apiCategory.transaction_count,
		createdAt: apiCategory.created_at,
		updatedAt: apiCategory.updated_at,
	}
}

function getAuthHeader(): Record<string, string> {
	const token = localStorage.getItem('access_token')
	return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchCategories(): Promise<Category[]> {
	const response = await fetch(`${API_BASE}/categories`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
	})

	if (!response.ok) {
		throw new Error('Erro ao carregar categorias')
	}

	const data: CategoryListResponse = await response.json()
	return data.categories.map(transformCategory)
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
	const response = await fetch(`${API_BASE}/categories`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
		body: JSON.stringify({
			name: input.name,
			color: input.color,
			icon: input.icon,
			type: input.type,
		}),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao criar categoria' }))
		throw new Error(error.error || 'Erro ao criar categoria')
	}

	const apiCategory: CategoryApiResponse = await response.json()
	return transformCategory(apiCategory)
}

export async function updateCategory(
	id: string,
	input: Partial<CreateCategoryInput>
): Promise<Category> {
	const response = await fetch(`${API_BASE}/categories/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
		body: JSON.stringify({
			name: input.name,
			color: input.color,
			icon: input.icon,
		}),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao atualizar categoria' }))
		throw new Error(error.error || 'Erro ao atualizar categoria')
	}

	const apiCategory: CategoryApiResponse = await response.json()
	return transformCategory(apiCategory)
}

export async function deleteCategory(id: string): Promise<void> {
	const response = await fetch(`${API_BASE}/categories/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeader(),
		},
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao excluir categoria' }))
		throw new Error(error.error || 'Erro ao excluir categoria')
	}
}
