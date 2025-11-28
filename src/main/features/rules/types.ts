export type MatchType = 'contains' | 'starts_with' | 'exact' | 'custom'

export interface CategoryRule {
	id: string
	pattern: string
	matchType: MatchType
	categoryId: string
	categoryName: string
	categoryIcon: string
	categoryColor: string
	priority: number
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export interface CreateRuleInput {
	pattern: string
	matchType: MatchType
	categoryId: string
	priority?: number
}

export interface UpdateRuleInput extends Partial<CreateRuleInput> {
	id: string
}

export interface PatternTestResult {
	matchCount: number
	matches: Array<{
		id: string
		description: string
		amount: number
		date: string
	}>
}
