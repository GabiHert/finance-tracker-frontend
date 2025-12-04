import { useState } from 'react'

interface CCMismatchBannerProps {
	unmatchedAmount: number
	unmatchedCount?: number
	onImportClick?: () => void
	onDismiss?: () => void
}

export function CCMismatchBanner({
	unmatchedAmount,
	unmatchedCount,
	onImportClick,
	onDismiss,
}: CCMismatchBannerProps) {
	const [isDismissed, setIsDismissed] = useState(false)

	if (isDismissed) return null

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(amount)
	}

	const handleDismiss = () => {
		setIsDismissed(true)
		onDismiss?.()
	}

	return (
		<div
			data-testid="cc-mismatch-banner"
			className="flex items-center justify-between gap-4 p-4 mb-4 bg-[var(--color-warning-50)] border border-[var(--color-warning-200)] rounded-lg"
		>
			<div className="flex items-center gap-3">
				<WarningIcon />
				<div>
					<p className="font-medium text-[var(--color-warning)]">
						Transacoes de cartao nao vinculadas
					</p>
					<p className="text-sm text-[var(--color-text-secondary)]">
						{unmatchedCount !== undefined ? (
							<>
								{unmatchedCount} transacoes ({formatCurrency(unmatchedAmount)}) nao
								estao vinculadas a nenhuma fatura
							</>
						) : (
							<>{formatCurrency(unmatchedAmount)} em transacoes nao vinculadas</>
						)}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{onImportClick && (
					<button
						onClick={onImportClick}
						data-testid="cc-import-more-btn"
						className="px-3 py-1.5 text-sm font-medium text-[var(--color-warning)] hover:bg-[var(--color-warning-100)] rounded transition-colors"
					>
						Importar fatura
					</button>
				)}
				<button
					onClick={handleDismiss}
					data-testid="cc-banner-dismiss-btn"
					className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded transition-colors"
					aria-label="Dismiss"
				>
					<CloseIcon />
				</button>
			</div>
		</div>
	)
}

function WarningIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-[var(--color-warning)]"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
			<line x1="12" x2="12" y1="9" y2="13" />
			<line x1="12" x2="12.01" y1="17" y2="17" />
		</svg>
	)
}

function CloseIcon() {
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
		>
			<line x1="18" x2="6" y1="6" y2="18" />
			<line x1="6" x2="18" y1="6" y2="18" />
		</svg>
	)
}
