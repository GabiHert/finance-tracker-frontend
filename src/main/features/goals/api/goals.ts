import type { Goal, CreateGoalInput, UpdateGoalInput } from '../types'
import { fetchTransactions } from '@main/features/transactions/api/transactions'
import { fetchCategories } from '@main/features/categories/api/categories'
import type { Category } from '@main/features/categories/types'

const STORAGE_KEY = 'finance_tracker_goals'

// Helper to get current month date range
function getCurrentMonthRange(): { startDate: string; endDate: string } {
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth()
	const startDate = new Date(year, month, 1).toISOString().split('T')[0]
	const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
	return { startDate, endDate }
}

// Load goals from localStorage
function loadGoalsFromStorage(): Goal[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			return JSON.parse(stored)
		}
	} catch (error) {
		console.error('Error loading goals from storage:', error)
	}
	return []
}

// Save goals to localStorage
function saveGoalsToStorage(goals: Goal[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
	} catch (error) {
		console.error('Error saving goals to storage:', error)
	}
}

// Calculate current spending for each goal based on real transactions
async function calculateGoalProgress(goals: Goal[]): Promise<Goal[]> {
	if (goals.length === 0) return []

	try {
		const { startDate, endDate } = getCurrentMonthRange()

		// Fetch all expense transactions for the current month
		const result = await fetchTransactions({
			type: 'expense',
			startDate,
			endDate,
			limit: 1000,
		})

		// Group transactions by category and sum amounts
		const categoryTotals: Record<string, number> = {}
		for (const txn of result.transactions) {
			if (txn.categoryId) {
				const currentTotal = categoryTotals[txn.categoryId] || 0
				categoryTotals[txn.categoryId] = currentTotal + Math.abs(txn.amount)
			}
		}

		// Update goals with current amounts
		return goals.map(goal => ({
			...goal,
			currentAmount: categoryTotals[goal.categoryId] || 0,
		}))
	} catch (error) {
		console.error('Error calculating goal progress:', error)
		// Return goals without updated amounts if fetch fails
		return goals
	}
}

// Fetch all goals with current progress
export async function fetchGoals(): Promise<Goal[]> {
	const storedGoals = loadGoalsFromStorage()
	return calculateGoalProgress(storedGoals)
}

// Fetch a single goal by ID
export async function fetchGoalById(id: string): Promise<Goal | null> {
	const goals = await fetchGoals()
	return goals.find(g => g.id === id) || null
}

// Create a new goal
export async function createGoal(
	input: CreateGoalInput,
	categories: Category[]
): Promise<Goal> {
	const category = categories.find(c => c.id === input.categoryId)

	const newGoal: Goal = {
		id: `goal-${Date.now()}`,
		categoryId: input.categoryId,
		categoryName: category?.name || 'Categoria',
		categoryIcon: category?.icon || 'tag',
		categoryColor: category?.color || '#6B7280',
		limitAmount: input.limitAmount,
		currentAmount: 0,
		alertOnExceed: input.alertOnExceed ?? true,
		period: input.period || 'monthly',
		startDate: new Date().toISOString().split('T')[0],
		endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}

	const goals = loadGoalsFromStorage()
	goals.push(newGoal)
	saveGoalsToStorage(goals)

	// Calculate current progress
	const [updatedGoal] = await calculateGoalProgress([newGoal])
	return updatedGoal
}

// Update an existing goal
export async function updateGoal(
	id: string,
	input: Partial<UpdateGoalInput>,
	categories: Category[]
): Promise<Goal> {
	const goals = loadGoalsFromStorage()
	const index = goals.findIndex(g => g.id === id)

	if (index === -1) {
		throw new Error('Limite nao encontrado')
	}

	const existingGoal = goals[index]
	const category = input.categoryId
		? categories.find(c => c.id === input.categoryId)
		: null

	const updatedGoal: Goal = {
		...existingGoal,
		categoryId: input.categoryId ?? existingGoal.categoryId,
		categoryName: category?.name ?? existingGoal.categoryName,
		categoryColor: category?.color ?? existingGoal.categoryColor,
		categoryIcon: category?.icon ?? existingGoal.categoryIcon,
		limitAmount: input.limitAmount ?? existingGoal.limitAmount,
		alertOnExceed: input.alertOnExceed ?? existingGoal.alertOnExceed,
		updatedAt: new Date().toISOString(),
	}

	goals[index] = updatedGoal
	saveGoalsToStorage(goals)

	// Calculate current progress
	const [goalWithProgress] = await calculateGoalProgress([updatedGoal])
	return goalWithProgress
}

// Delete a goal
export async function deleteGoal(id: string): Promise<void> {
	const goals = loadGoalsFromStorage()
	const filtered = goals.filter(g => g.id !== id)
	saveGoalsToStorage(filtered)
}

// Export categories fetch for convenience
export { fetchCategories }
