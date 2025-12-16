import { useState } from 'react'

interface PendingBadgeProps {
	billingCycle?: string
	hasMismatch?: boolean
	className?: string
}

/**
 * Badge component to indicate pending reconciliation status
 * Shows "Aguardando fatura" for pending CC transactions
 */
export function PendingBadge({
	billingCycle,
	hasMismatch = false,
	className = '',
}: PendingBadgeProps) {
	const [showTooltip, setShowTooltip] = useState(false)

	if (!billingCycle) return null

	// Mismatch badge
	if (hasMismatch) {
		return (
			<div className={`relative inline-flex ${className}`}>
				<span
					data-testid="mismatch-badge"
					className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
					onMouseEnter={() => setShowTooltip(true)}
					onMouseLeave={() => setShowTooltip(false)}
					role="status"
					aria-label="Valor divergente entre transações CC e fatura"
				>
					<WarningIcon />
					Valor divergente
				</span>
				{showTooltip && (
					<div
						className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-gray-900 text-white rounded-lg whitespace-nowrap z-50"
						role="tooltip"
					>
						O total das transações CC difere do valor da fatura
						<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
					</div>
				)}
			</div>
		)
	}

	// Pending badge
	return (
		<div className={`relative inline-flex ${className}`}>
			<span
				data-testid="pending-badge"
				className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				role="status"
				aria-label="Aguardando vinculação com fatura"
			>
				<ClockIcon />
				Aguardando fatura
			</span>
			{showTooltip && (
				<div
					className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-gray-900 text-white rounded-lg whitespace-nowrap z-50 max-w-xs text-center"
					role="tooltip"
				>
					Estas transações serão vinculadas automaticamente quando a fatura for importada
					<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
				</div>
			)}
		</div>
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

export default PendingBadge
