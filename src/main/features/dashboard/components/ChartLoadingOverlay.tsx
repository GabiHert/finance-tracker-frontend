interface ChartLoadingOverlayProps {
	isLoading: boolean
}

export function ChartLoadingOverlay({ isLoading }: ChartLoadingOverlayProps) {
	if (!isLoading) return null

	return (
		<div
			data-testid="chart-loading"
			role="status"
			aria-live="polite"
			aria-atomic="true"
			className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 animate-fadeIn"
		>
			<div className="flex flex-col items-center gap-2">
				<svg
					className="w-8 h-8 animate-spin text-[var(--color-primary)]"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				<span className="text-sm text-[var(--color-text-secondary)]">Carregando...</span>
			</div>
		</div>
	)
}
