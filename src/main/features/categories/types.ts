export type CategoryType = 'expense' | 'income'

export interface Category {
	id: string
	name: string
	icon: string
	color: string
	type: CategoryType
	description?: string
	isDefault?: boolean
	transactionCount?: number
	createdAt: string
	updatedAt: string
}

export interface CreateCategoryInput {
	name: string
	icon: string
	color: string
	type: CategoryType
	description?: string
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
	id: string
}
