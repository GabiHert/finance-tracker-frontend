import { useState, useRef, useEffect } from 'react'
import type { CategoryBreakdown } from '../types'
import { formatCurrency } from '../types'
import type { ZoomLevel } from './ChartNavigation'

interface DonutChartProps {
	data: CategoryBreakdown[]
	zoomLevel?: ZoomLevel
	onCategoryClick?: (category: CategoryBreakdown) => void
}

function formatPeriodLabel(zoomLevel: ZoomLevel): string {
	const now = new Date()

	switch (zoomLevel) {
		case 'quarter': {
			const quarter = Math.floor(now.getMonth() / 3) + 1
			return `T${quarter} ${now.getFullYear()}`
		}
		case 'week': {
			const weekStart = new Date(now)
			weekStart.setDate(now.getDate() - now.getDay())
			const weekNum = Math.ceil((now.getDate() + 6 - now.getDay()) / 7)
			return `S${weekNum} ${now.getFullYear()}`
		}
		case 'day': {
			const day = now.getDate()
			const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(now)
			return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1).replace('.', '')} ${now.getFullYear()}`
		}
		case 'month':
		default: {
			const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(now)
			return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${now.getFullYear()}`
		}
	}
}

export function DonutChart({ data, zoomLevel = 'month', onCategoryClick }: DonutChartProps) {
	const total = data.reduce((sum, item) => sum + item.amount, 0)
	const [selectedCategory, setSelectedCategory] = useState<CategoryBreakdown | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isModalLoading, setIsModalLoading] = useState(false)
	const chartContainerRef = useRef<HTMLDivElement>(null)
	const [chartPosition, setChartPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

	useEffect(() => {
		const updatePosition = () => {
			if (chartContainerRef.current) {
				const rect = chartContainerRef.current.getBoundingClientRect()
				setChartPosition({
					top: rect.top + window.scrollY,
					left: rect.left + window.scrollX,
					width: rect.width,
					height: rect.height
				})
			}
		}

		updatePosition()
		window.addEventListener('resize', updatePosition)
		window.addEventListener('scroll', updatePosition)

		return () => {
			window.removeEventListener('resize', updatePosition)
			window.removeEventListener('scroll', updatePosition)
		}
	}, [data])

	const handleSegmentClick = (item: CategoryBreakdown) => {
		setSelectedCategory(item)
		setIsModalOpen(true)
		setIsModalLoading(true)
		setTimeout(() => setIsModalLoading(false), 400)
		onCategoryClick?.(item)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedCategory(null)
	}

	if (data.length === 0) {
		return (
			<div
				data-testid="category-donut"
				className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
			>
				<h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Despesas por Categoria</h3>
				<div data-testid="donut-empty-state" className="text-center py-8 text-[var(--color-text-secondary)]">
					Nenhuma despesa no periodo
				</div>
			</div>
		)
	}

	// Calculate stroke dasharray for each segment
	const circumference = 2 * Math.PI * 40

	// Calculate segment angles for click detection
	const segments = data.map((item, index) => {
		const percentage = item.amount / total
		const segmentOffset = data
			.slice(0, index)
			.reduce((sum, d) => sum + d.amount / total, 0)
		const startAngle = segmentOffset * 360 - 90
		const endAngle = (segmentOffset + percentage) * 360 - 90
		return { item, startAngle, endAngle, percentage }
	})

	return (
		<div
			data-testid="category-donut"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 overflow-hidden"
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-medium text-[var(--color-text)]">Despesas por Categoria</h3>
				<span
					data-testid="donut-chart-period"
					className="text-sm text-[var(--color-text-secondary)]"
				>
					{formatPeriodLabel(zoomLevel)}
				</span>
			</div>

			<div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
				<div
					ref={chartContainerRef}
					data-testid="chart-container"
					className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex-shrink-0"
				>
					<svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
						{/* Render the visual strokes */}
						{data.map((item, index) => {
							const percentage = item.amount / total
							const strokeDasharray = `${percentage * circumference} ${circumference}`
							const segmentOffset = data
								.slice(0, index)
								.reduce((sum, d) => sum + d.amount / total, 0)
							const strokeDashoffset = -segmentOffset * circumference

							return (
								<circle
									key={`visual-${item.categoryId}`}
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

					{/* Clickable overlay buttons */}
					{segments.map(({ item, startAngle, endAngle, percentage }) => {
						// Create a clip path for the segment
						const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180)
						const buttonSize = 24
						const radius = 40 // Same as donut radius in percentage
						const centerX = 50
						const centerY = 50

						// Position button at the middle of the arc
						const buttonX = centerX + radius * Math.cos(midAngle)
						const buttonY = centerY + radius * Math.sin(midAngle)

						return (
							<button
								key={item.categoryId}
								data-testid="donut-segment"
								onClick={() => handleSegmentClick(item)}
								className="absolute cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
								style={{
									left: `${buttonX}%`,
									top: `${buttonY}%`,
									transform: 'translate(-50%, -50%)',
									width: '30%',
									height: '30%',
									backgroundColor: 'transparent',
									zIndex: 10,
								}}
								aria-label={`${item.categoryName}: ${formatCurrency(item.amount)}`}
								tabIndex={0}
							/>
						)
					})}

					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<span className="text-xs sm:text-sm font-medium text-[var(--color-text)] text-center px-1 leading-tight">
							{formatCurrency(total)}
						</span>
					</div>
				</div>

				<div data-testid="chart-legend" className="flex-1 space-y-2 min-w-0">
					{data.map((item) => (
						<div key={item.categoryId} className="flex items-center gap-3 text-sm">
							<div className="flex items-center gap-2 min-w-0 flex-1">
								<span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.categoryColor }} />
								<span className="text-[var(--color-text)] truncate">{item.categoryName}</span>
							</div>
							<span className="text-[var(--color-text-secondary)] flex-shrink-0 tabular-nums">
								{item.percentage.toFixed(1)}%
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Category Transaction Modal */}
			{isModalOpen && selectedCategory && (
				<div
					className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4"
					onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
					data-testid="modal-backdrop"
				>
					<div
						data-testid="transaction-modal"
						role="dialog"
						aria-modal="true"
						className="bg-[var(--color-surface)] rounded-t-lg sm:rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
					>
						<div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
							<h2 className="text-lg font-semibold text-[var(--color-text)]">
								Transações por Categoria
							</h2>
							<button
								data-testid="modal-close-btn"
								onClick={handleCloseModal}
								aria-label="Fechar"
								className="p-2 rounded-lg hover:bg-[var(--color-background-secondary)] transition-colors"
							>
								<svg
									className="w-5 h-5 text-[var(--color-text-secondary)]"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="p-4">
							{isModalLoading ? (
								<div
									data-testid="modal-loading"
									className="flex items-center justify-center py-8"
									aria-live="polite"
								>
									<svg
										className="w-8 h-8 animate-spin text-[var(--color-primary)]"
										viewBox="0 0 24 24"
										fill="none"
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
								</div>
							) : (
								<>
									<div
										data-testid="modal-category-filter"
										className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-[var(--color-background-secondary)]"
									>
										<span
											className="w-3 h-3 rounded-full flex-shrink-0"
											style={{ backgroundColor: selectedCategory.categoryColor }}
										/>
										<span className="text-sm font-medium text-[var(--color-text)]">
											{selectedCategory.categoryName}
										</span>
									</div>

									<div className="grid grid-cols-2 gap-2 mb-4">
										<div className="text-center p-2 bg-red-50 rounded-lg">
											<span className="block text-xs text-red-700">Total</span>
											<span className="text-sm font-semibold text-red-600">
												{formatCurrency(selectedCategory.amount)}
											</span>
										</div>
										<div className="text-center p-2 bg-blue-50 rounded-lg">
											<span className="block text-xs text-blue-700">Participação</span>
											<span className="text-sm font-semibold text-blue-600">
												{selectedCategory.percentage.toFixed(1)}%
											</span>
										</div>
									</div>

									<div className="space-y-2">
										<div
											data-testid="modal-transaction-row"
											className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-background-secondary)]"
										>
											<span
												data-testid="transaction-category"
												className="text-sm text-[var(--color-text)]"
											>
												{selectedCategory.categoryName}
											</span>
											<span className="text-sm font-medium text-[var(--color-text)]">
												{formatCurrency(selectedCategory.amount)}
											</span>
										</div>
									</div>
								</>
							)}
						</div>

						<div className="flex gap-2 p-4 border-t border-[var(--color-border)]">
							<button
								data-testid="view-all-btn"
								onClick={() => {
									window.location.href = `/transactions?category_id=${selectedCategory.categoryId}`
								}}
								className="flex-1 py-2 px-4 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
							>
								Ver Todas
							</button>
							<button
								onClick={handleCloseModal}
								className="py-2 px-4 border border-[var(--color-border)] rounded-lg font-medium hover:bg-[var(--color-background-secondary)] transition-colors"
							>
								Fechar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
