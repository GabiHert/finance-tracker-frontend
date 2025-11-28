import { useState } from 'react'
import type { Transaction } from '../types'

export interface TransactionRowProps {
	transaction: Transaction
	isSelected: boolean
	onSelect: (id: string) => void
	onEdit: (transaction: Transaction) => void
	onDelete: (id: string) => void
}

function EditIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M11.3333 2.00004C11.5084 1.82494 11.7163 1.68605 11.9451 1.59129C12.1739 1.49653 12.4191 1.44775 12.6667 1.44775C12.9142 1.44775 13.1594 1.49653 13.3882 1.59129C13.617 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.383 14.4088 2.61182C14.5035 2.84063 14.5523 3.08581 14.5523 3.33337C14.5523 3.58094 14.5035 3.82612 14.4088 4.05493C14.314 4.28375 14.1751 4.49162 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

function DeleteIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M2 4H3.33333H14"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5.33334 4.00004V2.66671C5.33334 2.31309 5.47381 1.97395 5.72386 1.7239C5.97391 1.47385 6.31305 1.33337 6.66667 1.33337H9.33334C9.68696 1.33337 10.0261 1.47385 10.2762 1.7239C10.5262 1.97395 10.6667 2.31309 10.6667 2.66671V4.00004M12.6667 4.00004V13.3334C12.6667 13.687 12.5262 14.0261 12.2762 14.2762C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2762C3.47381 14.0261 3.33334 13.687 3.33334 13.3334V4.00004H12.6667Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export function TransactionRow({
	transaction,
	isSelected,
	onSelect,
	onEdit,
	onDelete,
}: TransactionRowProps) {
	const [isHovered, setIsHovered] = useState(false)

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(amount)
	}

	const handleClick = () => {
		onSelect(transaction.id)
	}

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation()
		onEdit(transaction)
	}

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation()
		onDelete(transaction.id)
	}

	return (
		<div
			data-testid="transaction-row"
			data-transaction-type={`transaction-row-${transaction.type}`}
			className={`
				flex items-center gap-4 p-4
				border-b border-[var(--color-neutral-200)]
				hover:bg-[var(--color-neutral-50)]
				transition-colors duration-150
				cursor-pointer
				${isSelected ? 'bg-[var(--color-primary-50)]' : ''}
			`.replace(/\s+/g, ' ').trim()}
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Checkbox */}
			<input
				type="checkbox"
				checked={isSelected}
				onChange={() => onSelect(transaction.id)}
				onClick={e => e.stopPropagation()}
				data-testid="transaction-checkbox"
				className="w-4 h-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
			/>

			{/* Category Icon */}
			<div
				data-testid="category-icon"
				className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
				style={{ backgroundColor: `${transaction.categoryColor}20` }}
			>
				{transaction.categoryIcon}
			</div>

			{/* Transaction Info */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<h3
						data-testid="transaction-description"
						className="font-medium text-[var(--color-text)] truncate"
					>
						{transaction.description}
					</h3>
					<span
						data-testid="transaction-category"
						className="text-sm text-[var(--color-neutral-500)]"
					>
						{transaction.categoryName}
					</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-[var(--color-neutral-500)]">
					<span data-testid="transaction-date">{transaction.date}</span>
					{transaction.notes && (
						<>
							<span>•</span>
							<span
								data-testid="transaction-notes"
								className="truncate"
								title={transaction.notes}
							>
								{transaction.notes}
							</span>
						</>
					)}
				</div>
			</div>

			{/* Amount */}
			<div
				data-testid="transaction-amount"
				className={`
					text-lg font-semibold
					${transaction.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}
				`.replace(/\s+/g, ' ').trim()}
			>
				{transaction.type === 'expense' ? '-' : ''}
				{formatCurrency(transaction.amount)}
			</div>

			{/* Action Buttons */}
			<div
				className={`
					flex items-center gap-2
					transition-opacity duration-150
					${isHovered ? 'opacity-100' : 'opacity-0'}
				`.replace(/\s+/g, ' ').trim()}
			>
				<button
					type="button"
					onClick={handleEdit}
					data-testid="transaction-edit-btn"
					className="p-2 text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] rounded-[var(--radius-sm)] transition-colors"
					aria-label="Edit transaction"
				>
					<EditIcon />
				</button>
				<button
					type="button"
					onClick={handleDelete}
					data-testid="transaction-delete-btn"
					className="p-2 text-[var(--color-neutral-500)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-50)] rounded-[var(--radius-sm)] transition-colors"
					aria-label="Delete transaction"
				>
					<DeleteIcon />
				</button>
			</div>
		</div>
	)
}

export default TransactionRow
