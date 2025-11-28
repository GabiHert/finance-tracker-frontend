import { useState } from 'react'
import { Button } from '@main/components/ui/Button'
import { Modal } from '@main/components/ui/Modal'
import { GoalCard } from './components/GoalCard'
import { GoalModal } from './GoalModal'
import { mockGoals, mockCategories } from './mock-data'
import type { Goal, CreateGoalInput } from './types'

export function GoalsScreen() {
	const [goals, setGoals] = useState<Goal[]>(mockGoals)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
	const [deleteGoal, setDeleteGoal] = useState<Goal | null>(null)

	const handleAddGoal = () => {
		setSelectedGoal(null)
		setIsModalOpen(true)
	}

	const handleEditGoal = (goal: Goal) => {
		setSelectedGoal(goal)
		setIsModalOpen(true)
	}

	const handleDeleteGoal = (goal: Goal) => {
		setDeleteGoal(goal)
	}

	const handleConfirmDelete = () => {
		if (deleteGoal) {
			setGoals(goals.filter(g => g.id !== deleteGoal.id))
			setDeleteGoal(null)
		}
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedGoal(null)
	}

	const handleSaveGoal = (data: CreateGoalInput) => {
		const category = mockCategories.find(c => c.id === data.categoryId)

		if (selectedGoal) {
			// Update existing goal
			setGoals(goals.map(g =>
				g.id === selectedGoal.id
					? {
						...g,
						categoryId: data.categoryId,
						categoryName: category?.name || g.categoryName,
						categoryColor: category?.color || g.categoryColor,
						categoryIcon: category?.icon || g.categoryIcon,
						limitAmount: data.limitAmount,
						alertOnExceed: data.alertOnExceed ?? g.alertOnExceed,
						updatedAt: new Date().toISOString(),
					}
					: g
			))
		} else {
			// Create new goal
			const newGoal: Goal = {
				id: `goal-${Date.now()}`,
				categoryId: data.categoryId,
				categoryName: category?.name || 'Categoria',
				categoryIcon: category?.icon || 'tag',
				categoryColor: category?.color || '#6B7280',
				limitAmount: data.limitAmount,
				currentAmount: 0,
				alertOnExceed: data.alertOnExceed ?? true,
				period: 'monthly',
				startDate: new Date().toISOString().split('T')[0],
				endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			setGoals([...goals, newGoal])
		}
		handleCloseModal()
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
			/>

			<Modal
				isOpen={!!deleteGoal}
				onClose={() => setDeleteGoal(null)}
				title="Excluir Limite"
				size="sm"
				data-testid="confirm-delete-dialog"
				footer={
					<>
						<Button variant="secondary" onClick={() => setDeleteGoal(null)}>
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
