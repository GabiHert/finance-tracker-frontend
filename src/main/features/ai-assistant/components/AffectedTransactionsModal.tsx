import { useMemo } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { getIconComponent } from '@main/components/ui/IconPicker'
import type { AISuggestion } from '../types'

interface AffectedTransactionsModalProps {
	isOpen: boolean
	onClose: () => void
	suggestion: AISuggestion | null
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value)
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr)
	return new Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date)
}

function getMatchTypeLabel(type: string): string {
	switch (type) {
		case 'contains':
			return 'contem'
		case 'startsWith':
			return 'comeca com'
		case 'exact':
			return 'exato'
		default:
			return type
	}
}

export function AffectedTransactionsModal({
	isOpen,
	onClose,
	suggestion,
}: AffectedTransactionsModalProps) {
	const categoryName = suggestion?.category.type === 'existing'
		? suggestion.category.existingName
		: suggestion?.category.newName

	const categoryColor = suggestion?.category.type === 'existing'
		? suggestion.category.existingColor
		: suggestion?.category.newColor

	const categoryIcon = suggestion?.category.type === 'existing'
		? suggestion.category.existingIcon
		: suggestion?.category.newIcon

	const IconComponent = getIconComponent(categoryIcon || 'folder')

	const totalAmount = useMemo(() => {
		if (!suggestion) return 0
		return suggestion.affectedTransactions.reduce((sum, txn) => sum + txn.amount, 0)
	}, [suggestion])

	if (!suggestion) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Transacoes Afetadas (${suggestion.affectedCount})`}
			size="lg"
			data-testid="affected-transactions-modal"
			footer={
				<div className="flex items-center justify-between w-full">
					<div data-testid="modal-total-amount" className="text-sm text-[var(--color-text-secondary)]">
						Total: <span className={`font-medium ${
							totalAmount < 0
								? 'text-red-600 dark:text-red-400'
								: 'text-green-600 dark:text-green-400'
						}`}>
							{formatCurrency(totalAmount)}
						</span>
					</div>
					<Button
						data-testid="modal-close-btn"
						variant="secondary"
						onClick={onClose}
					>
						Fechar
					</Button>
				</div>
			}
		>
			<div className="space-y-4">
				{/* Rule and Category Info */}
				<div className="flex items-center gap-3 p-3 bg-[var(--color-background)] rounded-lg">
					<div
						className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
						style={{ backgroundColor: categoryColor || '#6B7280' }}
					>
						<IconComponent className="w-5 h-5" />
					</div>
					<div>
						<p data-testid="modal-category-info" className="text-sm font-medium text-[var(--color-text)]">
							{categoryName}
						</p>
						<p data-testid="modal-rule-info" className="text-xs text-[var(--color-text-secondary)]">
							Regra: {getMatchTypeLabel(suggestion.match.type)}{' '}
							<span className="font-mono bg-[var(--color-surface)] px-1 rounded">
								&quot;{suggestion.match.keyword}&quot;
							</span>
						</p>
					</div>
				</div>

				{/* Transaction List */}
				<div
					data-testid="modal-transaction-list"
					className="space-y-2 max-h-[400px] overflow-y-auto"
				>
					{suggestion.affectedTransactions.map((transaction) => (
						<div
							key={transaction.id}
							data-testid="modal-transaction-item"
							className="flex items-center justify-between py-3 px-4 bg-[var(--color-background)] rounded-lg"
						>
							<div className="flex-1 min-w-0 mr-3">
								<p className="text-sm text-[var(--color-text)] truncate">
									{transaction.description}
								</p>
								<p className="text-xs text-[var(--color-text-secondary)]">
									{formatDate(transaction.date)}
								</p>
							</div>
							<span className={`text-sm font-medium shrink-0 ${
								transaction.amount < 0
									? 'text-red-600 dark:text-red-400'
									: 'text-green-600 dark:text-green-400'
							}`}>
								{formatCurrency(transaction.amount)}
							</span>
						</div>
					))}
				</div>
			</div>
		</Modal>
	)
}

export default AffectedTransactionsModal
