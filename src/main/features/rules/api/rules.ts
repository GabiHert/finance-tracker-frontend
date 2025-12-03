import type { CategoryRule, CreateRuleInput, PatternTestResult, MatchType } from '../types'
import { API_BASE, authenticatedFetch } from '@main/lib'

// Backend API response types
interface CategoryRuleApiResponse {
	id: string
	pattern: string
	category_id: string
	category: {
		id: string
		name: string
		icon: string
		color: string
	}
	priority: number
	is_active: boolean
	owner_type: string
	owner_id: string
	created_at: string
	updated_at: string
}

interface CategoryRuleListResponse {
	rules: CategoryRuleApiResponse[]
}

interface TestPatternApiResponse {
	matching_transactions: Array<{
		id: string
		description: string
		amount: number
		date: string
	}>
	match_count: number
}

// Transform API response to frontend type
function transformRule(apiRule: CategoryRuleApiResponse): CategoryRule {
	return {
		id: apiRule.id,
		pattern: apiRule.pattern,
		matchType: detectMatchType(apiRule.pattern),
		categoryId: apiRule.category_id,
		categoryName: apiRule.category?.name || 'Unknown',
		categoryIcon: apiRule.category?.icon || 'folder',
		categoryColor: apiRule.category?.color || '#6B7280',
		priority: apiRule.priority,
		isActive: apiRule.is_active,
		createdAt: apiRule.created_at,
		updatedAt: apiRule.updated_at,
	}
}

// Detect match type from regex pattern
function detectMatchType(pattern: string): MatchType {
	if (pattern.startsWith('^') && pattern.endsWith('$')) {
		return 'exact'
	}
	if (pattern.startsWith('^') && pattern.endsWith('.*')) {
		return 'starts_with'
	}
	if (pattern.startsWith('.*') && pattern.endsWith('.*')) {
		return 'contains'
	}
	return 'custom'
}

export async function fetchRules(): Promise<CategoryRule[]> {
	const response = await authenticatedFetch(`${API_BASE}/category-rules`, {
		method: 'GET',
	})

	if (!response.ok) {
		throw new Error('Erro ao carregar regras')
	}

	const data: CategoryRuleListResponse = await response.json()
	return (data.rules || []).map(transformRule)
}

export async function createRule(input: CreateRuleInput): Promise<CategoryRule> {
	const response = await authenticatedFetch(`${API_BASE}/category-rules`, {
		method: 'POST',
		body: JSON.stringify({
			pattern: input.pattern,
			category_id: input.categoryId,
			priority: input.priority,
		}),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao criar regra' }))
		throw new Error(error.error || 'Erro ao criar regra')
	}

	const apiRule: CategoryRuleApiResponse = await response.json()
	return transformRule(apiRule)
}

export async function updateRule(
	id: string,
	input: Partial<CreateRuleInput> & { isActive?: boolean }
): Promise<CategoryRule> {
	const body: Record<string, unknown> = {}

	if (input.pattern !== undefined) body.pattern = input.pattern
	if (input.categoryId !== undefined) body.category_id = input.categoryId
	if (input.priority !== undefined) body.priority = input.priority
	if (input.isActive !== undefined) body.is_active = input.isActive

	const response = await authenticatedFetch(`${API_BASE}/category-rules/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao atualizar regra' }))
		throw new Error(error.error || 'Erro ao atualizar regra')
	}

	const apiRule: CategoryRuleApiResponse = await response.json()
	return transformRule(apiRule)
}

export async function deleteRule(id: string): Promise<void> {
	const response = await authenticatedFetch(`${API_BASE}/category-rules/${id}`, {
		method: 'DELETE',
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao excluir regra' }))
		throw new Error(error.error || 'Erro ao excluir regra')
	}
}

export async function testPattern(pattern: string): Promise<PatternTestResult> {
	const response = await authenticatedFetch(`${API_BASE}/category-rules/test`, {
		method: 'POST',
		body: JSON.stringify({ pattern }),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao testar padrao' }))
		throw new Error(error.error || 'Erro ao testar padrao')
	}

	const data: TestPatternApiResponse = await response.json()
	return {
		matchCount: data.match_count,
		matches: data.matching_transactions || [],
	}
}

export async function reorderRules(
	order: Array<{ id: string; priority: number }>
): Promise<CategoryRule[]> {
	const response = await authenticatedFetch(`${API_BASE}/category-rules/reorder`, {
		method: 'PATCH',
		body: JSON.stringify({ order }),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao reordenar regras' }))
		throw new Error(error.error || 'Erro ao reordenar regras')
	}

	const data: CategoryRuleListResponse = await response.json()
	return (data.rules || []).map(transformRule)
}
