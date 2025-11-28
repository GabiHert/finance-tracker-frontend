import { useState, useEffect } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { Input } from '@main/components/ui/Input'
import { Select } from '@main/components/ui/Select'
import { IconPicker } from '@main/components/ui/IconPicker'
import { ColorPicker } from '@main/components/ui/ColorPicker'
import type { Category, CategoryType, CreateCategoryInput } from './types'

interface CategoryModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: CreateCategoryInput) => void
	category?: Category | null
}

const typeOptions = [
	{ value: 'expense', label: 'Expense' },
	{ value: 'income', label: 'Income' },
]

export function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
	const [name, setName] = useState('')
	const [icon, setIcon] = useState('wallet')
	const [color, setColor] = useState('#3B82F6')
	const [type, setType] = useState<CategoryType>('expense')
	const [description, setDescription] = useState('')
	const [errors, setErrors] = useState<Record<string, string>>({})

	const isEditing = !!category

	// Initialize/reset form state when category or modal open state changes
	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (category) {
			setName(category.name)
			setIcon(category.icon)
			setColor(category.color)
			setType(category.type)
			setDescription(category.description || '')
		} else {
			setName('')
			setIcon('wallet')
			setColor('#3B82F6')
			setType('expense')
			setDescription('')
		}
		setErrors({})
	}, [category, isOpen])
	/* eslint-enable react-hooks/set-state-in-effect */

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!name.trim()) {
			newErrors.name = 'Name is required'
		} else if (name.length < 2) {
			newErrors.name = 'Name must be at least 2 characters'
		} else if (name.length > 50) {
			newErrors.name = 'Name must be less than 50 characters'
		}

		if (!icon) {
			newErrors.icon = 'Icon is required'
		}

		if (!color) {
			newErrors.color = 'Color is required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = () => {
		if (!validate()) return

		onSave({
			name: name.trim(),
			icon,
			color,
			type,
			description: description.trim() || undefined,
		})
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEditing ? 'Edit Category' : 'New Category'}
			size="md"
			data-testid="category-modal"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} data-testid="save-category-btn">
						{isEditing ? 'Save Changes' : 'Create Category'}
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<div data-testid="category-modal-title" className="sr-only">
					{isEditing ? 'Edit Category' : 'New Category'}
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
						Name *
					</label>
					<Input
						data-testid="category-name-input"
						value={name}
						onChange={setName}
						placeholder="Enter category name"
						error={errors.name}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
						Type *
					</label>
					<Select
						data-testid="category-type-select"
						options={typeOptions}
						value={type}
						onChange={(val) => setType(val as CategoryType)}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
						Icon *
					</label>
					<IconPicker
						data-testid="category-icon-picker"
						value={icon}
						onChange={setIcon}
					/>
					{errors.icon && (
						<p className="text-sm text-red-500 mt-1">{errors.icon}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
						Color *
					</label>
					<ColorPicker
						data-testid="category-color-picker"
						value={color}
						onChange={setColor}
						showPreview={false}
					/>
					{errors.color && (
						<p className="text-sm text-red-500 mt-1">{errors.color}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
						Description
					</label>
					<Input
						data-testid="category-description-input"
						value={description}
						onChange={setDescription}
						placeholder="Optional description"
					/>
				</div>
			</div>
		</Modal>
	)
}

export default CategoryModal
