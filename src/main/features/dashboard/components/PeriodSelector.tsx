import { useState } from 'react'
import type { Period } from '../types'

interface PeriodSelectorProps {
	value: Period
	onChange: (period: Period) => void
}

const periodOptions: { value: Period; label: string }[] = [
	{ value: 'this_month', label: 'Este Mes' },
	{ value: 'last_month', label: 'Mes Passado' },
	{ value: 'this_week', label: 'Esta Semana' },
	{ value: 'last_week', label: 'Semana Passada' },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
	const [isOpen, setIsOpen] = useState(false)
	const selectedOption = periodOptions.find((opt) => opt.value === value)

	return (
		<div data-testid="period-selector" className="relative">
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
				{selectedOption?.label}
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
					className="absolute z-10 mt-1 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg"
				>
					{periodOptions.map((option) => (
						<div
							key={option.value}
							role="option"
							aria-selected={value === option.value}
							onClick={() => {
								onChange(option.value)
								setIsOpen(false)
							}}
							className={`px-3 py-2 cursor-pointer hover:bg-[var(--color-background)] ${
								value === option.value ? 'bg-[var(--color-primary)] text-white' : ''
							}`}
						>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
