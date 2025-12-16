import { Card } from '@main/components/ui/Card/Card'
import { Button } from '@main/components/ui/Button/Button'
import type { PendingCycle, LinkedCycle } from '../types'

interface PendingCycleCardProps {
	cycle: PendingCycle
	onLink: (billingCycle: string) => void
	isLinking?: boolean
}

interface LinkedCycleCardProps {
	cycle: LinkedCycle
	onUnlink: (billingCycle: string) => void
	isUnlinking?: boolean
}

/**
 * Card displaying a pending billing cycle with CC transactions awaiting a bill
 */
export function PendingCycleCard({
	cycle,
	onLink,
	isLinking = false,
}: PendingCycleCardProps) {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(amount / 100)
	}

	const hasPotentialMatches = cycle.potentialBills.length > 0

	return (
		<Card
			data-testid={`cycle-card-${cycle.billingCycle}`}
			className="hover:border-[var(--color-primary-200)] transition-colors"
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-lg font-semibold text-[var(--color-text)]">
					{cycle.displayName}
				</h3>
				<span
					data-testid="pending-status-badge"
					className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
				>
					<ClockIcon />
					Aguardando fatura
				</span>
			</div>

			{/* Stats */}
			<div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)] mb-4">
				<span data-testid="transaction-count">
					{cycle.transactionCount} {cycle.transactionCount === 1 ? 'transação' : 'transações'}
				</span>
				<span>•</span>
				<span data-testid="total-amount">
					Total: {formatCurrency(cycle.totalAmount)}
				</span>
			</div>

			{/* Potential matches info */}
			{hasPotentialMatches && (
				<div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
					<p className="text-sm text-green-700 dark:text-green-300">
						{cycle.potentialBills.length} {cycle.potentialBills.length === 1 ? 'fatura possível encontrada' : 'faturas possíveis encontradas'}
					</p>
				</div>
			)}

			{/* Action */}
			<div className="flex justify-end">
				<Button
					variant="secondary"
					size="sm"
					onClick={() => onLink(cycle.billingCycle)}
					isLoading={isLinking}
					data-testid="link-btn"
				>
					{hasPotentialMatches ? 'Vincular' : 'Buscar fatura'}
				</Button>
			</div>
		</Card>
	)
}

/**
 * Card displaying a linked billing cycle with its bill payment
 */
export function LinkedCycleCard({
	cycle,
	onUnlink,
	isUnlinking = false,
}: LinkedCycleCardProps) {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(amount / 100)
	}

	const formatDifference = (diff: number) => {
		const formatted = formatCurrency(Math.abs(diff))
		const percent = cycle.bill.originalAmount > 0
			? ((Math.abs(diff) / cycle.bill.originalAmount) * 100).toFixed(1)
			: '0'
		return `${diff > 0 ? '+' : '-'}${formatted} (${percent}%)`
	}

	return (
		<Card
			data-testid={`cycle-card-${cycle.billingCycle}`}
			className={cycle.hasMismatch ? 'border-yellow-300 dark:border-yellow-700' : ''}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-lg font-semibold text-[var(--color-text)]">
					{cycle.displayName}
				</h3>
				<span
					data-testid="linked-status-badge"
					className={`
						inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
						${cycle.hasMismatch
							? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
							: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
						}
					`.replace(/\s+/g, ' ').trim()}
				>
					{cycle.hasMismatch ? (
						<>
							<WarningIcon />
							Vinculado (divergência)
						</>
					) : (
						<>
							<CheckIcon />
							Vinculado
						</>
					)}
				</span>
			</div>

			{/* Stats */}
			<div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)] mb-4">
				<span data-testid="transaction-count">
					{cycle.transactionCount} {cycle.transactionCount === 1 ? 'transação' : 'transações'}
				</span>
				<span>•</span>
				<span data-testid="bill-amount">
					Fatura: {formatCurrency(cycle.bill.originalAmount)}
				</span>
				<span>•</span>
				<span data-testid="cc-total">
					CC: {formatCurrency(cycle.totalAmount)}
				</span>
			</div>

			{/* Bill info */}
			<div className="mb-4 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-[var(--color-text)]">
							{cycle.bill.description}
						</p>
						<p className="text-xs text-[var(--color-text-muted)]">
							{cycle.bill.date}
							{cycle.bill.categoryName && ` • ${cycle.bill.categoryName}`}
						</p>
					</div>
					{cycle.amountDifference !== 0 && (
						<span
							data-testid="amount-difference"
							className={`
								text-xs font-medium
								${cycle.hasMismatch ? 'text-yellow-600 dark:text-yellow-400' : 'text-[var(--color-text-muted)]'}
							`}
						>
							Diferença: {formatDifference(cycle.amountDifference)}
						</span>
					)}
				</div>
			</div>

			{/* Action */}
			<div className="flex justify-end">
				<Button
					variant="tertiary"
					size="sm"
					onClick={() => onUnlink(cycle.billingCycle)}
					isLoading={isUnlinking}
					data-testid="unlink-btn"
				>
					Desvincular
				</Button>
			</div>
		</Card>
	)
}

function ClockIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	)
}

function CheckIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	)
}

function WarningIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</svg>
	)
}

export default PendingCycleCard
