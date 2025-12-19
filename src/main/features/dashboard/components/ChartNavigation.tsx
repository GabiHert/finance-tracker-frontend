import { useCallback } from 'react'

export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter'

interface ZoomOption {
	value: ZoomLevel
	label: string
}

const ZOOM_OPTIONS: ZoomOption[] = [
	{ value: 'day', label: 'Dia' },
	{ value: 'week', label: 'Semana' },
	{ value: 'month', label: 'Mês' },
	{ value: 'quarter', label: 'Tri' },
]

interface ChartNavigationProps {
	onPrevious: () => void
	onNext: () => void
	onZoomChange: (zoom: ZoomLevel) => void
	currentZoom: ZoomLevel
	canGoPrevious: boolean
	canGoNext: boolean
	isLoading?: boolean
}

export function ChartNavigation({
	onPrevious,
	onNext,
	onZoomChange,
	currentZoom,
	canGoPrevious,
	canGoNext,
	isLoading = false,
}: ChartNavigationProps) {
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'ArrowLeft' && canGoPrevious) {
				onPrevious()
			} else if (event.key === 'ArrowRight' && canGoNext) {
				onNext()
			}
		},
		[canGoPrevious, canGoNext, onPrevious, onNext]
	)

	return (
		<div
			className="flex items-center justify-between gap-4 py-2"
			onKeyDown={handleKeyDown}
			role="navigation"
			aria-label="Navegação do gráfico"
		>
			<div className="flex items-center gap-2">
				<button
					data-testid="chart-nav-prev"
					onClick={onPrevious}
					disabled={!canGoPrevious || isLoading}
					aria-label="Período anterior"
					className={`
						p-2 rounded-lg transition-colors
						${canGoPrevious && !isLoading
							? 'hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] cursor-pointer'
							: 'text-[var(--color-text-tertiary)] cursor-not-allowed opacity-50'
						}
					`}
				>
					<svg
						className="w-5 h-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M15 18l-6-6 6-6" />
					</svg>
				</button>
				<button
					data-testid="chart-nav-next"
					onClick={onNext}
					disabled={!canGoNext || isLoading}
					aria-label="Próximo período"
					className={`
						p-2 rounded-lg transition-colors
						${canGoNext && !isLoading
							? 'hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] cursor-pointer'
							: 'text-[var(--color-text-tertiary)] cursor-not-allowed opacity-50'
						}
					`}
				>
					<svg
						className="w-5 h-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M9 18l6-6-6-6" />
					</svg>
				</button>
			</div>

			<div
				data-testid="chart-zoom-toggle"
				className={`flex items-center gap-1 bg-[var(--color-background-secondary)] rounded-lg p-1 ${
					isLoading ? 'opacity-50 pointer-events-none' : ''
				}`}
				role="group"
				aria-label="Nível de zoom"
			>
				{ZOOM_OPTIONS.map((option) => {
					const isSelected = currentZoom === option.value
					return (
						<button
							key={option.value}
							onClick={() => onZoomChange(option.value)}
							data-selected={isSelected}
							disabled={isLoading}
							aria-pressed={isSelected}
							className={`
								px-3 py-1.5 text-sm font-medium rounded-md transition-colors
								${isSelected
									? 'bg-white text-[var(--color-primary)] shadow-sm'
									: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
								}
							`}
						>
							{option.label}
						</button>
					)
				})}
			</div>
		</div>
	)
}
