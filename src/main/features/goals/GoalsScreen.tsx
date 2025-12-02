import { useState, useEffect, useCallback } from 'react'
import { Button } from '@main/components/ui/Button'
import { Modal } from '@main/components/ui/Modal'
import { GoalCard } from './components/GoalCard'
import { GoalModal } from './GoalModal'
import { fetchGoals, fetchCategories, createGoal, updateGoal, deleteGoal as deleteGoalApi } from './api'
import type { Goal, CreateGoalInput } from './types'
import type { Category } from '@main/features/categories/types'

export function GoalsScreen() {
	const [goals, setGoals] = useState<Goal[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
	const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)

	const loadData = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const [goalsData, categoriesData] = await Promise.all([
				fetchGoals(),
				fetchCategories(),
			])
			setGoals(goalsData)
			setCategories(categoriesData)
		} catch (err) {
			setError('Erro ao carregar limites de gastos')
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadData()
	}, [loadData])

	const handleAddGoal = () => {
		setSelectedGoal(null)
		setIsModalOpen(true)
	}

	const handleEditGoal = (goal: Goal) => {
		setSelectedGoal(goal)
		setIsModalOpen(true)
	}

	const handleDeleteGoal = (goal: Goal) => {
		setGoalToDelete(goal)
	}

	const handleConfirmDelete = async () => {
		if (goalToDelete) {
			try {
				await deleteGoalApi(goalToDelete.id)
				setGoals(goals.filter(g => g.id !== goalToDelete.id))
				setGoalToDelete(null)
			} catch (err) {
				console.error('Error deleting goal:', err)
			}
		}
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedGoal(null)
	}

	const handleSaveGoal = async (data: CreateGoalInput) => {
		try {
			if (selectedGoal) {
				const updated = await updateGoal(selectedGoal.id, {
					categoryId: data.categoryId,
					limitAmount: data.limitAmount,
					alertOnExceed: data.alertOnExceed,
				}, categories)
				setGoals(goals.map(g => g.id === selectedGoal.id ? updated : g))
			} else {
				const created = await createGoal(data, categories)
				setGoals([...goals, created])
			}
			handleCloseModal()
		} catch (err) {
			console.error('Error saving goal:', err)
		}
	}

	if (isLoading) {
		return (
			<div data-testid="goals-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div data-testid="goals-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto">
					<div className="text-center py-12">
						<p className="text-red-500 mb-4">{error}</p>
						<Button onClick={loadData}>Tentar novamente</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div data-testid="goals-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-[var(--color-text)]">
						Limites de Gastos
					</h1>
					<Button data-testid="new-goal-btn" onClick={handleAddGoal}>
						+ Novo Limite
					</Button>
				</div>

				<p className="text-[var(--color-text-secondary)] mb-6">
					Defina limites mensais para cada categoria e acompanhe seus gastos em tempo real.
				</p>

				<div data-testid="goals-list" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{goals.length === 0 ? (
						<div
							data-testid="goals-empty-state"
							className="col-span-full text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
						>
							<div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-background)] rounded-full flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="w-8 h-8 text-[var(--color-text-secondary)]"
								>
									<circle cx="12" cy="12" r="10" />
									<path d="M12 6v6l4 2" />
								</svg>
							</div>
							<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
								Nenhum limite cadastrado
							</h3>
							<p className="text-[var(--color-text-secondary)] mb-4">
								Crie seu primeiro limite para controlar seus gastos
							</p>
							<Button onClick={handleAddGoal}>
								Criar Limite
							</Button>
						</div>
					) : (
						goals.map((goal) => (
							<GoalCard
								key={goal.id}
								goal={goal}
								onEdit={handleEditGoal}
								onDelete={handleDeleteGoal}
							/>
						))
					)}
				</div>
			</div>

			<GoalModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSave={handleSaveGoal}
				goal={selectedGoal}
				categories={categories}
			/>

			<Modal
				isOpen={!!goalToDelete}
				onClose={() => setGoalToDelete(null)}
				title="Excluir Limite"
				size="sm"
				data-testid="confirm-delete-dialog"
				footer={
					<>
						<Button variant="secondary" onClick={() => setGoalToDelete(null)}>
							Cancelar
						</Button>
						<Button
							data-testid="confirm-delete-btn"
							variant="danger"
							onClick={handleConfirmDelete}
						>
							Excluir
						</Button>
					</>
				}
			>
				<p className="text-[var(--color-text-secondary)]">
					Tem certeza que deseja excluir este limite? Esta acao nao pode ser desfeita.
				</p>
			</Modal>
		</div>
	)
}

export default GoalsScreen
