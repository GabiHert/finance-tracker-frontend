import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ReconciliationSummary } from '../types'

interface PendingBannerProps {
	summary: ReconciliationSummary
	pendingMonths: string[] // Display names like "Nov/2024"
	onDismiss?: () => void
	className?: string
}

/**
 * Dashboard banner showing pending reconciliation summary
 * Only displays when there are pending CC transactions
 */
export function PendingBanner({
	summary,
	pendingMonths,
	onDismiss,
	className = '',
}: PendingBannerProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [isDismissed, setIsDismissed] = useState(false)

	// Don't show if no pending or dismissed
	if (summary.totalPending === 0 || isDismissed) return null

	const visibleMonths = isExpanded ? pendingMonths : pendingMonths.slice(0, 3)
	const hasMoreMonths = pendingMonths.length > 3

	const handleDismiss = () => {
		setIsDismissed(true)
		onDismiss?.()
	}

	return (
		<div
			data-testid="pending-reconciliation-banner"
			className={`
				relative flex items-start gap-3 p-4 rounded-lg
				bg-blue-50 border border-blue-200
				dark:bg-blue-900/20 dark:border-blue-800
				${className}
			`.replace(/\s+/g, ' ').trim()}
			role="status"
			aria-label={`${summary.totalPending} meses com transações CC aguardando fatura`}
		>
			{/* Info Icon */}
			<div className="flex-shrink-0 mt-0.5">
				<InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-blue-800 dark:text-blue-200">
					{summary.totalPending} {summary.totalPending === 1 ? 'mês' : 'meses'} com transações CC aguardando fatura
				</p>

				{/* Month list */}
				<div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-blue-700 dark:text-blue-300">
					{visibleMonths.map((month, index) => (
						<span key={month}>
							{month}
							{index < visibleMonths.length - 1 && ', '}
						</span>
					))}
					{hasMoreMonths && !isExpanded && (
						<button
							type="button"
							onClick={() => setIsExpanded(true)}
							className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline"
						>
							+{pendingMonths.length - 3} mais
						</button>
					)}
				</div>

				{/* Action link */}
				<Link
					to="/transacoes/reconciliacao"
					data-testid="view-more-link"
					className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					Ver mais
					<ChevronRightIcon className="w-4 h-4" />
				</Link>
			</div>

			{/* Dismiss button */}
			{onDismiss && (
				<button
					type="button"
					onClick={handleDismiss}
					className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 rounded"
					aria-label="Fechar aviso"
				>
					<CloseIcon className="w-4 h-4" />
				</button>
			)}
		</div>
	)
}

function InfoIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 16v-4" />
			<path d="M12 8h.01" />
		</svg>
	)
}

function ChevronRightIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="m9 18 6-6-6-6" />
		</svg>
	)
}

function CloseIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	)
}

export default PendingBanner
