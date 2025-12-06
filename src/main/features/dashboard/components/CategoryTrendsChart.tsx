import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CategoryTrendsData, Granularity, CategoryTrendInfo, Period } from '../types'
import { formatCurrency } from '../types'
import { fetchCategoryTrends } from '../api/categoryTrends'

interface CategoryTrendsChartProps {
	startDate: string
	endDate: string
	period: Period
	customDateRange?: { startDate: string; endDate: string }
}

interface TooltipData {
	x: number
	y: number
	date: string
	periodLabel: string
	categoryName: string
	categoryColor: string
	amount: number
	categoryId: string
}

/**
 * Calculate date range based on period (same logic as dashboard.ts)
 */
function getDateRangeForPeriod(period: Period): { startDate: string; endDate: string } {
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

	let startDate: Date
	let endDate: Date = today

	switch (period) {
		case 'this_month':
			startDate = new Date(today.getFullYear(), today.getMonth(), 1)
			endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
			break
		case 'last_month':
			startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
			endDate = new Date(today.getFullYear(), today.getMonth(), 0)
			break
		case 'this_week': {
			const dayOfWeek = today.getDay()
			const sunday = dayOfWeek === 0 ? 0 : dayOfWeek
			startDate = new Date(today)
			startDate.setDate(today.getDate() - sunday)
			endDate = new Date(startDate)
			endDate.setDate(startDate.getDate() + 6)
			break
		}
		case 'last_week': {
			const dayOfWeek = today.getDay()
			const sunday = dayOfWeek === 0 ? 7 : dayOfWeek
			endDate = new Date(today)
			endDate.setDate(today.getDate() - sunday)
			startDate = new Date(endDate)
			startDate.setDate(endDate.getDate() - 6)
			break
		}
		default:
			startDate = new Date(today.getFullYear(), today.getMonth(), 1)
			endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
	}

	const formatDate = (d: Date) => d.toISOString().split('T')[0]
	return {
		startDate: formatDate(startDate),
		endDate: formatDate(endDate),
	}
}

function GranularityToggle({
	value,
	onChange,
	disabled,
}: {
	value: Granularity
	onChange: (g: Granularity) => void
	disabled?: boolean
}) {
	const options: { value: Granularity; label: string }[] = [
		{ value: 'daily', label: 'Diario' },
		{ value: 'weekly', label: 'Semanal' },
		{ value: 'monthly', label: 'Mensal' },
	]

	return (
		<div data-testid="granularity-toggle" className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
			{options.map((opt) => (
				<button
					key={opt.value}
					data-testid={`granularity-${opt.value}`}
					onClick={() => onChange(opt.value)}
					disabled={disabled}
					className={`px-3 py-1.5 text-sm font-medium transition-colors ${
						value === opt.value
							? 'bg-[var(--color-primary)] text-white'
							: 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)]'
					} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	)
}

function ChartLegend({
	categories,
	visibleIds,
	onToggle,
}: {
	categories: CategoryTrendInfo[]
	visibleIds: Set<string>
	onToggle: (id: string) => void
}) {
	return (
		<div data-testid="chart-legend" className="flex flex-wrap gap-2 mt-4 justify-center">
			{categories.map((cat) => {
				const isVisible = visibleIds.has(cat.id)
				return (
					<button
						key={cat.id}
						data-testid={`legend-item-${cat.name}`}
						onClick={() => onToggle(cat.id)}
						className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-all ${
							isVisible
								? 'opacity-100'
								: 'opacity-50 line-through'
						}`}
					>
						<span
							className="w-3 h-3 rounded-full flex-shrink-0"
							style={{ backgroundColor: cat.color }}
						/>
						<span className="text-[var(--color-text)]">{cat.name}</span>
					</button>
				)
			})}
		</div>
	)
}

function Tooltip({ data, onClose }: { data: TooltipData; onClose: () => void }) {
	return (
		<div
			data-testid="chart-tooltip"
			className="absolute z-10 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 pointer-events-none"
			style={{
				left: data.x,
				top: data.y - 60,
				transform: 'translateX(-50%)',
			}}
		>
			<div className="text-xs text-[var(--color-text-secondary)]">{data.periodLabel}</div>
			<div className="flex items-center gap-2 mt-1">
				<span
					className="w-2.5 h-2.5 rounded-full"
					style={{ backgroundColor: data.categoryColor }}
				/>
				<span className="text-sm font-medium text-[var(--color-text)]">{data.categoryName}</span>
			</div>
			<div className="text-lg font-bold text-[var(--color-text)]">{formatCurrency(data.amount)}</div>
		</div>
	)
}

export function CategoryTrendsChart({ period, customDateRange }: CategoryTrendsChartProps) {
	const navigate = useNavigate()
	const [granularity, setGranularity] = useState<Granularity>('daily')
	const [data, setData] = useState<CategoryTrendsData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set())
	const [tooltip, setTooltip] = useState<TooltipData | null>(null)

	// Calculate date range based on period
	const dateRange = useMemo(() => {
		if (period === 'custom' && customDateRange) {
			return customDateRange
		}
		return getDateRangeForPeriod(period)
	}, [period, customDateRange])

	const loadData = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const result = await fetchCategoryTrends({
				startDate: dateRange.startDate,
				endDate: dateRange.endDate,
				granularity,
				topCategories: 8,
			})
			setData(result)
			// Initialize all categories as visible
			setVisibleCategories(new Set(result.categories.map((c) => c.id)))
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar tendencias')
		} finally {
			setIsLoading(false)
		}
	}, [dateRange.startDate, dateRange.endDate, granularity])

	useEffect(() => {
		loadData()
	}, [loadData])

	const handleGranularityChange = (g: Granularity) => {
		setGranularity(g)
	}

	const handleLegendToggle = (categoryId: string) => {
		setVisibleCategories((prev) => {
			const next = new Set(prev)
			if (next.has(categoryId)) {
				next.delete(categoryId)
			} else {
				next.add(categoryId)
			}
			return next
		})
	}

	const handleDataPointClick = (categoryId: string, date: string) => {
		// Calculate date range based on granularity
		let endDateParam = date
		if (granularity === 'weekly') {
			const d = new Date(date)
			d.setDate(d.getDate() + 6)
			endDateParam = d.toISOString().split('T')[0]
		} else if (granularity === 'monthly') {
			const d = new Date(date)
			d.setMonth(d.getMonth() + 1)
			d.setDate(0)
			endDateParam = d.toISOString().split('T')[0]
		}

		const params = new URLSearchParams({
			categoryIds: categoryId,
			startDate: date,
			endDate: endDateParam,
			type: 'expense',
		})
		navigate(`/transactions?${params.toString()}`)
	}

	// Chart dimensions
	const chartHeight = 200
	const chartWidth = 400
	const padding = { top: 20, right: 20, bottom: 40, left: 50 }

	// Calculate scales
	const maxValue = useMemo(() => {
		if (!data || data.trends.length === 0) return 0
		let max = 0
		for (const trend of data.trends) {
			for (const amount of trend.amounts) {
				if (visibleCategories.has(amount.categoryId) && amount.amount > max) {
					max = amount.amount
				}
			}
		}
		return max || 1
	}, [data, visibleCategories])

	const getX = (index: number) => {
		if (!data || data.trends.length <= 1) return padding.left
		const usableWidth = chartWidth - padding.left - padding.right
		return padding.left + (index / (data.trends.length - 1)) * usableWidth
	}

	const getY = (value: number) => {
		const usableHeight = chartHeight - padding.top - padding.bottom
		return chartHeight - padding.bottom - (value / maxValue) * usableHeight
	}

	// Get visible categories
	const visibleCategoryList = useMemo(() => {
		if (!data) return []
		return data.categories.filter((c) => visibleCategories.has(c.id))
	}, [data, visibleCategories])

	// Build path for each category
	const buildPath = (categoryId: string) => {
		if (!data) return ''
		return data.trends
			.map((trend, i) => {
				const amount = trend.amounts.find((a) => a.categoryId === categoryId)
				const value = amount?.amount ?? 0
				const x = getX(i)
				const y = getY(value)
				return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
			})
			.join(' ')
	}

	// Render loading state
	if (isLoading) {
		return (
			<div
				data-testid="category-trends-section"
				className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
			>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium text-[var(--color-text)]">Despesas por Categoria</h3>
					<GranularityToggle value={granularity} onChange={handleGranularityChange} disabled />
				</div>
				<div
					data-testid="category-trends-loading"
					className="h-[200px] bg-[var(--color-background)] rounded animate-pulse"
				/>
			</div>
		)
	}

	// Render error state
	if (error) {
		return (
			<div
				data-testid="category-trends-section"
				className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
			>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium text-[var(--color-text)]">Despesas por Categoria</h3>
					<GranularityToggle value={granularity} onChange={handleGranularityChange} />
				</div>
				<div data-testid="category-trends-error" className="text-center py-8">
					<p className="text-red-500 mb-2">Erro ao carregar dados</p>
					<button
						data-testid="category-trends-retry"
						onClick={loadData}
						className="text-[var(--color-primary)] hover:underline"
					>
						Tentar novamente
					</button>
				</div>
			</div>
		)
	}

	// Render empty state
	if (!data || data.categories.length === 0 || data.trends.length === 0) {
		return (
			<div
				data-testid="category-trends-section"
				className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
			>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium text-[var(--color-text)]">Despesas por Categoria</h3>
					<GranularityToggle value={granularity} onChange={handleGranularityChange} />
				</div>
				<div
					data-testid="category-trends-empty"
					className="text-center py-8 text-[var(--color-text-secondary)]"
				>
					<p>Sem despesas no periodo selecionado</p>
					<p className="text-sm mt-1">Adicione transacoes para ver tendencias</p>
				</div>
			</div>
		)
	}

	return (
		<div
			data-testid="category-trends-section"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-4 flex-wrap gap-2">
				<h3 data-testid="section-title" className="text-lg font-medium text-[var(--color-text)]">
					Despesas por Categoria
				</h3>
				<GranularityToggle value={granularity} onChange={handleGranularityChange} />
			</div>

			{/* Chart */}
			<div data-testid="category-trends-chart" className="relative">
				{tooltip && <Tooltip data={tooltip} onClose={() => setTooltip(null)} />}

				<svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
					{/* Grid lines */}
					{[0, 1, 2, 3, 4].map((i) => (
						<line
							key={i}
							x1={padding.left}
							y1={padding.top + ((chartHeight - padding.top - padding.bottom) * i) / 4}
							x2={chartWidth - padding.right}
							y2={padding.top + ((chartHeight - padding.top - padding.bottom) * i) / 4}
							stroke="var(--color-border)"
							strokeDasharray="4 4"
						/>
					))}

					{/* Y-axis labels */}
					{[0, 1, 2, 3, 4].map((i) => {
						const value = maxValue - (maxValue * i) / 4
						const label = value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0)
						return (
							<text
								key={i}
								x={padding.left - 8}
								y={padding.top + ((chartHeight - padding.top - padding.bottom) * i) / 4 + 4}
								textAnchor="end"
								className="text-[10px] fill-[var(--color-text-secondary)]"
							>
								{label}
							</text>
						)
					})}

					{/* Category lines */}
					{visibleCategoryList.map((category) => (
						<path
							key={category.id}
							data-testid={`chart-line-${category.name}`}
							d={buildPath(category.id)}
							fill="none"
							stroke={category.color}
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								opacity: visibleCategories.has(category.id) ? 1 : 0,
								transition: 'opacity 200ms ease-in-out',
							}}
						/>
					))}

					{/* Data points */}
					{data.trends.map((trend, i) =>
						visibleCategoryList.map((category) => {
							const amount = trend.amounts.find((a) => a.categoryId === category.id)
							if (!amount) return null
							const x = getX(i)
							const y = getY(amount.amount)

							return (
								<circle
									key={`${category.id}-${i}`}
									data-testid={`data-point-${category.name}-${trend.date}`}
									cx={x}
									cy={y}
									r="4"
									fill={category.color}
									stroke="var(--color-surface)"
									strokeWidth="1.5"
									className="cursor-pointer hover:r-6"
									style={{ transition: 'r 100ms ease-out' }}
									onMouseEnter={(e) => {
										const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect()
										if (rect) {
											setTooltip({
												x: x,
												y: y,
												date: trend.date,
												periodLabel: trend.periodLabel,
												categoryName: category.name,
												categoryColor: category.color,
												amount: amount.amount,
												categoryId: category.id,
											})
										}
									}}
									onMouseLeave={() => setTooltip(null)}
									onClick={() => handleDataPointClick(category.id, trend.date)}
								/>
							)
						})
					)}

					{/* X-axis labels */}
					{data.trends.map((trend, i) => {
						// Show fewer labels to prevent overlap
						const showLabel =
							i === 0 ||
							i === data.trends.length - 1 ||
							(data.trends.length <= 7) ||
							(i % Math.ceil(data.trends.length / 5) === 0)

						if (!showLabel) return null

						return (
							<text
								key={i}
								x={getX(i)}
								y={chartHeight - 10}
								textAnchor="middle"
								className="text-[10px] fill-[var(--color-text-secondary)]"
							>
								{trend.periodLabel}
							</text>
						)
					})}
				</svg>
			</div>

			{/* Legend */}
			<ChartLegend
				categories={data.categories}
				visibleIds={visibleCategories}
				onToggle={handleLegendToggle}
			/>
		</div>
	)
}
