import { useState, useCallback, useEffect } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { Input } from '@main/components/ui/Input'
import { Select } from '@main/components/ui/Select'
import { ColorPicker } from '@main/components/ui/ColorPicker'
import { IconPicker } from '@main/components/ui/IconPicker'
import type { AISuggestion, EditSuggestionInput, MatchType, CategorySuggestionType } from '../types'
import type { Category } from '@main/features/categories'

interface EditSuggestionModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (id: string, edits: EditSuggestionInput) => void
	suggestion: AISuggestion | null
	categories: Category[]
	isSaving?: boolean
}

const matchTypeOptions = [
	{ value: 'contains', label: 'Contem' },
	{ value: 'startsWith', label: 'Comeca com' },
	{ value: 'exact', label: 'Exato' },
]

const categoryTypeOptions = [
	{ value: 'existing', label: 'Categoria existente' },
	{ value: 'new', label: 'Nova categoria' },
]

export function EditSuggestionModal({
	isOpen,
	onClose,
	onSave,
	suggestion,
	categories,
	isSaving = false,
}: EditSuggestionModalProps) {
	const [categoryType, setCategoryType] = useState<CategorySuggestionType>('existing')
	const [existingCategoryId, setExistingCategoryId] = useState<string>('')
	const [newCategoryName, setNewCategoryName] = useState('')
	const [newCategoryIcon, setNewCategoryIcon] = useState('')
	const [newCategoryColor, setNewCategoryColor] = useState('#6B7280')
	const [matchType, setMatchType] = useState<MatchType>('contains')
	const [keyword, setKeyword] = useState('')

	useEffect(() => {
		if (suggestion) {
			setCategoryType(suggestion.category.type)
			if (suggestion.category.type === 'existing' && suggestion.category.existingId) {
				setExistingCategoryId(suggestion.category.existingId)
			} else {
				setExistingCategoryId('')
			}
			setNewCategoryName(suggestion.category.newName || '')
			setNewCategoryIcon(suggestion.category.newIcon || '')
			setNewCategoryColor(suggestion.category.newColor || '#6B7280')
			setMatchType(suggestion.match.type)
			setKeyword(suggestion.match.keyword)
		}
	}, [suggestion])

	const handleSave = useCallback(() => {
		if (!suggestion) return

		const edits: EditSuggestionInput = {
			category: {
				type: categoryType,
				existingId: categoryType === 'existing' ? existingCategoryId : undefined,
				newName: categoryType === 'new' ? newCategoryName : undefined,
				newIcon: categoryType === 'new' ? newCategoryIcon : undefined,
				newColor: categoryType === 'new' ? newCategoryColor : undefined,
			},
			match: {
				type: matchType,
				keyword,
			},
		}

		onSave(suggestion.id, edits)
	}, [
		suggestion,
		categoryType,
		existingCategoryId,
		newCategoryName,
		newCategoryIcon,
		newCategoryColor,
		matchType,
		keyword,
		onSave,
	])

	const isValid = useCallback(() => {
		if (!keyword.trim()) return false
		if (categoryType === 'existing' && !existingCategoryId) return false
		if (categoryType === 'new' && !newCategoryName.trim()) return false
		return true
	}, [categoryType, existingCategoryId, newCategoryName, keyword])

	const categoryOptions = categories.map(cat => ({
		value: cat.id,
		label: cat.name,
	}))

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Editar Sugestao"
			size="md"
			data-testid="edit-suggestion-modal"
			footer={
				<>
					<Button
						variant="secondary"
						onClick={onClose}
						disabled={isSaving}
					>
						Cancelar
					</Button>
					<Button
						data-testid="save-suggestion-btn"
						variant="primary"
						onClick={handleSave}
						disabled={isSaving || !isValid()}
					>
						{isSaving ? 'Salvando...' : 'Salvar e Aprovar'}
					</Button>
				</>
			}
		>
			<div className="space-y-6">
				{/* Category Section */}
				<div>
					<h3 className="text-sm font-medium text-[var(--color-text)] mb-3">
						Categoria
					</h3>

					<div className="space-y-4">
						<Select
							data-testid="category-type-select"
							label="Tipo de categoria"
							options={categoryTypeOptions}
							value={categoryType}
							onChange={(value) => setCategoryType(value as CategorySuggestionType)}
						/>

						{categoryType === 'existing' ? (
							<Select
								data-testid="existing-category-select"
								label="Selecione a categoria"
								options={categoryOptions}
								value={existingCategoryId}
								onChange={(value) => setExistingCategoryId(value as string)}
								placeholder="Selecione uma categoria"
								searchable
							/>
						) : (
							<div className="space-y-4">
								<Input
									data-testid="new-category-name"
									label="Nome da categoria"
									value={newCategoryName}
									onChange={setNewCategoryName}
									placeholder="Ex: Supermercado"
								/>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
											Icone
										</label>
										<IconPicker
											data-testid="new-category-icon"
											value={newCategoryIcon}
											onChange={setNewCategoryIcon}
										/>
									</div>

									<div>
										<label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
											Cor
										</label>
										<ColorPicker
											data-testid="new-category-color"
											value={newCategoryColor}
											onChange={setNewCategoryColor}
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Match Rule Section */}
				<div>
					<h3 className="text-sm font-medium text-[var(--color-text)] mb-3">
						Regra de Correspondencia
					</h3>

					<div className="space-y-4">
						<Select
							data-testid="match-type-select"
							label="Tipo de correspondencia"
							options={matchTypeOptions}
							value={matchType}
							onChange={(value) => setMatchType(value as MatchType)}
						/>

						<Input
							data-testid="match-keyword-input"
							label="Palavra-chave"
							value={keyword}
							onChange={setKeyword}
							placeholder="Ex: MERCADO"
						/>
					</div>
				</div>

				{/* Preview */}
				{suggestion && (
					<div className="p-4 bg-[var(--color-background)] rounded-lg">
						<p className="text-sm text-[var(--color-text-secondary)]">
							Esta regra afetara{' '}
							<span className="font-medium text-[var(--color-text)]">
								{suggestion.affectedCount}
							</span>{' '}
							{suggestion.affectedCount === 1 ? 'transacao' : 'transacoes'}.
						</p>
					</div>
				)}
			</div>
		</Modal>
	)
}

export default EditSuggestionModal
