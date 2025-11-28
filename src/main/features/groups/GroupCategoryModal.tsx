import { useState, useEffect } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import type { GroupCategory } from './types'

interface GroupCategoryModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: { name: string; type: 'income' | 'expense'; color: string }) => void
	category?: GroupCategory | null
}

const COLORS = [
	'#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#3B82F6',
	'#EC4899', '#F97316', '#14B8A6', '#6366F1', '#84CC16',
]

export function GroupCategoryModal({
	isOpen,
	onClose,
	onSave,
	category,
}: GroupCategoryModalProps) {
	const [name, setName] = useState('')
	const [type, setType] = useState<'income' | 'expense'>('expense')
	const [color, setColor] = useState(COLORS[0])
	const [isTypeOpen, setIsTypeOpen] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (category) {
			setName(category.name)
			setType(category.type)
			setColor(category.color)
		} else {
			setName('')
			setType('expense')
			setColor(COLORS[0])
		}
		setError(null)
	}, [category, isOpen])

	const handleSave = () => {
		if (!name.trim()) {
			setError('Nome da categoria e obrigatorio')
			return
		}

		onSave({
			name: name.trim(),
			type,
			color,
		})
	}

	const handleCancel = () => {
		setError(null)
		onClose()
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			title={category ? 'Editar Categoria' : 'Nova Categoria'}
			size="md"
			data-testid="category-modal"
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
						data-testid="save-category-btn"
						onClick={handleSave}
					>
						{category ? 'Salvar' : 'Criar Categoria'}
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-2">
						Nome da Categoria
					</label>
					<input
						data-testid="category-name-input"
						type="text"
						value={name}
						onChange={(e) => {
							setName(e.target.value)
							setError(null)
						}}
						placeholder="Ex: Mercado"
						className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
					/>
					{error && (
						<p data-testid="name-error" className="mt-1 text-sm text-red-500">
							{error}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-2">
						Tipo
					</label>
					<div className="relative">
						<button
							data-testid="category-type-select"
							type="button"
							onClick={() => setIsTypeOpen(!isTypeOpen)}
							className="w-full px-3 py-2 text-left bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
						>
							{type === 'expense' ? 'Despesa' : 'Receita'}
						</button>
						{isTypeOpen && (
							<div
								role="listbox"
								className="absolute z-10 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg"
							>
								<div
									role="option"
									aria-selected={type === 'expense'}
									onClick={() => {
										setType('expense')
										setIsTypeOpen(false)
									}}
									className="px-3 py-2 cursor-pointer hover:bg-[var(--color-background)]"
								>
									Despesa
								</div>
								<div
									role="option"
									aria-selected={type === 'income'}
									onClick={() => {
										setType('income')
										setIsTypeOpen(false)
									}}
									className="px-3 py-2 cursor-pointer hover:bg-[var(--color-background)]"
								>
									Receita
								</div>
							</div>
						)}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-2">
						Cor
					</label>
					<div className="flex flex-wrap gap-2">
						{COLORS.map((c) => (
							<button
								key={c}
								type="button"
								onClick={() => setColor(c)}
								className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-[var(--color-primary)]' : ''}`}
								style={{ backgroundColor: c }}
							/>
						))}
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default GroupCategoryModal
