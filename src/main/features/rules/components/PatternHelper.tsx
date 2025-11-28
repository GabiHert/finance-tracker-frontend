import { useMemo } from 'react'
import { Input } from '@main/components/ui/Input'
import { Select } from '@main/components/ui/Select'
import type { MatchType } from '../types'

interface PatternHelperProps {
	matchType: MatchType
	pattern: string
	onMatchTypeChange: (type: MatchType) => void
	onPatternChange: (pattern: string) => void
	error?: string
}

const matchTypeOptions = [
	{ value: 'contains', label: 'Contem' },
	{ value: 'starts_with', label: 'Comeca com' },
	{ value: 'exact', label: 'Exato' },
	{ value: 'custom', label: 'Regex personalizado' },
]

export function generateRegexPreview(matchType: MatchType, pattern: string): string {
	if (!pattern) return ''

	switch (matchType) {
		case 'contains':
			return `.*${pattern}.*`
		case 'starts_with':
			return `^${pattern}.*`
		case 'exact':
			return `^${pattern}$`
		case 'custom':
			return pattern
		default:
			return pattern
	}
}

export function PatternHelper({
	matchType,
	pattern,
	onMatchTypeChange,
	onPatternChange,
	error,
}: PatternHelperProps) {
	const regexPreview = useMemo(
		() => generateRegexPreview(matchType, pattern),
		[matchType, pattern]
	)

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
					Tipo de correspondencia *
				</label>
				<Select
					data-testid="match-type-selector"
					options={matchTypeOptions}
					value={matchType}
					onChange={(val) => onMatchTypeChange(val as MatchType)}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
					Padrao *
				</label>
				<Input
					data-testid="pattern-input"
					value={pattern}
					onChange={onPatternChange}
					placeholder={
						matchType === 'custom'
							? 'Digite a expressao regular'
							: 'Digite o texto para buscar'
					}
					error={error}
				/>
				{error && (
					<p data-testid="pattern-error" className="text-sm text-red-500 mt-1">
						{error}
					</p>
				)}
			</div>

			{regexPreview && (
				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
						Expressao regular gerada
					</label>
					<code
						data-testid="regex-preview"
						className="block p-2 bg-[var(--color-background)] rounded text-sm text-[var(--color-text-secondary)] font-mono"
					>
						{regexPreview}
					</code>
				</div>
			)}
		</div>
	)
}

export default PatternHelper
