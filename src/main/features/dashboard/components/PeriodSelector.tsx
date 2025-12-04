import { useState, useRef, useEffect } from 'react'
import type { Period } from '../types'
import { DatePicker } from '@main/components/ui/DatePicker'

export interface DateRange {
	startDate: string // DD/MM/YYYY
	endDate: string // DD/MM/YYYY
}

interface PeriodSelectorProps {
	value: Period
	onChange: (period: Period) => void
	customDateRange?: DateRange
	onCustomDateRangeChange?: (range: DateRange) => void
}

const periodOptions: { value: Period; label: string }[] = [
	{ value: 'this_month', label: 'Este Mes' },
	{ value: 'last_month', label: 'Mes Passado' },
	{ value: 'this_week', label: 'Esta Semana' },
	{ value: 'last_week', label: 'Semana Passada' },
	{ value: 'custom', label: 'Personalizado' },
]

export function PeriodSelector({
	value,
	onChange,
	customDateRange,
	onCustomDateRangeChange,
}: PeriodSelectorProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [showDatePickers, setShowDatePickers] = useState(value === 'custom')
	const containerRef = useRef<HTMLDivElement>(null)

	const selectedOption = periodOptions.find((opt) => opt.value === value)

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
				if (value !== 'custom') {
					setShowDatePickers(false)
				}
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [value])

	const handlePeriodSelect = (period: Period) => {
		onChange(period)
		if (period === 'custom') {
			setShowDatePickers(true)
		} else {
			setShowDatePickers(false)
			setIsOpen(false)
		}
	}

	const handleStartDateChange = (date: string) => {
		if (onCustomDateRangeChange) {
			onCustomDateRangeChange({
				startDate: date,
				endDate: customDateRange?.endDate || '',
			})
		}
	}

	const handleEndDateChange = (date: string) => {
		if (onCustomDateRangeChange) {
			onCustomDateRangeChange({
				startDate: customDateRange?.startDate || '',
				endDate: date,
			})
		}
	}

	const handleApply = () => {
		setIsOpen(false)
	}

	// Validate date range
	const isValidDateRange = () => {
		if (!customDateRange?.startDate || !customDateRange?.endDate) {
			return false
		}
		// Parse DD/MM/YYYY format
		const parseDate = (dateStr: string) => {
			const [day, month, year] = dateStr.split('/')
			return new Date(Number(year), Number(month) - 1, Number(day))
		}
		const start = parseDate(customDateRange.startDate)
		const end = parseDate(customDateRange.endDate)
		return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start
	}

	// Format custom date range for display
	const getDisplayLabel = () => {
		if (value === 'custom' && customDateRange?.startDate && customDateRange?.endDate) {
			return `${customDateRange.startDate} - ${customDateRange.endDate}`
		}
		return selectedOption?.label
	}

	return (
		<div ref={containerRef} data-testid="period-selector" className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-background)]"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
					<rect x="3" y="4" width="18" height="18" rx="2" />
					<line x1="16" y1="2" x2="16" y2="6" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
				</svg>
				<span className="max-w-[200px] truncate">{getDisplayLabel()}</span>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>

			{isOpen && (
				<div
					role="listbox"
					className="absolute z-10 mt-1 min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg"
				>
					{periodOptions.map((option) => (
						<div
							key={option.value}
							role="option"
							aria-selected={value === option.value}
							onClick={() => handlePeriodSelect(option.value)}
							data-testid={`period-option-${option.value}`}
							className={`px-3 py-2 cursor-pointer hover:bg-[var(--color-background)] whitespace-nowrap ${
								value === option.value ? 'bg-[var(--color-primary)] text-white' : ''
							}`}
						>
							{option.label}
						</div>
					))}

					{/* Custom Date Range Pickers */}
					{showDatePickers && (
						<div
							className="p-3 border-t border-[var(--color-border)] space-y-3"
							data-testid="custom-date-range"
						>
							<div>
								<label className="block text-xs text-[var(--color-text-secondary)] mb-1">
									Data Inicial
								</label>
								<DatePicker
									value={customDateRange?.startDate || ''}
									onChange={handleStartDateChange}
									placeholder="DD/MM/YYYY"
									data-testid="custom-start-date"
								/>
							</div>
							<div>
								<label className="block text-xs text-[var(--color-text-secondary)] mb-1">
									Data Final
								</label>
								<DatePicker
									value={customDateRange?.endDate || ''}
									onChange={handleEndDateChange}
									placeholder="DD/MM/YYYY"
									data-testid="custom-end-date"
								/>
							</div>
							<button
								type="button"
								onClick={handleApply}
								disabled={!isValidDateRange()}
								className="w-full px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed"
								data-testid="apply-custom-date"
							>
								Aplicar
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
