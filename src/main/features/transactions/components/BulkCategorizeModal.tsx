import { useState, useCallback } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'

interface CategoryOption {
	value: string
	label: string
	icon: string
}

interface BulkCategorizeModalProps {
	isOpen: boolean
	onClose: () => void
	onApply: (categoryId: string) => void
	selectedCount: number
	categoryOptions: CategoryOption[]
	selectedTransactionDescriptions?: string[]
}

export function BulkCategorizeModal({
	isOpen,
	onClose,
	onApply,
	selectedCount,
	categoryOptions,
	selectedTransactionDescriptions = [],
}: BulkCategorizeModalProps) {
	const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false)

	const handleApply = useCallback(async () => {
		if (!selectedCategoryId) return

		setIsLoading(true)
		try {
			await onApply(selectedCategoryId)
			setSelectedCategoryId('')
			onClose()
		} finally {
			setIsLoading(false)
		}
	}, [selectedCategoryId, onApply, onClose])

	const handleClose = useCallback(() => {
		setSelectedCategoryId('')
		onClose()
	}, [onClose])

	const previewDescriptions = selectedTransactionDescriptions.slice(0, 3)
	const remainingCount = selectedTransactionDescriptions.length - 3

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Categorizar Selecionadas"
			size="md"
			data-testid="bulk-categorize-modal"
		>
			<div className="space-y-6">
				{/* Selected count */}
				<div
					data-testid="bulk-categorize-count"
					className="text-sm text-[var(--color-neutral-600)]"
				>
					{selectedCount} {selectedCount === 1 ? 'transacao selecionada' : 'transacoes selecionadas'}
				</div>

				{/* Preview of selected transactions */}
				{previewDescriptions.length > 0 && (
					<div
						data-testid="bulk-categorize-preview"
						className="p-3 bg-[var(--color-neutral-50)] rounded-lg"
					>
						<p className="text-xs text-[var(--color-neutral-500)] mb-2">Transacoes:</p>
						<ul className="text-sm text-[var(--color-text)] space-y-1">
							{previewDescriptions.map((desc, i) => (
								<li key={i} className="truncate">
									{desc}
								</li>
							))}
							{remainingCount > 0 && (
								<li className="text-[var(--color-neutral-500)]">
									e mais {remainingCount}...
								</li>
							)}
						</ul>
					</div>
				)}

				{/* Category selector */}
				<div>
					<label
						htmlFor="bulk-category-select"
						className="block text-sm font-medium text-[var(--color-text)] mb-2"
					>
						Categoria
					</label>
					<select
						id="bulk-category-select"
						value={selectedCategoryId}
						onChange={e => setSelectedCategoryId(e.target.value)}
						data-testid="bulk-categorize-category-select"
						className="w-full px-4 py-3 border border-[var(--color-neutral-200)] rounded-lg text-[var(--color-text)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
					>
						<option value="">Selecione uma categoria</option>
						{categoryOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.icon} {option.label}
							</option>
						))}
					</select>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-neutral-200)]">
					<Button
						variant="outline"
						onClick={handleClose}
						data-testid="bulk-categorize-cancel-btn"
					>
						Cancelar
					</Button>
					<Button
						variant="primary"
						onClick={handleApply}
						disabled={!selectedCategoryId || isLoading}
						data-testid="bulk-categorize-apply-btn"
					>
						{isLoading ? 'Aplicando...' : 'Aplicar'}
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default BulkCategorizeModal
