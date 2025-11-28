export interface Goal {
	id: string
	categoryId: string
	categoryName: string
	categoryIcon: string
	categoryColor: string
	limitAmount: number
	currentAmount: number
	alertOnExceed: boolean
	period: 'monthly' | 'weekly' | 'yearly'
	startDate: string
	endDate: string
	createdAt: string
	updatedAt: string
}

export interface CreateGoalInput {
	categoryId: string
	limitAmount: number
	alertOnExceed?: boolean
	period?: 'monthly' | 'weekly' | 'yearly'
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
	id: string
}

export function calculateProgress(current: number, limit: number): number {
	if (limit === 0) return 0
	return Math.round((current / limit) * 100)
}

export function isOverLimit(current: number, limit: number): boolean {
	return current >= limit
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value)
}
