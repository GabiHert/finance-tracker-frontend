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
				data-chart-type="cumulative-balance"
				className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
			>
				<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Evolucao Financeira</h3>
				<div data-testid="chart-empty-state" className="text-center py-8 text-[var(--color-text-secondary)]">
					Dados insuficientes para o grafico
				</div>
			</div>
		)
	}

	const chartHeight = 150
	const chartWidth = 300
	const padding = 20
	const dateRange = getDateRange(data)

	const allBalances = data.map((d) => d.cumulativeBalance)
	const maxBalance = Math.max(...allBalances, 0)
	const minBalance = Math.min(...allBalances, 0)
	const range = maxBalance - minBalance || 1

	const getY = (value: number) => {
		const normalizedValue = (value - minBalance) / range
		return chartHeight - padding - normalizedValue * (chartHeight - padding * 2)
	}

	const getX = (index: number) => {
		if (data.length === 1) return chartWidth / 2
		return padding + (index / (data.length - 1)) * (chartWidth - padding * 2)
	}

	const zeroY = getY(0)
	const zeroLineRatio = Math.max(0, Math.min(1, maxBalance / range))
	const balancePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.cumulativeBalance)}`).join(' ')

	return (
		<div
			data-testid="trends-chart"
			data-chart-type="cumulative-balance"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
		>
			<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Evolucao Financeira</h3>

			<div data-testid="chart-container" className="relative">
				<svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-auto">
					<defs>
						<linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#10B981" />
							<stop offset={`${zeroLineRatio * 100}%`} stopColor="#10B981" />
							<stop offset={`${zeroLineRatio * 100}%`} stopColor="#EF4444" />
							<stop offset="100%" stopColor="#EF4444" />
						</linearGradient>
					</defs>

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

					{/* Zero reference line */}
					<line
						data-testid="zero-line"
						x1={padding}
						y1={zeroY}
						x2={chartWidth - padding}
						y2={zeroY}
						stroke="#9CA3AF"
						strokeWidth="1"
						strokeDasharray="4 4"
					/>

					{/* Balance line */}
					<path
						data-testid="balance-line"
						d={balancePath}
						fill="none"
						stroke="url(#balanceGradient)"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* Data points */}
					{data.map((d, i) => (
						<circle
							key={`balance-${i}`}
							data-testid="chart-data-point"
							cx={getX(i)}
							cy={getY(d.cumulativeBalance)}
							r="3"
							fill={d.cumulativeBalance >= 0 ? '#10B981' : '#EF4444'}
						/>
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
					<span className="text-sm text-[var(--color-text-secondary)]">Saldo Positivo</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="w-3 h-3 rounded-full bg-red-500" />
					<span className="text-sm text-[var(--color-text-secondary)]">Saldo Negativo</span>
				</div>
			</div>
		</div>
	)
}
