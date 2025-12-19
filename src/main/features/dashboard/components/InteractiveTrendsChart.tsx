import {
	useRef,
	useState,
	useCallback,
	useEffect,
	useMemo,
	useId,
} from 'react'
import type { TrendDataPoint } from '../types'
import { ChartNavigation, type ZoomLevel } from './ChartNavigation'
import { ChartMiniMap } from './ChartMiniMap'
import { ChartLoadingOverlay } from './ChartLoadingOverlay'
import { TransactionModal } from './TransactionModal'

interface InteractiveTrendsChartProps {
	data: TrendDataPoint[]
	isLoading?: boolean
	dataRangeStart?: Date
	dataRangeEnd?: Date
	onZoomChange?: (zoom: ZoomLevel) => void
	onViewportChange?: (startDate: Date, endDate: Date) => void
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

	if (dateRange.sameMonth) {
		return date.getDate().toString()
	}

	if (dateRange.sameYear) {
		const day = date.getDate()
		const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date)
		return `${day}/${month.replace('.', '')}`
	}

	return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '')
}

const shouldShowLabel = (index: number, totalPoints: number): boolean => {
	if (index === 0 || index === totalPoints - 1) return true
	if (totalPoints <= 5) return true

	const targetLabels = 5
	const step = Math.ceil((totalPoints - 1) / (targetLabels - 1))

	return index % step === 0
}

const VIEWPORT_SIZE = 10

export function InteractiveTrendsChart({
	data,
	isLoading = false,
	dataRangeStart,
	dataRangeEnd,
	onZoomChange,
	onViewportChange,
}: InteractiveTrendsChartProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const viewportRef = useRef<HTMLDivElement>(null)
	const chartRegionRef = useRef<HTMLDivElement>(null)
	const [currentZoom, setCurrentZoom] = useState<ZoomLevel>('month')
	const [viewportStartIndex, setViewportStartIndex] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const dragStartRef = useRef({ x: 0, startIndex: 0 })
	const descriptionId = useId()

	const fullDataRangeStart = useMemo(() => {
		if (dataRangeStart) return dataRangeStart
		if (data.length === 0) return new Date()
		return new Date(data[0].date)
	}, [dataRangeStart, data])

	const fullDataRangeEnd = useMemo(() => {
		if (dataRangeEnd) return dataRangeEnd
		if (data.length === 0) return new Date()
		return new Date(data[data.length - 1].date)
	}, [dataRangeEnd, data])

	const visibleData = useMemo(() => {
		if (data.length <= VIEWPORT_SIZE) return data
		const endIndex = Math.min(viewportStartIndex + VIEWPORT_SIZE, data.length)
		return data.slice(viewportStartIndex, endIndex)
	}, [data, viewportStartIndex])

	const viewportPosition = useMemo(() => {
		if (data.length <= VIEWPORT_SIZE) {
			return { start: 0, end: 1 }
		}
		return {
			start: viewportStartIndex / data.length,
			end: Math.min((viewportStartIndex + VIEWPORT_SIZE) / data.length, 1),
		}
	}, [data.length, viewportStartIndex])

	const canGoPrevious = viewportStartIndex > 0
	const canGoNext = viewportStartIndex + VIEWPORT_SIZE < data.length

	const handlePrevious = useCallback(() => {
		setViewportStartIndex((prev) => Math.max(0, prev - 1))
	}, [])

	const handleNext = useCallback(() => {
		setViewportStartIndex((prev) =>
			Math.min(data.length - VIEWPORT_SIZE, prev + 1)
		)
	}, [data.length])

	const handleZoomChange = useCallback(
		(zoom: ZoomLevel) => {
			setCurrentZoom(zoom)
			setViewportStartIndex(Math.max(0, data.length - VIEWPORT_SIZE))
			onZoomChange?.(zoom)
		},
		[onZoomChange, data.length]
	)

	const handleMinimapViewportChange = useCallback(
		(start: number) => {
			const newStartIndex = Math.round(start * data.length)
			setViewportStartIndex(Math.max(0, Math.min(data.length - VIEWPORT_SIZE, newStartIndex)))
		},
		[data.length]
	)

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'ArrowLeft' && canGoPrevious) {
				handlePrevious()
			} else if (event.key === 'ArrowRight' && canGoNext) {
				handleNext()
			} else if (event.key === 'Home') {
				setViewportStartIndex(0)
			} else if (event.key === 'End') {
				setViewportStartIndex(Math.max(0, data.length - VIEWPORT_SIZE))
			}
		},
		[canGoPrevious, canGoNext, handlePrevious, handleNext, data.length]
	)

	const handleDoubleClick = useCallback(() => {
		const latestStart = Math.max(0, data.length - VIEWPORT_SIZE)
		setViewportStartIndex(latestStart)
	}, [data.length])

	const handleMouseDown = useCallback(
		(event: React.MouseEvent) => {
			if (data.length <= VIEWPORT_SIZE) return
			setIsDragging(true)
			dragStartRef.current = { x: event.clientX, startIndex: viewportStartIndex }
		},
		[data.length, viewportStartIndex]
	)

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!isDragging || !viewportRef.current) return

			const viewportWidth = viewportRef.current.getBoundingClientRect().width
			const deltaX = dragStartRef.current.x - event.clientX
			const pointWidth = viewportWidth / VIEWPORT_SIZE
			const deltaPoints = Math.round(deltaX / pointWidth)

			// Dragging left (positive deltaX) should decrease index to show older data
			const newIndex = Math.max(
				0,
				Math.min(data.length - VIEWPORT_SIZE, dragStartRef.current.startIndex - deltaPoints)
			)
			setViewportStartIndex(newIndex)
		},
		[isDragging, data.length]
	)

	const handleMouseUp = useCallback(() => {
		setIsDragging(false)
	}, [])

	const handleDataPointClick = useCallback((event: React.MouseEvent, date: string) => {
		event.stopPropagation()
		setSelectedDate(date)
		setIsModalOpen(true)
	}, [])

	const handleDataPointKeyDown = useCallback((event: React.KeyboardEvent, date: string) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			setSelectedDate(date)
			setIsModalOpen(true)
		}
	}, [])

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false)
		setSelectedDate(null)
	}, [])

	useEffect(() => {
		if (isDragging) {
			window.addEventListener('mousemove', handleMouseMove)
			window.addEventListener('mouseup', handleMouseUp)
			return () => {
				window.removeEventListener('mousemove', handleMouseMove)
				window.removeEventListener('mouseup', handleMouseUp)
			}
		}
	}, [isDragging, handleMouseMove, handleMouseUp])

	useEffect(() => {
		if (visibleData.length > 0 && onViewportChange) {
			const startDate = new Date(visibleData[0].date)
			const endDate = new Date(visibleData[visibleData.length - 1].date)
			onViewportChange(startDate, endDate)
		}
	}, [visibleData, onViewportChange])

	useEffect(() => {
		if (data.length > VIEWPORT_SIZE) {
			setViewportStartIndex(Math.max(0, data.length - VIEWPORT_SIZE))
		}
	}, [data.length])

	const dateRange = getDateRange(visibleData)
	const maxValue = Math.max(
		...visibleData.flatMap((d) => [d.income, d.expenses]),
		1
	)
	const chartHeight = 150
	const chartWidth = 300
	const padding = 20

	const getY = (value: number) => {
		return chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2)
	}

	const getX = (index: number) => {
		if (visibleData.length === 1) return chartWidth / 2
		return padding + (index / (visibleData.length - 1)) * (chartWidth - padding * 2)
	}

	const selectedDataPoint = selectedDate
		? visibleData.find((d) => d.date === selectedDate) || data.find((d) => d.date === selectedDate)
		: null

	if (data.length === 0 && !isLoading) {
		return (
			<div
				data-testid="interactive-trends-chart"
				className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
			>
				<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">
					Evolucao Financeira
				</h3>
				<div
					data-testid="chart-empty-state"
					className="text-center py-8 text-[var(--color-text-secondary)]"
				>
					Dados insuficientes para o grafico
				</div>
			</div>
		)
	}

	const incomePath = visibleData
		.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.income)}`)
		.join(' ')
	const expensesPath = visibleData
		.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.expenses)}`)
		.join(' ')

	return (
		<div data-testid="trends-chart">
		<div
			ref={containerRef}
			data-testid="interactive-trends-chart"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-medium text-[var(--color-text)]">
					Evolucao Financeira
				</h3>
			</div>

			<ChartNavigation
				onPrevious={handlePrevious}
				onNext={handleNext}
				onZoomChange={handleZoomChange}
				currentZoom={currentZoom}
				canGoPrevious={canGoPrevious}
				canGoNext={canGoNext}
				isLoading={isLoading}
			/>

			<div
				ref={chartRegionRef}
				role="region"
				aria-label="Gráfico de Evolução Financeira"
				aria-describedby={descriptionId}
				tabIndex={0}
				onKeyDown={handleKeyDown}
				className="focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-lg"
			>
				<span id={descriptionId} className="sr-only">
					Use as setas esquerda e direita para navegar pelos períodos.
					Pressione Home para ir ao início e End para ir ao fim.
					Clique em um ponto de dados para ver detalhes das transações.
				</span>

				<div
					ref={viewportRef}
					data-testid="trends-chart-viewport"
					className={`relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
					onMouseDown={handleMouseDown}
					onDoubleClick={handleDoubleClick}
				>
					<ChartLoadingOverlay isLoading={isLoading} />

					<svg
						viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
						className="w-full h-auto select-none"
						role="img"
						aria-label="Gráfico de linha mostrando receitas e despesas"
					>
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

						{visibleData.length > 0 && (
							<>
								<path
									data-testid="chart-line"
									d={incomePath}
									fill="none"
									stroke="#10B981"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>

								<path
									data-testid="chart-line"
									d={expensesPath}
									fill="none"
									stroke="#EF4444"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>

								{visibleData.map((d, i) => (
									<g key={`point-${i}`}>
										<circle
											data-testid="chart-data-point"
											cx={getX(i)}
											cy={getY(d.income)}
											r="6"
											fill="#10B981"
											tabIndex={0}
											role="button"
											aria-label={`Receita em ${d.date}: R$ ${d.income.toFixed(2)}`}
											className="cursor-pointer hover:opacity-80 focus:outline-none"
											style={{ outline: 'none', pointerEvents: 'auto' }}
											onClick={(e) => handleDataPointClick(e, d.date)}
											onMouseDown={(e) => e.stopPropagation()}
											onKeyDown={(e) => handleDataPointKeyDown(e, d.date)}
										/>
										<circle
											data-testid="chart-data-point"
											cx={getX(i)}
											cy={getY(d.expenses)}
											r="6"
											fill="#EF4444"
											tabIndex={0}
											role="button"
											aria-label={`Despesa em ${d.date}: R$ ${d.expenses.toFixed(2)}`}
											className="cursor-pointer hover:opacity-80 focus:outline-none"
											style={{ outline: 'none', pointerEvents: 'auto' }}
											onClick={(e) => handleDataPointClick(e, d.date)}
											onMouseDown={(e) => e.stopPropagation()}
											onKeyDown={(e) => handleDataPointKeyDown(e, d.date)}
										/>
									</g>
								))}

								{visibleData.map(
									(d, i) =>
										shouldShowLabel(i, visibleData.length) && (
											<text
												key={`label-${i}`}
												data-testid="chart-x-axis-label"
												x={getX(i)}
												y={chartHeight + 15}
												textAnchor="middle"
												className="text-xs fill-[var(--color-text-secondary)]"
											>
												{formatDateLabel(d.date, dateRange)}
											</text>
										)
								)}
							</>
						)}

						{visibleData.length === 0 && !isLoading && (
							<text
								data-testid="chart-empty-period"
								x={chartWidth / 2}
								y={chartHeight / 2}
								textAnchor="middle"
								className="text-sm fill-[var(--color-text-secondary)]"
							>
								Sem dados para este periodo
							</text>
						)}
					</svg>
				</div>
			</div>

			<ChartMiniMap
				startDate={fullDataRangeStart}
				endDate={fullDataRangeEnd}
				viewportStart={viewportPosition.start}
				viewportEnd={viewportPosition.end}
				onViewportChange={handleMinimapViewportChange}
			/>

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

			{isModalOpen && selectedDataPoint && (
				<TransactionModal
					date={selectedDate!}
					income={selectedDataPoint.income}
					expenses={selectedDataPoint.expenses}
					onClose={handleCloseModal}
					onViewTransactions={() => {
						const startDate = selectedDate!
						const endDate = selectedDate!
						window.location.href = `/transactions?start_date=${startDate}&end_date=${endDate}`
					}}
				/>
			)}
		</div>
		</div>
	)
}
