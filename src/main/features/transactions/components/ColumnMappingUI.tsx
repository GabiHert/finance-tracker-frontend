import { useMemo } from 'react'

export type ColumnMappingField = 'date' | 'description' | 'amount' | ''

export interface ColumnMapping {
	[csvColumn: string]: ColumnMappingField
}

interface ColumnMappingUIProps {
	csvHeaders: string[]
	mapping: ColumnMapping
	onMappingChange: (mapping: ColumnMapping) => void
	error?: string
}

const FIELD_OPTIONS = [
	{ value: '', label: 'Selecione...' },
	{ value: 'date', label: 'Data' },
	{ value: 'description', label: 'Descricao' },
	{ value: 'amount', label: 'Valor' },
]

export function ColumnMappingUI({
	csvHeaders,
	mapping,
	onMappingChange,
	error,
}: ColumnMappingUIProps) {
	const handleFieldChange = (csvColumn: string, field: ColumnMappingField) => {
		const newMapping = { ...mapping }

		// Clear previous mapping for this field (if another column had it)
		if (field) {
			Object.keys(newMapping).forEach(col => {
				if (newMapping[col] === field && col !== csvColumn) {
					newMapping[col] = ''
				}
			})
		}

		newMapping[csvColumn] = field
		onMappingChange(newMapping)
	}

	// Check which fields are already mapped to disable them in other dropdowns
	const mappedFields = useMemo(() => {
		const fields = new Set<string>()
		Object.values(mapping).forEach(field => {
			if (field) fields.add(field)
		})
		return fields
	}, [mapping])

	return (
		<div data-testid="column-mapping-container" className="mt-4 p-4 bg-[var(--color-neutral-50)] rounded-lg border border-[var(--color-neutral-200)]">
			<h4 data-testid="column-mapping-header" className="font-medium text-[var(--color-text)] mb-3">
				Mapeamento de Colunas
			</h4>
			<p className="text-sm text-[var(--color-neutral-600)] mb-4">
				Associe cada coluna do CSV ao campo correspondente:
			</p>

			<div className="space-y-3">
				{csvHeaders.map((header, index) => (
					<div
						key={header}
						data-testid={`mapping-row-${index}`}
						className="flex items-center gap-4"
					>
						<div
							data-testid={`csv-column-name-${index}`}
							className="flex-1 px-3 py-2 bg-white border border-[var(--color-neutral-200)] rounded text-sm text-[var(--color-text)] truncate"
							title={header}
						>
							{header}
						</div>
						<div className="text-[var(--color-neutral-400)]">
							&rarr;
						</div>
						<select
							data-testid={`field-dropdown-${index}`}
							value={mapping[header] || ''}
							onChange={e => handleFieldChange(header, e.target.value as ColumnMappingField)}
							className="flex-1 px-3 py-2 border border-[var(--color-neutral-200)] rounded text-sm text-[var(--color-text)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
						>
							{FIELD_OPTIONS.map(option => (
								<option
									key={option.value}
									value={option.value}
									disabled={option.value !== '' && option.value !== mapping[header] && mappedFields.has(option.value)}
								>
									{option.label}
									{option.value && option.value !== mapping[header] && mappedFields.has(option.value) ? ' (usado)' : ''}
								</option>
							))}
						</select>
					</div>
				))}
			</div>

			{error && (
				<div
					data-testid="column-mapping-error"
					className="mt-4 p-3 bg-[var(--color-error-50)] border border-[var(--color-error-200)] rounded text-sm text-[var(--color-error)]"
				>
					{error}
				</div>
			)}

			{!error && mappedFields.has('date') && mappedFields.has('description') && mappedFields.has('amount') && (
				<div
					data-testid="column-mapping-success"
					className="mt-4 p-3 bg-[var(--color-success-50)] border border-[var(--color-success-200)] rounded text-sm text-[var(--color-success)]"
				>
					Todos os campos obrigatorios foram mapeados
				</div>
			)}
		</div>
	)
}

export function validateColumnMapping(mapping: ColumnMapping): string | null {
	const mappedFields = new Set(Object.values(mapping).filter(Boolean))

	if (!mappedFields.has('date')) {
		return "Campo 'Data' e obrigatorio"
	}
	if (!mappedFields.has('description')) {
		return "Campo 'Descricao' e obrigatorio"
	}
	if (!mappedFields.has('amount')) {
		return "Campo 'Valor' e obrigatorio"
	}

	return null
}

export function extractCSVHeaders(content: string): string[] {
	const lines = content.trim().split('\n')
	if (lines.length < 1) return []

	return lines[0].split(',').map(h => h.trim())
}

export default ColumnMappingUI
