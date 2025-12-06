import { useState } from 'react'
import type { Transaction } from '../types'
import { getIconComponent } from '@main/components/ui/IconPicker'
import { CreditCardBadge } from '@main/features/credit-card/components/CreditCardBadge'

export interface TransactionRowProps {
	transaction: Transaction
	isSelected: boolean
	onSelect: (id: string) => void
	onEdit: (transaction: Transaction) => void
	onDelete: (id: string) => void
	onCollapse?: (id: string) => void
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

function CollapseIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M4 6L8 10L12 6"
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
	onCollapse,
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

	const handleCollapse = (e: React.MouseEvent) => {
		e.stopPropagation()
		onCollapse?.(transaction.id)
	}

	const isExpandedBill = transaction.isExpandedBill

	return (
		<div
			data-testid={isExpandedBill ? 'expanded-bill' : 'transaction-row'}
			data-transaction-type={`transaction-row-${transaction.type}`}
			className={`
				flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4
				border-b border-[var(--color-border)]
				hover:bg-[var(--color-surface)]
				transition-colors duration-150
				cursor-pointer
				${isSelected ? 'bg-[var(--color-primary-50)]' : ''}
				${isExpandedBill ? 'bg-[var(--color-surface)] opacity-70' : ''}
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
				className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] mt-1 sm:mt-0"
			/>

			{/* Category Icon */}
			{(() => {
				const IconComponent = getIconComponent(transaction.categoryIcon || 'folder')
				return (
					<div
						data-testid="category-icon"
						className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
						style={{
							backgroundColor: `${transaction.categoryColor}20`,
							color: transaction.categoryColor,
						}}
					>
						<IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
					</div>
				)
			})()}

			{/* Transaction Info */}
			<div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
				{/* Left side: Description and details */}
				<div className="flex-1 min-w-0">
					{/* Description row */}
					<div className="flex items-center gap-2 flex-wrap">
						<h3
							data-testid="transaction-description"
							className="font-medium text-[var(--color-text)] text-sm sm:text-base truncate max-w-[180px] sm:max-w-none"
						>
							{transaction.description}
						</h3>
						<span
							data-testid="transaction-category"
							className="text-xs sm:text-sm text-[var(--color-text-secondary)] hidden sm:inline"
						>
							{transaction.categoryName}
						</span>
					</div>
					{/* Date/notes row + badges on mobile */}
					<div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-text-secondary)] flex-wrap mt-0.5">
						<span data-testid="transaction-date">{transaction.date}</span>
						{/* Show category on mobile in the second row */}
						<span className="sm:hidden">• {transaction.categoryName}</span>
						{transaction.notes && (
							<>
								<span className="hidden sm:inline">•</span>
								<span
									data-testid="transaction-notes"
									className="truncate hidden sm:inline"
									title={transaction.notes}
								>
									{transaction.notes}
								</span>
							</>
						)}
						{/* CC Badge - move to second row for mobile */}
						{(transaction.billingCycle || transaction.installmentCurrent || transaction.isExpandedBill) && (
							<CreditCardBadge
								billingCycle={transaction.billingCycle}
								hasInstallment={!!transaction.installmentCurrent}
								installmentCurrent={transaction.installmentCurrent}
								installmentTotal={transaction.installmentTotal}
								isExpanded={transaction.isExpandedBill}
								linkedCount={transaction.linkedTransactionCount}
							/>
						)}
					</div>
				</div>

				{/* Amount - aligned right */}
				<div
					data-testid="transaction-amount"
					className={`
						text-base sm:text-lg font-semibold whitespace-nowrap
						${transaction.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}
					`.replace(/\s+/g, ' ').trim()}
				>
					{transaction.type === 'expense' ? '-' : ''}
					{formatCurrency(transaction.amount)}
				</div>
			</div>

			{/* Action Buttons - always visible on mobile via touch */}
			<div
				className={`
					flex items-center gap-1 sm:gap-2
					transition-opacity duration-150
					${isHovered || isExpandedBill ? 'opacity-100' : 'sm:opacity-0 opacity-100'}
				`.replace(/\s+/g, ' ').trim()}
			>
				{isExpandedBill && onCollapse && (
					<button
						type="button"
						onClick={handleCollapse}
						data-testid="collapse-btn"
						className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-warning)] hover:bg-[var(--color-warning-50)] rounded-[var(--radius-sm)] transition-colors"
						aria-label="Collapse expanded bill"
						title="Recolher fatura expandida"
					>
						<CollapseIcon />
					</button>
				)}
				<button
					type="button"
					onClick={handleEdit}
					data-testid="transaction-edit-btn"
					className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] rounded-[var(--radius-sm)] transition-colors"
					aria-label="Edit transaction"
				>
					<EditIcon />
				</button>
				<button
					type="button"
					onClick={handleDelete}
					data-testid="transaction-delete-btn"
					className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-50)] rounded-[var(--radius-sm)] transition-colors"
					aria-label="Delete transaction"
				>
					<DeleteIcon />
				</button>
			</div>
		</div>
	)
}

export default TransactionRow
