import { Button } from '@main/components/ui/Button'
import type { AIProcessingError } from '../types'

interface PartialFailureBannerProps {
	error: AIProcessingError
	suggestionsCount: number
	uncategorizedCount: number
	onRetry: () => void
	isRetrying?: boolean
}

export function PartialFailureBanner({
	error,
	suggestionsCount,
	uncategorizedCount,
	onRetry,
	isRetrying = false,
}: PartialFailureBannerProps) {
	return (
		<div
			data-testid="partial-failure-banner"
			className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950 p-4 space-y-3"
		>
			{/* Header */}
			<div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
				<svg
					className="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<span className="font-medium">Processamento interrompido</span>
			</div>

			{/* Content */}
			<div className="space-y-2 text-sm">
				<p className="text-gray-700 dark:text-gray-300">{error.message}</p>

				{suggestionsCount > 0 && (
					<p className="text-green-600 dark:text-green-400">
						{suggestionsCount} sugestoes foram salvas.
					</p>
				)}

				{uncategorizedCount > 0 && (
					<p className="text-gray-500 dark:text-gray-400">
						{uncategorizedCount} transacoes ainda precisam ser categorizadas.
					</p>
				)}
			</div>

			{/* Actions */}
			{error.retryable && (
				<div className="pt-1">
					<Button
						data-testid="retry-remaining-btn"
						variant="outline"
						size="sm"
						onClick={onRetry}
						disabled={isRetrying}
					>
						{isRetrying ? 'Tentando...' : 'Tentar novamente'}
					</Button>
				</div>
			)}
		</div>
	)
}

export default PartialFailureBanner
