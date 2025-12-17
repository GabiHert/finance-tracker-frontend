// Match types for AI suggestions
export type MatchType = 'contains' | 'startsWith' | 'exact'

// Suggestion status
export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'skipped'

// Category type for suggestions
export type CategorySuggestionType = 'existing' | 'new'

// Affected transaction in a suggestion
export interface AffectedTransaction {
	id: string
	description: string
	amount: number
	date: string
}

// New category suggestion details
export interface NewCategorySuggestion {
	name: string
	icon: string
	color: string
}

// Category details in a suggestion
export interface CategorySuggestion {
	type: CategorySuggestionType
	existingId?: string
	existingName?: string
	existingIcon?: string
	existingColor?: string
	newName?: string
	newIcon?: string
	newColor?: string
}

// Match rule for a suggestion
export interface MatchRule {
	type: MatchType
	keyword: string
}

// AI Suggestion entity
export interface AISuggestion {
	id: string
	category: CategorySuggestion
	match: MatchRule
	affectedTransactions: AffectedTransaction[]
	affectedCount: number
	status: SuggestionStatus
	createdAt: string
}

// Skipped transaction
export interface SkippedTransaction {
	id: string
	description: string
	amount: number
	date: string
	skipReason: 'pattern_conflict' | 'ai_error' | 'validation_failed'
}

// AI Processing Error from backend
export interface AIProcessingError {
	code: string
	message: string
	retryable: boolean
	timestamp: string
}

// Categorization status response
export interface CategorizationStatus {
	uncategorizedCount: number
	isProcessing: boolean
	pendingSuggestionsCount: number
	skippedCount: number
	lastProcessedAt: string | null
	hasError: boolean
	error: AIProcessingError | null
}

// Start categorization response
export interface StartCategorizationResponse {
	jobId: string
	status: string
	message: string
}

// Suggestions response
export interface SuggestionsResponse {
	suggestions: AISuggestion[]
	skippedTransactions: SkippedTransaction[]
	totalPending: number
	totalSkipped: number
}

// Approval result
export interface ApprovalResult {
	suggestionId: string
	categoryId: string
	categoryName: string
	ruleId: string
	transactionsCategorized: number
	isNewCategory: boolean
}

// Reject result
export interface RejectResult {
	suggestionId: string
	action: 'skip' | 'retry'
	newSuggestion?: AISuggestion
	message: string
}

// Clear result
export interface ClearResult {
	deletedCount: number
}

// Edit suggestion input
export interface EditSuggestionInput {
	category: {
		type: CategorySuggestionType
		existingId?: string
		newName?: string
		newIcon?: string
		newColor?: string
	}
	match: {
		type: MatchType
		keyword: string
	}
}

// Reject action
export type RejectAction = 'skip' | 'retry'
