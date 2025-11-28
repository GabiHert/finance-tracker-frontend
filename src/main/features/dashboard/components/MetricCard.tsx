import { formatCurrency, formatPercentage } from '../types'

interface MetricCardProps {
	testId: string
	label: string
	value: number
	change?: number
	type: 'balance' | 'income' | 'expenses' | 'savings'
}

function TrendArrow({ direction }: { direction: 'up' | 'down' }) {
	return (
		<span data-testid="trend-direction" className={direction === 'up' ? 'text-green-500' : 'text-red-500'}>
			{direction === 'up' ? (
				<svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 4l-8 8h6v8h4v-8h6z" />
				</svg>
			) : (
				<svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 20l8-8h-6V4h-4v8H4z" />
				</svg>
			)}
		</span>
	)
}

export function MetricCard({ testId, label, value, change, type }: MetricCardProps) {
	const getValueColor = () => {
		if (type === 'income' || type === 'savings') return 'text-green-500'
		if (type === 'expenses') return 'text-red-500'
		return 'text-[var(--color-text)]'
	}

	const getIcon = () => {
		switch (type) {
			case 'balance':
				return (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
						<rect x="2" y="5" width="20" height="14" rx="2" />
						<line x1="2" y1="10" x2="22" y2="10" />
					</svg>
				)
			case 'income':
				return (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
						<line x1="12" y1="19" x2="12" y2="5" />
						<polyline points="5 12 12 5 19 12" />
					</svg>
				)
			case 'expenses':
				return (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
						<line x1="12" y1="5" x2="12" y2="19" />
						<polyline points="19 12 12 19 5 12" />
					</svg>
				)
			case 'savings':
				return (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
						<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
						<circle cx="9" cy="12" r="1" />
					</svg>
				)
		}
	}

	const getTrendDirection = (changeValue: number, metricType: string): 'up' | 'down' => {
		// For expenses, negative change is good (down arrow)
		if (metricType === 'expenses') {
			return changeValue < 0 ? 'down' : 'up'
		}
		// For other metrics, positive change is good (up arrow)
		return changeValue >= 0 ? 'up' : 'down'
	}

	const isPositiveChange = (changeValue: number, metricType: string): boolean => {
		if (metricType === 'expenses') {
			return changeValue < 0 // Less expenses is positive
		}
		return changeValue >= 0
	}

	return (
		<div
			data-testid={`metric-card-${type}`}
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 flex flex-col"
		>
			<div data-testid="metric-card" className="flex items-center justify-between mb-2">
				<span className="text-[var(--color-text-secondary)]">{getIcon()}</span>
				{change !== undefined && (
					<div
						data-testid="trend-indicator"
						className={`text-sm ${isPositiveChange(change, type) ? 'text-green-500' : 'text-red-500'}`}
					>
						<TrendArrow direction={getTrendDirection(change, type)} />
						{formatPercentage(Math.abs(change))}
					</div>
				)}
			</div>
			<span data-testid="metric-label" className="text-sm text-[var(--color-text-secondary)] mb-1">
				{label}
			</span>
			<span data-testid="metric-value" className={`text-2xl font-bold ${getValueColor()}`}>
				{type === 'expenses' ? '-' : ''}
				{formatCurrency(value)}
			</span>
		</div>
	)
}
