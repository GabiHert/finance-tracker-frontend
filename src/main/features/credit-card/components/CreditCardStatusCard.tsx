import type { CreditCardStatus } from '../types'

interface CreditCardStatusCardProps {
	status: CreditCardStatus
	month: string
	onViewDetails?: () => void
}

export function CreditCardStatusCard({
	status,
	month,
	onViewDetails,
}: CreditCardStatusCardProps) {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(amount)
	}

	const formatMonth = (monthStr: string) => {
		const [year, month] = monthStr.split('-')
		const monthNames = [
			'Janeiro',
			'Fevereiro',
			'Marco',
			'Abril',
			'Maio',
			'Junho',
			'Julho',
			'Agosto',
			'Setembro',
			'Outubro',
			'Novembro',
			'Dezembro',
		]
		return `${monthNames[parseInt(month, 10) - 1]} ${year}`
	}

	const matchPercentage =
		status.totalSpending > 0
			? Math.round((status.matchedAmount / status.totalSpending) * 100)
			: 100

	return (
		<div
			data-testid="cc-status-card"
			className="bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)] p-4"
		>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<CreditCardIcon />
					<h3 className="font-semibold text-[var(--color-text)]">Cartao de Credito</h3>
				</div>
				<span className="text-sm text-[var(--color-text-secondary)]">
					{formatMonth(month)}
				</span>
			</div>

			<div className="space-y-3">
				{/* Total Spending */}
				<div className="flex justify-between items-center">
					<span className="text-sm text-[var(--color-text-secondary)]">
						Total de gastos
					</span>
					<span className="font-medium text-[var(--color-error)]">
						{formatCurrency(status.totalSpending)}
					</span>
				</div>

				{/* Match Progress */}
				<div>
					<div className="flex justify-between items-center mb-1">
						<span className="text-sm text-[var(--color-text-secondary)]">
							Vinculado
						</span>
						<span className="text-sm text-[var(--color-text)]">
							{matchPercentage}%
						</span>
					</div>
					<div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
						<div
							data-testid="cc-match-progress"
							className={`h-full transition-all duration-300 ${
								matchPercentage === 100
									? 'bg-[var(--color-success)]'
									: 'bg-[var(--color-primary)]'
							}`}
							style={{ width: `${matchPercentage}%` }}
						/>
					</div>
				</div>

				{/* Matched vs Unmatched */}
				<div className="grid grid-cols-2 gap-4 pt-2">
					<div>
						<span className="text-xs text-[var(--color-text-muted)]">Vinculado</span>
						<p className="font-medium text-[var(--color-success)]">
							{formatCurrency(status.matchedAmount)}
						</p>
					</div>
					<div>
						<span className="text-xs text-[var(--color-text-muted)]">Nao vinculado</span>
						<p
							className={`font-medium ${
								status.unmatchedAmount > 0
									? 'text-[var(--color-warning)]'
									: 'text-[var(--color-text-secondary)]'
							}`}
						>
							{formatCurrency(status.unmatchedAmount)}
						</p>
					</div>
				</div>

				{/* Bills Status */}
				<div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1">
							<CheckIcon className="text-[var(--color-success)]" />
							<span className="text-sm text-[var(--color-text)]">
								{status.expandedBills} expandidas
							</span>
						</div>
						{status.pendingBills > 0 && (
							<div className="flex items-center gap-1">
								<ClockIcon className="text-[var(--color-warning)]" />
								<span className="text-sm text-[var(--color-text)]">
									{status.pendingBills} pendentes
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Mismatch Warning */}
				{status.hasMismatches && (
					<div
						data-testid="cc-mismatch-warning"
						className="flex items-center gap-2 p-2 bg-[var(--color-warning-50)] rounded-lg"
					>
						<WarningIcon className="text-[var(--color-warning)]" />
						<span className="text-sm text-[var(--color-warning)]">
							Existem transacoes nao vinculadas
						</span>
					</div>
				)}

				{/* View Details Button */}
				{onViewDetails && (
					<button
						onClick={onViewDetails}
						data-testid="cc-view-details-btn"
						className="w-full mt-2 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] rounded-lg transition-colors"
					>
						Ver detalhes
					</button>
				)}
			</div>
		</div>
	)
}

function CreditCardIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-purple-600"
		>
			<rect width="20" height="14" x="2" y="5" rx="2" />
			<line x1="2" x2="22" y1="10" y2="10" />
		</svg>
	)
}

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	)
}

function ClockIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	)
}

function WarningIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
			<line x1="12" x2="12" y1="9" y2="13" />
			<line x1="12" x2="12.01" y1="17" y2="17" />
		</svg>
	)
}
