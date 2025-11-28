import { useState, useEffect } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { mockCategories } from './mock-data'
import type { Goal, CreateGoalInput } from './types'

interface GoalModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: CreateGoalInput) => void
	goal?: Goal | null
}

export function GoalModal({ isOpen, onClose, onSave, goal }: GoalModalProps) {
	const [categoryId, setCategoryId] = useState('')
	const [limitAmount, setLimitAmount] = useState('')
	const [alertOnExceed, setAlertOnExceed] = useState(true)
	const [isCategoryOpen, setIsCategoryOpen] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (goal) {
			setCategoryId(goal.categoryId)
			setLimitAmount(String(goal.limitAmount))
			setAlertOnExceed(goal.alertOnExceed)
		} else {
			setCategoryId('')
			setLimitAmount('')
			setAlertOnExceed(true)
		}
		setError(null)
	}, [goal, isOpen])

	const selectedCategory = mockCategories.find(c => c.id === categoryId)

	const handleSave = () => {
		if (!limitAmount || parseFloat(limitAmount) <= 0) {
			setError('Informe um valor valido para o limite')
			return
		}

		if (!categoryId) {
			setError('Selecione uma categoria')
			return
		}

		onSave({
			categoryId,
			limitAmount: parseFloat(limitAmount),
			alertOnExceed,
		})
	}

	const handleCancel = () => {
		setError(null)
		onClose()
	}

	const formatInputValue = (value: string): string => {
		const numericValue = value.replace(/\D/g, '')
		if (!numericValue) return ''
		const number = parseInt(numericValue, 10)
		return number.toLocaleString('pt-BR')
	}

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value.replace(/\D/g, '')
		setLimitAmount(rawValue)
		setError(null)
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			title={goal ? 'Editar Limite' : 'Novo Limite de Gastos'}
			size="md"
			footer={
				<>
					<Button
						data-testid="cancel-btn"
						variant="secondary"
						onClick={handleCancel}
					>
						Cancelar
					</Button>
					<Button
						data-testid="save-goal-btn"
						onClick={handleSave}
					>
						{goal ? 'Salvar' : 'Criar Limite'}
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-2">
						Categoria
					</label>
					<div className="relative">
						<button
							data-testid="category-selector"
							type="button"
							onClick={() => setIsCategoryOpen(!isCategoryOpen)}
							className="w-full px-3 py-2 text-left bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
						>
							{selectedCategory ? (
								<div className="flex items-center gap-2">
									<span
										className="w-4 h-4 rounded-full"
										style={{ backgroundColor: selectedCategory.color }}
									/>
									{selectedCategory.name}
								</div>
							) : (
								<span className="text-[var(--color-text-secondary)]">
									Selecione uma categoria
								</span>
							)}
						</button>
						{isCategoryOpen && (
							<div
								role="listbox"
								className="absolute z-10 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-auto"
							>
								{mockCategories.map((category) => (
									<div
										key={category.id}
										role="option"
										aria-selected={categoryId === category.id}
										onClick={() => {
											setCategoryId(category.id)
											setIsCategoryOpen(false)
											setError(null)
										}}
										className="px-3 py-2 cursor-pointer hover:bg-[var(--color-background)] flex items-center gap-2"
									>
										<span
											className="w-4 h-4 rounded-full"
											style={{ backgroundColor: category.color }}
										/>
										{category.name}
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-2">
						Limite Mensal (R$)
					</label>
					<input
						data-testid="limit-amount-input"
						type="text"
						inputMode="numeric"
						value={formatInputValue(limitAmount)}
						onChange={handleAmountChange}
						placeholder="0"
						className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
					/>
					{error && (
						<p data-testid="amount-error" className="mt-1 text-sm text-red-500">
							{error}
						</p>
					)}
				</div>

				<div className="flex items-center gap-3">
					<input
						data-testid="alert-checkbox"
						type="checkbox"
						id="alertOnExceed"
						checked={alertOnExceed}
						onChange={(e) => setAlertOnExceed(e.target.checked)}
						className="w-4 h-4 text-[var(--color-primary)] rounded border-[var(--color-border)] focus:ring-[var(--color-primary)]"
					/>
					<label
						htmlFor="alertOnExceed"
						className="text-sm text-[var(--color-text)]"
					>
						Alertar quando exceder o limite
					</label>
				</div>
			</div>
		</Modal>
	)
}

export default GoalModal
