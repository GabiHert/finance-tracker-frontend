import type { ProcessingProgress as ProcessingProgressType } from '../types'

interface ProcessingProgressProps {
	progress: ProcessingProgressType
	pendingSuggestionsCount: number
}

export function ProcessingProgress({ progress, pendingSuggestionsCount }: ProcessingProgressProps) {
	const percentage = progress.totalTransactions > 0
		? Math.round((progress.processedTransactions / progress.totalTransactions) * 100)
		: 0

	return (
		<div
			data-testid="progress-container"
			className="rounded-lg border bg-blue-50 dark:bg-blue-950 p-4 space-y-3"
		>
			{/* Header */}
			<div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
				<svg
					className="h-4 w-4 animate-pulse"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
				<span className="font-medium">Processando transacoes...</span>
			</div>

			{/* Progress Bar */}
			<div className="space-y-1">
				<div
					data-testid="progress-bar"
					className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
				>
					<div
						data-testid="progress-bar-fill"
						className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
						style={{ width: `${percentage}%` }}
					/>
				</div>
				<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
					<span>Batch {progress.currentBatch} de {progress.totalBatches}</span>
					<span>{percentage}%</span>
				</div>
			</div>

			{/* Stats */}
			<div className="flex flex-wrap gap-4 text-sm">
				<div className="flex items-center gap-1.5">
					<svg
						className="h-4 w-4 text-gray-500 dark:text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					<span>
						{progress.processedTransactions} de {progress.totalTransactions} transacoes
					</span>
				</div>
				{pendingSuggestionsCount > 0 && (
					<div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
							/>
						</svg>
						<span>{pendingSuggestionsCount} sugestoes prontas</span>
					</div>
				)}
			</div>
		</div>
	)
}

export default ProcessingProgress
