import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

export interface DatePickerProps {
	value: string // DD/MM/YYYY format
	onChange: (value: string) => void
	label?: string
	error?: string
	disabled?: boolean
	placeholder?: string
	'data-testid'?: string
}

function CalendarIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			data-testid="calendar-icon"
		>
			<path
				d="M15.8333 3.33325H4.16667C3.24619 3.33325 2.5 4.07944 2.5 4.99992V16.6666C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6666V4.99992C17.5 4.07944 16.7538 3.33325 15.8333 3.33325Z"
				stroke="currentColor"
				strokeWidth="1.67"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M13.3333 1.66675V5.00008"
				stroke="currentColor"
				strokeWidth="1.67"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6.66667 1.66675V5.00008"
				stroke="currentColor"
				strokeWidth="1.67"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M2.5 8.33325H17.5"
				stroke="currentColor"
				strokeWidth="1.67"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

function ChevronLeftIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12.5 15L7.5 10L12.5 5"
				stroke="currentColor"
				strokeWidth="1.67"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

function ChevronRightIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M7.5 15L12.5 10L7.5 5"
				stroke="currentColor"
				strokeWidth="1.67"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

function CloseIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12 4L4 12M4 4L12 12"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

const MONTHS = [
	'Janeiro',
	'Fevereiro',
	'Março',
	'Abril',
	'Maio',
	'Junho',
	'Julho',
	'Agosto',
	'Setembro',
	'Outubro',
	'Novembro',
	'Dezembro',
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function parseDate(dateStr: string): Date | null {
	if (!dateStr) return null
	const [day, month, year] = dateStr.split('/')
	if (!day || !month || !year) return null
	return new Date(Number(year), Number(month) - 1, Number(day))
}

function formatDate(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	return `${day}/${month}/${year}`
}

export function DatePicker({
	value,
	onChange,
	label,
	error,
	disabled = false,
	placeholder = 'DD/MM/YYYY',
	'data-testid': dataTestId = 'date-picker',
}: DatePickerProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [inputValue, setInputValue] = useState(value)
	const containerRef = useRef<HTMLDivElement>(null)

	const selectedDate = useMemo(() => parseDate(value), [value])
	const today = useMemo(() => new Date(), [])

	const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth())
	const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear())

	useEffect(() => {
		setInputValue(value)
	}, [value])

	const handleToggle = useCallback(() => {
		if (!disabled) {
			setIsOpen(prev => !prev)
		}
	}, [disabled])

	const handleDateSelect = useCallback(
		(date: Date) => {
			const formatted = formatDate(date)
			onChange(formatted)
			setInputValue(formatted)
			setIsOpen(false)
		},
		[onChange]
	)

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		// Allow only digits and slashes
		if (/^[\d/]*$/.test(value)) {
			setInputValue(value)
		}
	}, [])

	const handleInputBlur = useCallback(() => {
		// Validate and format input
		const parsed = parseDate(inputValue)
		if (parsed && !isNaN(parsed.getTime())) {
			const formatted = formatDate(parsed)
			onChange(formatted)
			setInputValue(formatted)
		} else if (inputValue) {
			// Invalid format, revert to previous value
			setInputValue(value)
		}
	}, [inputValue, onChange, value])

	const handleClear = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			onChange('')
			setInputValue('')
		},
		[onChange]
	)

	const handlePrevMonth = useCallback(() => {
		if (viewMonth === 0) {
			setViewMonth(11)
			setViewYear(prev => prev - 1)
		} else {
			setViewMonth(prev => prev - 1)
		}
	}, [viewMonth])

	const handleNextMonth = useCallback(() => {
		if (viewMonth === 11) {
			setViewMonth(0)
			setViewYear(prev => prev + 1)
		} else {
			setViewMonth(prev => prev + 1)
		}
	}, [viewMonth])

	const handlePrevYear = useCallback(() => {
		setViewYear(prev => prev - 1)
	}, [])

	const handleNextYear = useCallback(() => {
		setViewYear(prev => prev + 1)
	}, [])

	// Generate calendar days
	const calendarDays = useMemo(() => {
		const firstDay = new Date(viewYear, viewMonth, 1)
		const lastDay = new Date(viewYear, viewMonth + 1, 0)
		const startDate = new Date(firstDay)
		startDate.setDate(startDate.getDate() - startDate.getDay())

		const days: Date[] = []
		const current = new Date(startDate)

		for (let i = 0; i < 42; i++) {
			days.push(new Date(current))
			current.setDate(current.getDate() + 1)
		}

		return days
	}, [viewMonth, viewYear])

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Escape') {
				setIsOpen(false)
			}
		},
		[]
	)

	const isToday = (date: Date) => {
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		)
	}

	const isSelected = (date: Date) => {
		if (!selectedDate) return false
		return (
			date.getDate() === selectedDate.getDate() &&
			date.getMonth() === selectedDate.getMonth() &&
			date.getFullYear() === selectedDate.getFullYear()
		)
	}

	const isCurrentMonth = (date: Date) => {
		return date.getMonth() === viewMonth
	}

	return (
		<div ref={containerRef} className="relative w-full" data-testid={`${dataTestId}-container`}>
			{label && (
				<label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
					{label}
				</label>
			)}

			{/* Trigger */}
			<div
				role="button"
				tabIndex={disabled ? -1 : 0}
				onClick={handleToggle}
				onKeyDown={handleKeyDown}
				aria-disabled={disabled}
				data-testid={dataTestId}
				className={`
					h-11 px-3 flex items-center justify-between
					bg-white border rounded-[var(--radius-md)]
					transition-all duration-150
					${
						disabled
							? 'border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] cursor-not-allowed opacity-60'
							: error
								? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/20'
								: 'border-[var(--color-neutral-300)] hover:border-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20'
					}
					${isOpen ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' : ''}
				`.replace(/\s+/g, ' ').trim()}
			>
				<input
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleInputBlur}
					placeholder={placeholder}
					disabled={disabled}
					data-testid={`${dataTestId}-input`}
					className={`
						flex-1 bg-transparent outline-none
						${!inputValue ? 'text-[var(--color-neutral-400)]' : 'text-[var(--color-text)]'}
					`.replace(/\s+/g, ' ').trim()}
				/>

				<div className="flex items-center gap-1 ml-2">
					{inputValue && !disabled && (
						<button
							type="button"
							onClick={handleClear}
							className="p-1 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
							data-testid={`${dataTestId}-clear`}
							aria-label="Clear date"
						>
							<CloseIcon />
						</button>
					)}
					<span className="text-[var(--color-neutral-400)]">
						<CalendarIcon />
					</span>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<p
					className="mt-1 text-sm text-[var(--color-error)]"
					data-testid={`${dataTestId}-error-message`}
					role="alert"
				>
					{error}
				</p>
			)}

			{/* Calendar Dropdown */}
			{isOpen && (
				<div
					className={`
						absolute z-50 w-full mt-1 p-4
						bg-white border border-[var(--color-neutral-200)]
						rounded-[var(--radius-md)] shadow-lg
					`.replace(/\s+/g, ' ').trim()}
					data-testid={`${dataTestId}-dropdown`}
					data-calendar-dropdown="true"
				>
					{/* Month/Year Navigation */}
					<div className="flex items-center justify-between mb-4">
						<button
							type="button"
							onClick={handlePrevYear}
							className="p-1 hover:bg-[var(--color-neutral-100)] rounded"
							data-testid={`${dataTestId}-prev-year`}
							aria-label="Previous year"
						>
							<ChevronLeftIcon />
						</button>

						<button
							type="button"
							onClick={handlePrevMonth}
							className="p-1 hover:bg-[var(--color-neutral-100)] rounded"
							data-testid={`${dataTestId}-prev-month`}
							aria-label="Previous month"
						>
							<ChevronLeftIcon />
						</button>

						<div className="flex gap-2 text-sm font-medium">
							<span data-testid={`${dataTestId}-month`}>{MONTHS[viewMonth]}</span>
							<span data-testid={`${dataTestId}-year`}>{viewYear}</span>
						</div>

						<button
							type="button"
							onClick={handleNextMonth}
							className="p-1 hover:bg-[var(--color-neutral-100)] rounded"
							data-testid={`${dataTestId}-next-month`}
							aria-label="Next month"
						>
							<ChevronRightIcon />
						</button>

						<button
							type="button"
							onClick={handleNextYear}
							className="p-1 hover:bg-[var(--color-neutral-100)] rounded"
							data-testid={`${dataTestId}-next-year`}
							aria-label="Next year"
						>
							<ChevronRightIcon />
						</button>
					</div>

					{/* Weekday Headers */}
					<div className="grid grid-cols-7 gap-1 mb-2">
						{WEEKDAYS.map(day => (
							<div
								key={day}
								className="text-center text-xs font-medium text-[var(--color-neutral-500)] py-1"
							>
								{day}
							</div>
						))}
					</div>

					{/* Calendar Days */}
					<div className="grid grid-cols-7 gap-1">
						{calendarDays.map((date, index) => (
							<button
								key={index}
								type="button"
								onClick={() => handleDateSelect(date)}
								data-testid={
									isToday(date)
										? `${dataTestId}-today`
										: isSelected(date)
											? `${dataTestId}-selected`
											: `${dataTestId}-day-${date.getDate()}`
								}
								className={`
									h-8 flex items-center justify-center
									text-sm rounded
									transition-colors duration-100
									${
										!isCurrentMonth(date)
											? 'text-[var(--color-neutral-300)]'
											: isSelected(date)
												? 'bg-[var(--color-primary)] text-white font-medium'
												: isToday(date)
													? 'bg-[var(--color-primary-50)] text-[var(--color-primary)] font-medium'
													: 'hover:bg-[var(--color-neutral-100)]'
									}
								`.replace(/\s+/g, ' ').trim()}
							>
								{date.getDate()}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default DatePicker
