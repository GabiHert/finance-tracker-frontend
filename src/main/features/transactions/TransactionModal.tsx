import { useState, useEffect } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { Input } from '@main/components/ui/Input'
import { Select, type SelectOption } from '@main/components/ui/Select'
import { CurrencyInput } from '@main/components/ui/CurrencyInput'
import { DatePicker } from '@main/components/ui/DatePicker'
import type { Transaction, TransactionFormData, TransactionType } from './types'

export interface TransactionModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: TransactionFormData) => void
	transaction?: Transaction | null
	categoryOptions: SelectOption[]
}

export function TransactionModal({
	isOpen,
	onClose,
	onSave,
	transaction,
	categoryOptions,
}: TransactionModalProps) {
	const [formData, setFormData] = useState<TransactionFormData>({
		date: new Date().toLocaleDateString('pt-BR'),
		description: '',
		amount: 0,
		type: 'expense',
		categoryId: '',
		notes: '',
	})

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (transaction) {
			setFormData({
				date: transaction.date,
				description: transaction.description,
				amount: transaction.amount,
				type: transaction.type,
				categoryId: transaction.categoryId,
				notes: transaction.notes || '',
			})
		} else {
			setFormData({
				date: new Date().toLocaleDateString('pt-BR'),
				description: '',
				amount: 0,
				type: 'expense',
				categoryId: '',
				notes: '',
			})
		}
		setErrors({})
	}, [transaction, isOpen])

	const typeOptions: SelectOption[] = [
		{ value: 'expense', label: 'Expense' },
		{ value: 'income', label: 'Income' },
	]

	// Filter categories by type
	const filteredCategoryOptions = categoryOptions.filter(cat => {
		// In a real app, categories would have a type field
		// For now, we'll show all categories
		return true
	})

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.description.trim()) {
			newErrors.description = 'Description is required'
		}

		if (formData.amount <= 0) {
			newErrors.amount = 'Amount must be greater than zero'
		}

		if (!formData.categoryId) {
			newErrors.category = 'Category is required'
		}

		if (!formData.date) {
			newErrors.date = 'Date is required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async () => {
		if (!validate()) return

		setIsLoading(true)
		try {
			await new Promise(resolve => setTimeout(resolve, 500))
			onSave(formData)
			onClose()
		} catch (error) {
			setErrors({ form: 'Failed to save transaction' })
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={transaction ? 'Edit Transaction' : 'Add Transaction'}
			size="md"
			data-testid="transaction-modal"
		>
			<div className="space-y-4">
				{/* Date */}
				<DatePicker
					label="Date"
					value={formData.date}
					onChange={value => setFormData({ ...formData, date: value })}
					error={errors.date}
					data-testid="transaction-date"
				/>

				{/* Description */}
				<Input
					label="Description"
					value={formData.description}
					onChange={value => setFormData({ ...formData, description: value })}
					error={errors.description}
					data-testid="transaction-description"
					placeholder="Enter description"
					required
				/>

				{/* Amount */}
				<CurrencyInput
					label="Amount"
					value={formData.amount}
					onChange={value => setFormData({ ...formData, amount: value })}
					error={errors.amount}
					data-testid="transaction-amount"
					required
				/>

				{/* Type */}
				<div>
					<label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
						Type
					</label>
					<Select
						options={typeOptions}
						value={formData.type}
						onChange={value => setFormData({ ...formData, type: value as TransactionType, categoryId: '' })}
						data-testid="transaction-type"
					/>
				</div>

				{/* Category */}
				<div>
					<label className="block mb-2 text-sm font-medium text-[var(--color-text)]">
						Category
					</label>
					<Select
						options={filteredCategoryOptions}
						value={formData.categoryId}
						onChange={value => setFormData({ ...formData, categoryId: value as string })}
						error={errors.category}
						data-testid="transaction-category"
						placeholder="Select category"
					/>
					{errors.category && (
						<p
							className="mt-1 text-sm text-[var(--color-error)]"
							data-testid="transaction-category-error"
						>
							{errors.category}
						</p>
					)}
				</div>

				{/* Notes */}
				<div>
					<label
						htmlFor="transaction-notes"
						className="block mb-2 text-sm font-medium text-[var(--color-text)]"
					>
						Notes (optional)
					</label>
					<textarea
						id="transaction-notes"
						value={formData.notes}
						onChange={e => setFormData({ ...formData, notes: e.target.value })}
						data-testid="transaction-notes"
						placeholder="Add any additional notes..."
						rows={3}
						className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
					/>
				</div>

				{/* Form Error */}
				{errors.form && (
					<p
						className="text-sm text-[var(--color-error)]"
						data-testid="form-error"
						role="alert"
					>
						{errors.form}
					</p>
				)}
			</div>

			{/* Footer */}
			<div className="flex justify-end gap-3 mt-6">
				<Button
					variant="outline"
					onClick={onClose}
					disabled={isLoading}
					data-testid="modal-cancel-btn"
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={isLoading}
					data-testid="modal-save-btn"
				>
					{isLoading ? (
						<>
							<span data-testid="loading-spinner" className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
							Saving...
						</>
					) : (
						'Save'
					)}
				</Button>
			</div>
		</Modal>
	)
}

export default TransactionModal
