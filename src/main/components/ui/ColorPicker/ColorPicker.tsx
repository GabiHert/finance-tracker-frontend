import { useState, useCallback, type KeyboardEvent } from 'react'
import { PRESET_COLORS, isValidHex, normalizeHex } from './colors'

export interface ColorPickerProps {
	value: string
	onChange: (color: string) => void
	showPreview?: boolean
	showHexInput?: boolean
	'data-testid'?: string
}

export function ColorPicker({
	value,
	onChange,
	showPreview = true,
	showHexInput = true,
	'data-testid': testId = 'color-picker',
}: ColorPickerProps) {
	const [hexInput, setHexInput] = useState(value)
	const [error, setError] = useState<string | null>(null)

	const handleColorSelect = useCallback((hex: string) => {
		setHexInput(hex)
		setError(null)
		onChange(hex)
	}, [onChange])

	const handleHexInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setHexInput(e.target.value)
		setError(null)
	}, [])

	const handleHexSubmit = useCallback(() => {
		const normalized = normalizeHex(hexInput)
		if (isValidHex(normalized)) {
			setError(null)
			onChange(normalized)
		} else {
			setError('Invalid hex color')
		}
	}, [hexInput, onChange])

	const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleHexSubmit()
		}
	}, [handleHexSubmit])

	return (
		<div data-testid={testId} className="space-y-3">
			{showPreview && (
				<div className="flex items-center gap-3">
					<div
						data-testid="color-preview"
						className="w-10 h-10 rounded-lg border-2 border-[var(--color-border)]"
						style={{ backgroundColor: value }}
					/>
					<span className="text-sm text-[var(--color-text-secondary)]">
						{value}
					</span>
				</div>
			)}

			<div className="grid grid-cols-8 gap-2">
				{PRESET_COLORS.map((color) => {
					const isSelected = value.toUpperCase() === color.hex.toUpperCase()
					return (
						<button
							key={color.name}
							type="button"
							data-testid={`color-swatch-${color.name}`}
							title={color.label}
							onClick={() => handleColorSelect(color.hex)}
							className={`
								color-swatch
								w-8 h-8 rounded-full
								transition-all duration-150
								focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
								${isSelected ? 'selected ring-2 ring-white shadow-lg scale-110' : 'hover:scale-105'}
							`}
							style={{ backgroundColor: color.hex }}
							aria-label={`Select ${color.label} color`}
							aria-pressed={isSelected}
						/>
					)
				})}
			</div>

			{showHexInput && (
				<div className="flex items-center gap-2">
					<input
						type="text"
						data-testid="color-hex-input"
						value={hexInput}
						onChange={handleHexInputChange}
						onKeyDown={handleKeyDown}
						onBlur={handleHexSubmit}
						placeholder="#000000"
						className={`
							flex-1 px-3 py-2 text-sm
							bg-[var(--color-surface)] text-[var(--color-text)]
							border rounded-lg
							focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
							${error ? 'border-red-500' : 'border-[var(--color-border)]'}
						`}
						aria-label="Custom hex color"
						aria-invalid={!!error}
					/>
					<div
						className="w-8 h-8 rounded-lg border border-[var(--color-border)]"
						style={{ backgroundColor: isValidHex(normalizeHex(hexInput)) ? normalizeHex(hexInput) : value }}
					/>
				</div>
			)}

			{error && (
				<p data-testid="color-error" className="text-sm text-red-500">
					{error}
				</p>
			)}
		</div>
	)
}

export default ColorPicker
