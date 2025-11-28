import { useState } from 'react'
import type { UserPreferences } from '../types'

interface PreferencesSectionProps {
	preferences: UserPreferences
	onChange: (key: keyof UserPreferences, value: string) => void
}

interface SelectProps {
	testId: string
	label: string
	value: string
	options: { value: string; label: string }[]
	onChange: (value: string) => void
}

function Select({ testId, label, value, options, onChange }: SelectProps) {
	const [isOpen, setIsOpen] = useState(false)
	const selectedOption = options.find(o => o.value === value)

	return (
		<div className="relative">
			<label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
				{label}
			</label>
			<button
				data-testid={testId}
				onClick={() => setIsOpen(!isOpen)}
				className="w-full px-3 py-2 text-left bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] flex items-center justify-between"
			>
				<span>{selectedOption?.label || value}</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className="w-4 h-4"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</button>
			{isOpen && (
				<div className="absolute z-10 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg">
					{options.map(option => (
						<button
							key={option.value}
							role="option"
							onClick={() => {
								onChange(option.value)
								setIsOpen(false)
							}}
							className="w-full px-3 py-2 text-left hover:bg-[var(--color-background)] text-[var(--color-text)]"
						>
							{option.label}
						</button>
					))}
				</div>
			)}
		</div>
	)
}

export function PreferencesSection({ preferences, onChange }: PreferencesSectionProps) {
	const dateFormatOptions = [
		{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
		{ value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
		{ value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
	]

	const numberFormatOptions = [
		{ value: 'BR', label: '1.234,56 (BR)' },
		{ value: 'US', label: '1,234.56 (US)' },
	]

	const themeOptions = [
		{ value: 'light', label: 'Claro' },
		{ value: 'dark', label: 'Escuro' },
		{ value: 'system', label: 'Sistema' },
	]

	return (
		<div
			data-testid="preferences-section"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6"
		>
			<h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
				Preferencias
			</h2>

			<div className="space-y-4">
				<Select
					testId="date-format-select"
					label="Formato de data"
					value={preferences.dateFormat}
					options={dateFormatOptions}
					onChange={(value) => onChange('dateFormat', value)}
				/>

				<Select
					testId="number-format-select"
					label="Formato de numero"
					value={preferences.numberFormat}
					options={numberFormatOptions}
					onChange={(value) => onChange('numberFormat', value)}
				/>

				<Select
					testId="theme-select"
					label="Tema"
					value={preferences.theme}
					options={themeOptions}
					onChange={(value) => onChange('theme', value)}
				/>
			</div>
		</div>
	)
}
