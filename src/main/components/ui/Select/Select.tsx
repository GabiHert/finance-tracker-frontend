import {
	type ReactNode,
	useState,
	useRef,
	useEffect,
	useCallback,
	useMemo,
} from 'react'

export interface SelectOption {
	value: string
	label: string
	disabled?: boolean
	icon?: ReactNode
}

export interface SelectProps {
	options: SelectOption[]
	value: string | string[]
	onChange: (value: string | string[]) => void
	placeholder?: string
	label?: string
	error?: string
	disabled?: boolean
	searchable?: boolean
	multiple?: boolean
	clearable?: boolean
	'data-testid'?: string
}

function ChevronDownIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M5 7.5L10 12.5L15 7.5"
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
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
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

function CheckIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M13.3334 4L6.00008 11.3333L2.66675 8"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export function Select({
	options,
	value,
	onChange,
	placeholder = 'Select an option',
	label,
	error,
	disabled = false,
	searchable = false,
	multiple = false,
	clearable = false,
	'data-testid': dataTestId = 'select',
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [highlightedIndex, setHighlightedIndex] = useState(0)
	const containerRef = useRef<HTMLDivElement>(null)
	const searchInputRef = useRef<HTMLInputElement>(null)

	const selectedValues = useMemo(
		() => (Array.isArray(value) ? value : value ? [value] : []),
		[value]
	)

	const filteredOptions = useMemo(() => {
		if (!searchQuery) return options
		return options.filter(option =>
			option.label.toLowerCase().includes(searchQuery.toLowerCase())
		)
	}, [options, searchQuery])

	const displayValue = useMemo(() => {
		if (selectedValues.length === 0) return placeholder
		if (multiple && selectedValues.length > 1) {
			return `${selectedValues.length} selected`
		}
		const selected = options.find(o => o.value === selectedValues[0])
		return selected?.label || placeholder
	}, [selectedValues, options, placeholder, multiple])

	const handleToggle = useCallback(() => {
		if (!disabled) {
			setIsOpen(prev => !prev)
			setSearchQuery('')
			setHighlightedIndex(0)
		}
	}, [disabled])

	const handleSelect = useCallback(
		(option: SelectOption) => {
			if (option.disabled) return

			if (multiple) {
				const newValue = selectedValues.includes(option.value)
					? selectedValues.filter(v => v !== option.value)
					: [...selectedValues, option.value]
				onChange(newValue)
			} else {
				onChange(option.value)
				setIsOpen(false)
			}
		},
		[multiple, selectedValues, onChange]
	)

	const handleClear = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			onChange(multiple ? [] : '')
		},
		[multiple, onChange]
	)

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (disabled) return

			switch (e.key) {
				case 'Enter':
				case ' ':
					e.preventDefault()
					if (isOpen) {
						const option = filteredOptions[highlightedIndex]
						if (option && !option.disabled) {
							handleSelect(option)
						}
					} else {
						setIsOpen(true)
					}
					break
				case 'Escape':
					setIsOpen(false)
					break
				case 'ArrowDown':
					e.preventDefault()
					if (!isOpen) {
						setIsOpen(true)
					} else {
						setHighlightedIndex(prev =>
							prev < filteredOptions.length - 1 ? prev + 1 : prev
						)
					}
					break
				case 'ArrowUp':
					e.preventDefault()
					if (isOpen) {
						setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev))
					}
					break
			}
		},
		[disabled, isOpen, filteredOptions, highlightedIndex, handleSelect]
	)

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isOpen && searchable && searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [isOpen, searchable])

	const isSelected = (optionValue: string) => selectedValues.includes(optionValue)

	return (
		<div
			ref={containerRef}
			className="relative w-full"
			data-testid={`${dataTestId}-container`}
		>
			{label && (
				<label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
					{label}
				</label>
			)}

			{/* Trigger */}
			<div
				role="combobox"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-disabled={disabled}
				tabIndex={disabled ? -1 : 0}
				onClick={handleToggle}
				onKeyDown={handleKeyDown}
				data-testid={dataTestId === 'select' ? 'select-trigger' : dataTestId}
				className={`
					h-11 px-3 flex items-center justify-between
					bg-white border rounded-[var(--radius-md)]
					transition-all duration-150
					${disabled
						? 'border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] cursor-not-allowed opacity-60'
						: error
							? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/20'
							: 'border-[var(--color-neutral-300)] hover:border-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20'
					}
					${isOpen ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' : ''}
				`.replace(/\s+/g, ' ').trim()}
			>
				<span
					className={`
						flex-1 truncate text-left
						${selectedValues.length === 0 ? 'text-[var(--color-neutral-400)]' : 'text-[var(--color-text)]'}
					`.replace(/\s+/g, ' ').trim()}
				>
					{displayValue}
				</span>

				<div className="flex items-center gap-1 ml-2">
					{clearable && selectedValues.length > 0 && !disabled && (
						<button
							type="button"
							onClick={handleClear}
							className="p-1 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
							data-testid="select-clear-btn"
							aria-label="Clear selection"
						>
							<CloseIcon />
						</button>
					)}
					<span
						className={`
							text-[var(--color-neutral-400)] transition-transform duration-200
							${isOpen ? 'rotate-180' : ''}
						`.replace(/\s+/g, ' ').trim()}
					>
						<ChevronDownIcon />
					</span>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<p
					className="mt-1 text-sm text-[var(--color-error)]"
					data-testid="select-error-message"
					role="alert"
				>
					{error}
				</p>
			)}

			{/* Dropdown */}
			{isOpen && (
				<div
					className={`
						absolute z-50 w-full mt-1
						bg-white border border-[var(--color-neutral-200)]
						rounded-[var(--radius-md)] shadow-lg
						max-h-[280px] overflow-hidden
					`.replace(/\s+/g, ' ').trim()}
					data-testid="select-dropdown"
					role="listbox"
					aria-multiselectable={multiple}
				>
					{/* Search Input */}
					{searchable && (
						<div className="sticky top-0 p-2 bg-white border-b border-[var(--color-neutral-200)]">
							<input
								ref={searchInputRef}
								type="text"
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								placeholder="Search..."
								className={`
									w-full h-9 px-3
									border border-[var(--color-neutral-200)] rounded-[var(--radius-sm)]
									text-sm
									focus:outline-none focus:border-[var(--color-primary)]
								`.replace(/\s+/g, ' ').trim()}
								data-testid="select-search"
							/>
						</div>
					)}

					{/* Options */}
					<div className="overflow-y-auto max-h-[232px]">
						{filteredOptions.length === 0 ? (
							<div className="py-3 px-4 text-sm text-[var(--color-neutral-400)] text-center">
								No options found
							</div>
						) : (
							filteredOptions.map((option, index) => (
								<div
									key={option.value}
									role="option"
									aria-selected={isSelected(option.value)}
									aria-disabled={option.disabled}
									onClick={() => handleSelect(option)}
									data-testid={option.disabled ? 'select-option-disabled' : `select-option-${index}`}
									className={`
										h-10 px-3 flex items-center gap-2 cursor-pointer
										transition-colors duration-100
										${option.disabled
											? 'text-[var(--color-neutral-300)] cursor-not-allowed'
											: isSelected(option.value)
												? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
												: highlightedIndex === index
													? 'bg-[var(--color-neutral-50)]'
													: 'hover:bg-[var(--color-neutral-50)]'
										}
									`.replace(/\s+/g, ' ').trim()}
								>
									{multiple && (
										<div
											className={`
												w-4 h-4 border rounded flex items-center justify-center
												${isSelected(option.value)
													? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
													: 'border-[var(--color-neutral-300)]'
												}
											`.replace(/\s+/g, ' ').trim()}
										>
											{isSelected(option.value) && <CheckIcon />}
										</div>
									)}
									{option.icon && <span className="flex-shrink-0">{option.icon}</span>}
									<span className="flex-1 truncate">{option.label}</span>
									{!multiple && isSelected(option.value) && (
										<CheckIcon />
									)}
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default Select
