import type { CategoryBreakdown } from '../types'
import { formatCurrency } from '../types'

interface DonutChartProps {
	data: CategoryBreakdown[]
}

export function DonutChart({ data }: DonutChartProps) {
	const total = data.reduce((sum, item) => sum + item.amount, 0)

	if (data.length === 0) {
		return (
			<div
				data-testid="category-donut"
				className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
			>
				<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Despesas por Categoria</h3>
				<div data-testid="chart-empty-state" className="text-center py-8 text-[var(--color-text-secondary)]">
					Nenhuma despesa no periodo
				</div>
			</div>
		)
	}

	// Calculate stroke dasharray for each segment
	const circumference = 2 * Math.PI * 40
	let cumulativeOffset = 0

	return (
		<div
			data-testid="category-donut"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
		>
			<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Despesas por Categoria</h3>

			<div className="flex items-center gap-8">
				<div data-testid="chart-container" className="relative w-32 h-32">
					<svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
						{data.map((item, index) => {
							const percentage = item.amount / total
							const strokeDasharray = `${percentage * circumference} ${circumference}`
							const strokeDashoffset = -cumulativeOffset * circumference
							cumulativeOffset += percentage

							return (
								<circle
									key={item.categoryId}
									data-testid="donut-segment"
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke={item.categoryColor}
									strokeWidth="12"
									strokeDasharray={strokeDasharray}
									strokeDashoffset={strokeDashoffset}
									className="transition-all duration-300"
								/>
							)
						})}
					</svg>
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="text-sm font-medium text-[var(--color-text)]">{formatCurrency(total)}</span>
					</div>
				</div>

				<div data-testid="chart-legend" className="flex-1 space-y-2">
					{data.map((item) => (
						<div key={item.categoryId} className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-2">
								<span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.categoryColor }} />
								<span className="text-[var(--color-text)]">{item.categoryName}</span>
							</div>
							<span className="text-[var(--color-text-secondary)]">{item.percentage.toFixed(1)}%</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
