import { useCallback } from 'react'
import { Button } from '@main/components/ui/Button'
import { getIconComponent } from '@main/components/ui/IconPicker'
import type { AISuggestion } from '../types'

interface SuggestionCardProps {
	suggestion: AISuggestion
	onApprove: (id: string) => void
	onReject: (id: string) => void
	onEdit: (suggestion: AISuggestion) => void
	onViewAll?: (suggestion: AISuggestion) => void
	isProcessing?: boolean
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

export function SuggestionCard({
	suggestion,
	onApprove,
	onReject,
	onEdit,
	onViewAll,
	isProcessing = false,
}: SuggestionCardProps) {
	const handleApprove = useCallback(() => {
		onApprove(suggestion.id)
	}, [onApprove, suggestion.id])

	const handleReject = useCallback(() => {
		onReject(suggestion.id)
	}, [onReject, suggestion.id])

	const handleEdit = useCallback(() => {
		onEdit(suggestion)
	}, [onEdit, suggestion])

	const handleViewAll = useCallback(() => {
		onViewAll?.(suggestion)
	}, [onViewAll, suggestion])

	const categoryName = suggestion.category.type === 'existing'
		? suggestion.category.existingName
		: suggestion.category.newName

	const categoryColor = suggestion.category.type === 'existing'
		? suggestion.category.existingColor
		: suggestion.category.newColor

	const categoryIcon = suggestion.category.type === 'existing'
		? suggestion.category.existingIcon
		: suggestion.category.newIcon

	const isNewCategory = suggestion.category.type === 'new'

	const IconComponent = getIconComponent(categoryIcon || 'folder')

	return (
		<div
			data-testid="suggestion-card"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
		>
			{/* Category Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<div
						className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
						style={{ backgroundColor: categoryColor || '#6B7280' }}
					>
						<IconComponent className="w-5 h-5" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-lg font-semibold text-[var(--color-text)]">
								{categoryName}
							</h3>
							{isNewCategory && (
								<span
									data-testid="new-category-badge"
									className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-50)] text-[var(--color-primary)] rounded-full"
								>
									Nova
								</span>
							)}
						</div>
						<p className="text-sm text-[var(--color-text-secondary)]">
							Regra: {getMatchTypeLabel(suggestion.match.type)}{' '}
							<span className="font-mono bg-[var(--color-background)] px-1 rounded">
								&quot;{suggestion.match.keyword}&quot;
							</span>
						</p>
					</div>
				</div>

				<span className="text-sm font-medium text-[var(--color-text-secondary)]">
					{suggestion.affectedCount} {suggestion.affectedCount === 1 ? 'transacao' : 'transacoes'}
				</span>
			</div>

			{/* Affected Transactions Preview */}
			<div className="mb-4">
				<h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
					Transacoes afetadas:
				</h4>
				{suggestion.affectedTransactions.length === 0 ? (
					<p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
						Nenhuma transacao afetada
					</p>
				) : (
					<div className="space-y-2 max-h-[200px] overflow-y-auto">
						{suggestion.affectedTransactions.slice(0, 5).map((transaction) => (
							<div
								key={transaction.id}
								data-testid="affected-transaction"
								className="flex items-center justify-between py-2 px-3 bg-[var(--color-background)] rounded-lg"
							>
								<div className="flex-1 min-w-0 mr-3">
									<p
										data-testid="transaction-description"
										className="text-sm text-[var(--color-text)] truncate"
									>
										{transaction.description}
									</p>
									<p
										data-testid="transaction-date"
										className="text-xs text-[var(--color-text-secondary)]"
									>
										{formatDate(transaction.date)}
									</p>
								</div>
								<span
									data-testid="transaction-amount"
									className={`text-sm font-medium ${
										transaction.amount < 0
											? 'text-red-600 dark:text-red-400'
											: 'text-green-600 dark:text-green-400'
									}`}
								>
									{formatCurrency(transaction.amount)}
								</span>
							</div>
						))}
						{suggestion.affectedCount > 5 && (
							<div className="flex items-center justify-between py-2">
								<p
									data-testid="more-transactions-indicator"
									className="text-xs text-[var(--color-text-secondary)]"
								>
									+ {suggestion.affectedCount - 5} {suggestion.affectedCount - 5 === 1 ? 'transacao' : 'transacoes'} mais
								</p>
								<button
									data-testid="view-all-transactions-btn"
									type="button"
									onClick={handleViewAll}
									className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium"
								>
									Ver todas
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="flex items-center gap-3 pt-3 border-t border-[var(--color-border)]">
				<Button
					data-testid="approve-suggestion-btn"
					variant="primary"
					size="sm"
					onClick={handleApprove}
					disabled={isProcessing}
				>
					Aprovar
				</Button>
				<Button
					data-testid="edit-suggestion-btn"
					variant="secondary"
					size="sm"
					onClick={handleEdit}
					disabled={isProcessing}
				>
					Editar
				</Button>
				<Button
					data-testid="reject-suggestion-btn"
					variant="secondary"
					size="sm"
					onClick={handleReject}
					disabled={isProcessing}
				>
					Rejeitar
				</Button>
			</div>
		</div>
	)
}

export default SuggestionCard
