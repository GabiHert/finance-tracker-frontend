import type { TrendDataPoint } from '../types'

interface TrendsChartProps {
	data: TrendDataPoint[]
}

interface DateRange {
	sameMonth: boolean
	sameYear: boolean
}

const getDateRange = (data: TrendDataPoint[]): DateRange => {
	if (data.length === 0) return { sameMonth: false, sameYear: false }

	const dates = data.map((d) => new Date(d.date))
	const months = new Set(dates.map((d) => d.getMonth()))
	const years = new Set(dates.map((d) => d.getFullYear()))

	return {
		sameMonth: months.size === 1,
		sameYear: years.size === 1,
	}
}

const formatDateLabel = (dateString: string, dateRange: DateRange): string => {
	const date = new Date(dateString)

	// If all data is within the same month, show day numbers (e.g., "1", "5", "10", "15")
	if (dateRange.sameMonth) {
		return date.getDate().toString()
	}

	// If data spans multiple months but same year, show "day/month" (e.g., "5/out", "10/nov")
	if (dateRange.sameYear) {
		const day = date.getDate()
		const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date)
		// Remove trailing period from Portuguese month abbreviations
		return `${day}/${month.replace('.', '')}`
	}

	// Default: show month abbreviation (remove trailing period)
	return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '')
}

const shouldShowLabel = (index: number, totalPoints: number): boolean => {
	// Always show first and last labels for context
	if (index === 0 || index === totalPoints - 1) return true

	// Target: maximum 5-6 visible labels to prevent overlap
	// Chart usable width ~260px, each label needs ~50px minimum
	if (totalPoints <= 5) return true

	// Calculate step to distribute labels evenly
	const targetLabels = 5
	const step = Math.ceil((totalPoints - 1) / (targetLabels - 1))

	return index % step === 0
}

export function TrendsChart({ data }: TrendsChartProps) {
	if (data.length === 0) {
		return (
			<div
				data-testid="trends-chart"
				className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
			>
				<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Evolucao Financeira</h3>
				<div data-testid="chart-empty-state" className="text-center py-8 text-[var(--color-text-secondary)]">
					Dados insuficientes para o grafico
				</div>
			</div>
		)
	}

	const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expenses]))
	const chartHeight = 150
	const chartWidth = 300
	const padding = 20
	const dateRange = getDateRange(data)

	const getY = (value: number) => {
		return chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2)
	}

	const getX = (index: number) => {
		return padding + (index / (data.length - 1)) * (chartWidth - padding * 2)
	}

	const incomePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.income)}`).join(' ')
	const expensesPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.expenses)}`).join(' ')

	return (
		<div
			data-testid="trends-chart"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
		>
			<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Evolucao Financeira</h3>

			<div data-testid="chart-container" className="relative">
				<svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-auto">
					{/* Grid lines */}
					{[0, 1, 2, 3, 4].map((i) => (
						<line
							key={i}
							x1={padding}
							y1={padding + ((chartHeight - padding * 2) * i) / 4}
							x2={chartWidth - padding}
							y2={padding + ((chartHeight - padding * 2) * i) / 4}
							stroke="var(--color-border)"
							strokeDasharray="4 4"
						/>
					))}

					{/* Income line */}
					<path
						data-testid="chart-line"
						d={incomePath}
						fill="none"
						stroke="#10B981"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* Expenses line */}
					<path
						data-testid="chart-line"
						d={expensesPath}
						fill="none"
						stroke="#EF4444"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* Data points - Income */}
					{data.map((d, i) => (
						<circle key={`income-${i}`} cx={getX(i)} cy={getY(d.income)} r="3" fill="#10B981" />
					))}

					{/* Data points - Expenses */}
					{data.map((d, i) => (
						<circle key={`expense-${i}`} cx={getX(i)} cy={getY(d.expenses)} r="3" fill="#EF4444" />
					))}

					{/* X-axis labels */}
					{data.map(
						(d, i) =>
							shouldShowLabel(i, data.length) && (
								<text
									key={`label-${i}`}
									x={getX(i)}
									y={chartHeight + 15}
									textAnchor="middle"
									className="text-xs fill-[var(--color-text-secondary)]"
								>
									{formatDateLabel(d.date, dateRange)}
								</text>
							)
					)}
				</svg>
			</div>

			{/* Legend */}
			<div className="flex items-center justify-center gap-6 mt-4">
				<div className="flex items-center gap-2">
					<span className="w-3 h-3 rounded-full bg-green-500" />
					<span className="text-sm text-[var(--color-text-secondary)]">Receitas</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="w-3 h-3 rounded-full bg-red-500" />
					<span className="text-sm text-[var(--color-text-secondary)]">Despesas</span>
				</div>
			</div>
		</div>
	)
}
