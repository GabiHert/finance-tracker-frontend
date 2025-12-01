import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@main/components/ui/Button'
import { Modal } from '@main/components/ui/Modal'
import { useToast } from '@main/components/layout/Toast'
import { FilterBar } from './components/FilterBar'
import { TransactionRow } from './components/TransactionRow'
import { ImportWizard } from './components/ImportWizard'
import { BulkCategorizeModal } from './components/BulkCategorizeModal'
import { TransactionModal } from './TransactionModal'
import {
	fetchTransactions,
	createTransaction,
	updateTransaction,
	deleteTransaction as deleteTransactionApi,
	bulkDeleteTransactions,
	bulkCategorizeTransactions,
	type FetchTransactionsResult,
} from './api/transactions'
import type { Transaction, TransactionFilters, TransactionFormData } from './types'
import { fetchCategories } from '@main/features/categories/api/categories'
import type { Category } from '@main/features/categories/types'

export function TransactionsScreen() {
	const [searchParams] = useSearchParams()
	const isEmpty = searchParams.get('empty') === 'true'
	const { showToast } = useToast()

	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [isLoading, setIsLoading] = useState(!isEmpty)
	const [error, setError] = useState<string | null>(null)
	const [totals, setTotals] = useState({ income: 0, expense: 0, net: 0 })
	const [filters, setFilters] = useState<TransactionFilters>({
		search: '',
		startDate: '',
		endDate: '',
		categoryId: '',
		type: 'all',
	})
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
	const [showBulkDeleteConfirmation, setShowBulkDeleteConfirmation] = useState(false)
	const [showBulkCategorizeModal, setShowBulkCategorizeModal] = useState(false)
	const [isImportModalOpen, setIsImportModalOpen] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [categories, setCategories] = useState<Category[]>([])

	// Load categories from API
	const loadCategories = useCallback(async () => {
		try {
			const fetchedCategories = await fetchCategories()
			setCategories(fetchedCategories)
		} catch (err) {
			console.error('Error loading categories:', err)
		}
	}, [])

	// Load transactions from API
	const loadTransactions = useCallback(async () => {
		if (isEmpty) return

		setIsLoading(true)
		setError(null)
		try {
			const result = await fetchTransactions({
				type: filters.type === 'all' ? undefined : filters.type,
				categoryId: filters.categoryId || undefined,
				search: filters.search || undefined,
				startDate: filters.startDate || undefined,
				endDate: filters.endDate || undefined,
			})
			setTransactions(result.transactions)
			setTotals(result.totals)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar transacoes')
			console.error('Error loading transactions:', err)
		} finally {
			setIsLoading(false)
		}
	}, [isEmpty, filters])

	useEffect(() => {
		loadTransactions()
	}, [loadTransactions])

	useEffect(() => {
		loadCategories()
	}, [loadCategories])

	// Filter transactions locally for search (API handles type and category filters)
	const filteredTransactions = useMemo(() => {
		// Most filtering is done server-side, but we can do local search for responsiveness
		if (!filters.search) return transactions
		return transactions.filter(t => {
			return (
				t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
				t.categoryName.toLowerCase().includes(filters.search.toLowerCase())
			)
		})
	}, [transactions, filters.search])

	// Group by date
	const groupedTransactions = useMemo(() => {
		const groups: Record<string, { date: string; transactions: Transaction[]; total: number }> = {}

		filteredTransactions.forEach(t => {
			if (!groups[t.date]) {
				groups[t.date] = { date: t.date, transactions: [], total: 0 }
			}
			groups[t.date].transactions.push(t)
			groups[t.date].total += t.type === 'income' ? t.amount : -t.amount
		})

		return Object.values(groups).sort((a, b) => {
			// Sort by date descending
			const [dayA, monthA, yearA] = a.date.split('/')
			const [dayB, monthB, yearB] = b.date.split('/')
			const dateA = new Date(Number(yearA), Number(monthA) - 1, Number(dayA))
			const dateB = new Date(Number(yearB), Number(monthB) - 1, Number(dayB))
			return dateB.getTime() - dateA.getTime()
		})
	}, [filteredTransactions])

	// Use API-provided totals (or calculate from local data if needed)
	const summary = useMemo(() => {
		// Use totals from API response
		if (totals.income > 0 || totals.expense > 0) {
			return totals
		}
		// Fallback: calculate from local data
		return filteredTransactions.reduce(
			(acc, t) => {
				if (t.type === 'income') {
					acc.income += t.amount
				} else {
					acc.expense += t.amount
				}
				acc.net = acc.income - acc.expense
				return acc
			},
			{ income: 0, expense: 0, net: 0 }
		)
	}, [filteredTransactions, totals])

	// Category options for filters and modal
	const categoryOptions = useMemo(() => {
		return categories.map(c => ({
			value: c.id,
			label: c.name,
			icon: c.icon,
		}))
	}, [categories])

	// Selected transaction descriptions for bulk categorize preview
	const selectedTransactionDescriptions = useMemo(() => {
		return transactions
			.filter(t => selectedIds.has(t.id))
			.map(t => t.description)
	}, [transactions, selectedIds])

	// Selection handlers
	const handleSelectAll = useCallback(() => {
		if (selectedIds.size === filteredTransactions.length) {
			setSelectedIds(new Set())
		} else {
			setSelectedIds(new Set(filteredTransactions.map(t => t.id)))
		}
	}, [filteredTransactions, selectedIds])

	const handleSelect = useCallback((id: string) => {
		setSelectedIds(prev => {
			const newSet = new Set(prev)
			if (newSet.has(id)) {
				newSet.delete(id)
			} else {
				newSet.add(id)
			}
			return newSet
		})
	}, [])

	const handleClearSelection = useCallback(() => {
		setSelectedIds(new Set())
	}, [])

	// Transaction handlers
	const handleAddTransaction = useCallback(() => {
		setSelectedTransaction(null)
		setIsModalOpen(true)
	}, [])

	const handleEditTransaction = useCallback((transaction: Transaction) => {
		setSelectedTransaction(transaction)
		setIsModalOpen(true)
	}, [])

	const handleDeleteTransaction = useCallback((id: string) => {
		setTransactionToDelete(id)
		setShowDeleteConfirmation(true)
	}, [])

	const confirmDelete = useCallback(async () => {
		if (!transactionToDelete) return

		setIsSaving(true)
		try {
			await deleteTransactionApi(transactionToDelete)
			showToast('success', 'Transacao excluida')
			setShowDeleteConfirmation(false)
			setTransactionToDelete(null)
			await loadTransactions()
		} catch (err) {
			showToast('error', err instanceof Error ? err.message : 'Erro ao excluir transacao')
		} finally {
			setIsSaving(false)
		}
	}, [transactionToDelete, loadTransactions, showToast])

	const handleBulkDelete = useCallback(() => {
		setShowBulkDeleteConfirmation(true)
	}, [])

	const handleBulkCategorize = useCallback(() => {
		setShowBulkCategorizeModal(true)
	}, [])

	const handleBulkCategorizeApply = useCallback(async (categoryId: string) => {
		setIsSaving(true)
		try {
			await bulkCategorizeTransactions(Array.from(selectedIds), categoryId)
			showToast('success', `${selectedIds.size} transacoes categorizadas`)
			setShowBulkCategorizeModal(false)
			setSelectedIds(new Set())
			await loadTransactions()
		} catch (err) {
			showToast('error', err instanceof Error ? err.message : 'Erro ao categorizar transacoes')
		} finally {
			setIsSaving(false)
		}
	}, [selectedIds, loadTransactions, showToast])

	const confirmBulkDelete = useCallback(async () => {
		setIsSaving(true)
		try {
			await bulkDeleteTransactions(Array.from(selectedIds))
			showToast('success', `${selectedIds.size} transacoes excluidas`)
			setShowBulkDeleteConfirmation(false)
			setSelectedIds(new Set())
			await loadTransactions()
		} catch (err) {
			showToast('error', err instanceof Error ? err.message : 'Erro ao excluir transacoes')
		} finally {
			setIsSaving(false)
		}
	}, [selectedIds, loadTransactions, showToast])

	const handleSaveTransaction = useCallback(async (data: TransactionFormData) => {
		setIsSaving(true)
		try {
			// Convert DD/MM/YYYY to YYYY-MM-DD for API
			const [day, month, year] = data.date.split('/')
			const apiDate = `${year}-${month}-${day}`

			const input = {
				date: apiDate,
				description: data.description,
				amount: data.amount,
				type: data.type,
				categoryId: data.categoryId || undefined,
				notes: data.notes,
			}

			if (selectedTransaction) {
				await updateTransaction(selectedTransaction.id, input)
				showToast('success', 'Transacao atualizada')
			} else {
				await createTransaction(input)
				showToast('success', 'Transacao criada')
			}
			setIsModalOpen(false)
			await loadTransactions()
		} catch (err) {
			showToast('error', err instanceof Error ? err.message : 'Erro ao salvar transacao')
		} finally {
			setIsSaving(false)
		}
	}, [selectedTransaction, loadTransactions, showToast])

	const handleImport = useCallback(() => {
		setIsImportModalOpen(true)
	}, [])

	const handleImportClose = useCallback(async () => {
		// Close modal FIRST, then load transactions
		// This prevents the modal from showing a fresh state when view switches
		// from empty to normal (which would remount the ImportWizard component)
		setIsImportModalOpen(false)
		await loadTransactions()
	}, [loadTransactions])

	const handleImportComplete = useCallback(async (importedTransactions: unknown[]) => {
		interface ImportedTransaction {
			date: string
			description: string
			amount: number
			type: 'income' | 'expense'
			categoryId?: string
		}

		const txns = importedTransactions as ImportedTransaction[]

		// Create all imported transactions via API
		for (const txn of txns) {
			await createTransaction({
				date: txn.date,
				description: txn.description,
				amount: txn.amount,
				type: txn.type,
				categoryId: txn.categoryId,
			})
		}
		// Note: Don't refresh here - it would unmount the empty state and reset the modal
		// The modal will close when user clicks "Done", then we refresh
	}, [])

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(amount)
	}

	// Render content based on state
	const renderContent = () => {
		// Loading skeleton
		if (isLoading) {
			return (
				<div className="min-h-screen bg-[var(--color-background)]">
					<div className="max-w-6xl mx-auto">
						<div className="p-6 border-b border-[var(--color-border)]">
							<h1 data-testid="transactions-header" className="text-2xl font-bold text-[var(--color-text)]">
								Transactions
							</h1>
						</div>
						<div data-testid="transactions-skeleton" className="p-6 space-y-4">
							{[...Array(5)].map((_, i) => (
								<div key={i}>
									<div
										data-testid="skeleton-date-header"
										className="h-6 w-32 bg-[var(--color-border)] rounded animate-pulse mb-2"
									/>
									{[...Array(3)].map((_, j) => (
										<div
											key={j}
											data-testid="skeleton-row"
											className="h-20 bg-[var(--color-surface)] rounded-lg mb-2 animate-pulse"
										/>
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			)
		}

		// Error state
		if (error) {
			return (
				<div className="min-h-screen bg-[var(--color-background)]">
					<div className="max-w-6xl mx-auto">
						<div className="p-6 border-b border-[var(--color-border)]">
							<h1 data-testid="transactions-header" className="text-2xl font-bold text-[var(--color-text)]">
								Transactions
							</h1>
						</div>
						<div data-testid="error-state" className="text-center py-12">
							<p className="text-[var(--color-error)] mb-4">{error}</p>
							<Button onClick={loadTransactions}>Tentar novamente</Button>
						</div>
					</div>
				</div>
			)
		}

		// Empty state
		if (transactions.length === 0) {
			return (
				<div className="min-h-screen bg-[var(--color-background)]">
					<div className="max-w-6xl mx-auto">
						{/* Header - same as normal state for consistency */}
						<div className="p-6 border-b border-[var(--color-border)]">
							<div className="flex items-center justify-between">
								<h1 data-testid="transactions-header" className="text-2xl font-bold text-[var(--color-text)]">
									Transactions
								</h1>
								<div className="flex gap-2">
									<Button variant="outline" onClick={handleImport} data-testid="import-transactions-btn">
										Import
									</Button>
									<Button onClick={handleAddTransaction} data-testid="add-transaction-btn">
										+ Add Transaction
									</Button>
								</div>
							</div>
						</div>

						{/* Empty state content */}
						<div data-testid="empty-state" className="text-center py-20">
							<div
								data-testid="empty-state-icon"
								className="w-20 h-20 mx-auto mb-6 bg-[var(--color-surface)] rounded-full flex items-center justify-center text-4xl"
							>
								💸
							</div>
							<h3
								data-testid="empty-state-title"
								className="text-2xl font-bold text-[var(--color-text)] mb-2"
							>
								No transactions yet
							</h3>
							<p
								data-testid="empty-state-description"
								className="text-[var(--color-text-secondary)] mb-6"
							>
								Start tracking your finances by adding your first transaction or importing from a file
							</p>
							<p className="text-[var(--color-text-secondary)] text-sm">
								Use the buttons above to get started
							</p>
						</div>
					</div>
				</div>
			)
		}

		// Filter empty state
		if (filteredTransactions.length === 0) {
			return (
				<div className="min-h-screen bg-[var(--color-background)]">
					<div className="max-w-6xl mx-auto">
						{/* Header */}
						<div className="p-6 border-b border-[var(--color-border)]">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h1 data-testid="transactions-header" className="text-2xl font-bold text-[var(--color-text)]">
										Transactions
									</h1>
									<p data-testid="transactions-count" className="text-[var(--color-text-secondary)]">
										{transactions.length} total transactions
									</p>
								</div>
								<Button onClick={handleAddTransaction} data-testid="add-transaction-btn">
									+ Add Transaction
								</Button>
							</div>
						</div>

						{/* Filters */}
						<FilterBar
							filters={filters}
							onFiltersChange={setFilters}
							categoryOptions={categoryOptions}
						/>

						{/* Filter Empty State */}
						<div data-testid="filter-empty-state" className="text-center py-20">
							<div className="text-4xl mb-4">🔍</div>
							<h3
								data-testid="filter-empty-state-title"
								className="text-xl font-bold text-[var(--color-text)] mb-2"
							>
								No transactions found
							</h3>
							<p
								data-testid="filter-empty-state-description"
								className="text-[var(--color-text-secondary)] mb-4"
							>
								Try adjusting your filters to see more results
							</p>
							<Button
								variant="outline"
								onClick={() => setFilters({ search: '', startDate: '', endDate: '', categoryId: '', type: 'all' })}
								data-testid="filter-empty-state-clear"
							>
								Clear Filters
							</Button>
						</div>
					</div>
				</div>
			)
		}

		// Normal state with transactions
		return (
			<div className="min-h-screen bg-[var(--color-background)]">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div data-testid="transactions-header-container" className="p-6 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h1 data-testid="transactions-header" className="text-2xl font-bold text-[var(--color-text)]">
									Transactions
								</h1>
								<p data-testid="transactions-count" className="text-[var(--color-text-secondary)]">
									{filteredTransactions.length} transactions
								</p>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" onClick={handleImport} data-testid="import-transactions-btn">
									Import
								</Button>
								<Button onClick={handleAddTransaction} data-testid="add-transaction-btn">
									+ Add Transaction
								</Button>
							</div>
						</div>

						{/* Summary */}
						<div data-testid="total-summary" className="grid grid-cols-3 gap-4 mt-4">
							<div className="p-4 bg-[var(--color-success-50)] rounded-lg">
								<p className="text-sm text-[var(--color-text-secondary)] mb-1">Income</p>
								<p data-testid="income-total" className="text-xl font-bold text-[var(--color-success)]">
									{formatCurrency(summary.income)}
								</p>
							</div>
							<div className="p-4 bg-[var(--color-error-50)] rounded-lg">
								<p className="text-sm text-[var(--color-text-secondary)] mb-1">Expense</p>
								<p data-testid="expense-total" className="text-xl font-bold text-[var(--color-error)]">
									{formatCurrency(summary.expense)}
								</p>
							</div>
							<div className="p-4 bg-[var(--color-primary-50)] rounded-lg">
								<p className="text-sm text-[var(--color-text-secondary)] mb-1">Net</p>
								<p
									data-testid="net-total"
									className={`text-xl font-bold ${summary.net >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}
								>
									{formatCurrency(summary.net)}
								</p>
							</div>
						</div>
					</div>

					{/* Filters */}
					<FilterBar
						filters={filters}
						onFiltersChange={setFilters}
						categoryOptions={categoryOptions}
					/>

					{/* Bulk Actions Bar */}
					{selectedIds.size > 0 && (
						<div
							data-testid="bulk-actions-bar"
							className="p-4 bg-[var(--color-primary-50)] border-b border-[var(--color-primary-100)] flex items-center justify-between"
						>
							<div className="flex items-center gap-4">
								<span data-testid="bulk-selected-count" className="font-medium text-[var(--color-text)]">
									{selectedIds.size} selected
								</span>
								<Button variant="outline" size="sm" onClick={handleClearSelection} data-testid="bulk-clear-selection">
									Clear
								</Button>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={handleBulkCategorize} data-testid="bulk-edit-category-btn">
									Change Category
								</Button>
								<Button variant="outline" size="sm" data-testid="bulk-export-btn">
									Export
								</Button>
								<Button variant="outline" size="sm" onClick={handleBulkDelete} data-testid="bulk-delete-btn">
									Delete
								</Button>
							</div>
						</div>
					)}

					{/* Transactions List */}
					<div data-testid="transactions-list-container" className="bg-[var(--color-surface)]">
						{/* Select All */}
						<div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
							<input
								type="checkbox"
								checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
								onChange={handleSelectAll}
								data-testid="select-all-transactions"
								className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
							/>
							<span className="text-sm font-medium text-[var(--color-text-secondary)]">
								Select All
							</span>
						</div>

						{/* Grouped Transactions */}
						{groupedTransactions.map(group => (
							<div key={group.date} data-testid="transaction-date-group" className="border-b border-[var(--color-border)] last:border-b-0">
								{/* Date Header */}
								<div className="p-4 bg-[var(--color-surface)] flex items-center justify-between">
									<h3 data-testid="transaction-date-header" className="font-semibold text-[var(--color-text)]">
										{group.date}
									</h3>
									<span
										data-testid="daily-total"
										className={`font-semibold ${group.total >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}
									>
										{formatCurrency(group.total)}
									</span>
								</div>

								{/* Transactions */}
								{group.transactions.map(transaction => (
									<TransactionRow
										key={transaction.id}
										transaction={transaction}
										isSelected={selectedIds.has(transaction.id)}
										onSelect={handleSelect}
										onEdit={handleEditTransaction}
										onDelete={handleDeleteTransaction}
									/>
								))}
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}

	// Single return with all modals rendered outside conditional content
	// This prevents ImportWizard from remounting when content changes
	return (
		<>
			{renderContent()}

			{/* Transaction Modal - always rendered, visibility controlled by isOpen */}
			<TransactionModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveTransaction}
				transaction={selectedTransaction}
				categoryOptions={categoryOptions}
			/>

			{/* Import Wizard - SINGLE INSTANCE, always rendered outside conditional content */}
			{/* This prevents the modal from remounting when transitioning from empty to normal state */}
			<ImportWizard
				isOpen={isImportModalOpen}
				onClose={handleImportClose}
				onImport={handleImportComplete}
				categoryOptions={categoryOptions}
			/>

			{/* Delete Confirmation */}
			{showDeleteConfirmation && (
				<Modal
					isOpen={showDeleteConfirmation}
					onClose={() => setShowDeleteConfirmation(false)}
					title="Delete Transaction"
					size="sm"
					data-testid="delete-confirmation"
				>
					<p className="mb-4">Are you sure you want to delete this transaction?</p>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
							Cancel
						</Button>
						<Button variant="primary" onClick={confirmDelete}>
							Delete
						</Button>
					</div>
				</Modal>
			)}

			{/* Bulk Delete Confirmation */}
			{showBulkDeleteConfirmation && (
				<Modal
					isOpen={showBulkDeleteConfirmation}
					onClose={() => setShowBulkDeleteConfirmation(false)}
					title="Delete Transactions"
					size="sm"
					data-testid="bulk-delete-confirmation"
				>
					<p className="mb-4">
						Are you sure you want to delete {selectedIds.size} transactions? This action cannot be undone.
					</p>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setShowBulkDeleteConfirmation(false)} data-testid="bulk-delete-cancel">
							Cancel
						</Button>
						<Button variant="primary" onClick={confirmBulkDelete} data-testid="bulk-delete-confirm">
							Delete
						</Button>
					</div>
				</Modal>
			)}

			{/* Bulk Categorize Modal */}
			<BulkCategorizeModal
				isOpen={showBulkCategorizeModal}
				onClose={() => setShowBulkCategorizeModal(false)}
				onApply={handleBulkCategorizeApply}
				selectedCount={selectedIds.size}
				categoryOptions={categoryOptions}
				selectedTransactionDescriptions={selectedTransactionDescriptions}
			/>
		</>
	)
}

export default TransactionsScreen
