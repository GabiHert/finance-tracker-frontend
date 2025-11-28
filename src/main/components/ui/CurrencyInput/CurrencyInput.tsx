import { type InputHTMLAttributes, useState, useId, useMemo } from 'react'

export interface CurrencyInputProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
	label?: string
	error?: string
	value: number | string
	onChange?: (value: number) => void
	allowNegative?: boolean
	'data-testid'?: string
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value)
}

function parseCurrency(value: string): number {
	// Remove all non-digit characters except comma and period
	const cleaned = value.replace(/[^\d,.-]/g, '')

	// Replace comma with period for parsing
	const normalized = cleaned.replace(',', '.')

	// Parse as float
	const parsed = parseFloat(normalized)

	return isNaN(parsed) ? 0 : parsed
}

export function CurrencyInput({
	label,
	error,
	value,
	onChange,
	allowNegative = false,
	className = '',
	id: providedId,
	disabled,
	required,
	'data-testid': dataTestId = 'currency-input',
	...props
}: CurrencyInputProps) {
	const generatedId = useId()
	const id = providedId || generatedId
	const errorId = `${id}-error`

	const [isFocused, setIsFocused] = useState(false)
	const [internalValue, setInternalValue] = useState('')

	// Convert value to number if string
	const numericValue = useMemo(() => {
		if (typeof value === 'number') return value
		return parseCurrency(value)
	}, [value])

	// Display value: formatted when not focused, raw when focused
	const displayValue = useMemo(() => {
		if (isFocused) {
			// Show raw number for editing
			return internalValue || (numericValue !== 0 ? numericValue.toString() : '')
		}
		// Show formatted currency
		if (numericValue === 0 && !internalValue) return ''
		return formatCurrency(numericValue)
	}, [isFocused, numericValue, internalValue])

	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		setIsFocused(true)
		// Set internal value to raw number
		setInternalValue(numericValue !== 0 ? numericValue.toString() : '')
		props.onFocus?.(e)
	}

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		setIsFocused(false)
		// Parse and notify parent
		const parsed = parseCurrency(internalValue)
		const finalValue = allowNegative ? parsed : Math.abs(parsed)
		onChange?.(finalValue)
		setInternalValue('')
		props.onBlur?.(e)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value

		// Allow only numbers, comma, period, and optionally minus
		const regex = allowNegative ? /^-?[\d,.-]*$/ : /^[\d,.-]*$/
		if (regex.test(inputValue)) {
			setInternalValue(inputValue)
		}
	}

	const baseInputClasses = `
		w-full h-11 px-3 py-2
		text-base text-[var(--color-text-primary)]
		bg-[var(--color-background)]
		border border-[var(--color-border)]
		rounded-[var(--radius-md)]
		placeholder:text-[var(--color-text-muted)]
		transition-all duration-[var(--transition-fast)]
		focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
		disabled:bg-[var(--color-neutral-100)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed
	`

	const errorClasses = error
		? 'border-[var(--color-error)] border-2 bg-[var(--color-error-50)] focus:ring-[var(--color-error)]'
		: ''

	return (
		<div className={`w-full ${className}`} data-testid={`${dataTestId}-container`}>
			{label && (
				<label
					htmlFor={id}
					className="block mb-1.5 text-sm font-medium text-[var(--color-text-primary)]"
				>
					{label}
					{required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
				</label>
			)}

			<div className="relative">
				<input
					id={id}
					type="text"
					disabled={disabled}
					required={required}
					value={displayValue}
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={error ? errorId : undefined}
					data-testid={dataTestId}
					placeholder={isFocused ? '0' : 'R$ 0,00'}
					className={`
						${baseInputClasses}
						${errorClasses}
					`.replace(/\s+/g, ' ').trim()}
					{...props}
				/>
			</div>

			{error && (
				<p
					id={errorId}
					data-testid={`${dataTestId}-error-message`}
					className="mt-1.5 text-sm text-[var(--color-error)]"
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	)
}

export default CurrencyInput
