import { useEffect, useRef, useCallback } from 'react'
import { formatCurrency } from '../types'

interface TransactionModalProps {
	date: string
	income: number
	expenses: number
	onClose: () => void
	onViewTransactions?: () => void
	isLoading?: boolean
}

export function TransactionModal({
	date,
	income,
	expenses,
	onClose,
	onViewTransactions,
	isLoading = false,
}: TransactionModalProps) {
	const modalRef = useRef<HTMLDivElement>(null)
	const closeButtonRef = useRef<HTMLButtonElement>(null)

	const formatDate = (dateString: string) => {
		const d = new Date(dateString)
		const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(d)
		const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
		const year = d.getFullYear()
		return `${capitalizedMonth} ${year}`
	}

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		},
		[onClose]
	)

	const handleBackdropClick = useCallback(
		(event: React.MouseEvent) => {
			if (event.target === event.currentTarget) {
				onClose()
			}
		},
		[onClose]
	)

	useEffect(() => {
		closeButtonRef.current?.focus()

		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleKeyDown])

	useEffect(() => {
		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key !== 'Tab' || !modalRef.current) return

			const focusableElements = modalRef.current.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
			const firstElement = focusableElements[0] as HTMLElement
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

			if (e.shiftKey && document.activeElement === firstElement) {
				e.preventDefault()
				lastElement.focus()
			} else if (!e.shiftKey && document.activeElement === lastElement) {
				e.preventDefault()
				firstElement.focus()
			}
		}

		document.addEventListener('keydown', handleTabKey)
		return () => document.removeEventListener('keydown', handleTabKey)
	}, [])

	const balance = income - expenses

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4"
			onClick={handleBackdropClick}
			data-testid="modal-backdrop"
		>
			<div
				ref={modalRef}
				data-testid="transaction-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				className="bg-[var(--color-surface)] rounded-t-lg sm:rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
			>
				<div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
					<h2
						id="modal-title"
						className="text-lg font-semibold text-[var(--color-text)]"
					>
						Resumo do Dia
					</h2>
					<button
						ref={closeButtonRef}
						data-testid="modal-close-btn"
						onClick={onClose}
						aria-label="Fechar"
						className="p-2 rounded-lg hover:bg-[var(--color-background-secondary)] transition-colors"
					>
						<svg
							className="w-5 h-5 text-[var(--color-text-secondary)]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M18 6L6 18M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="p-4">
					{isLoading ? (
						<div
							data-testid="modal-loading"
							className="flex items-center justify-center py-8"
							aria-live="polite"
						>
							<svg
								className="w-8 h-8 animate-spin text-[var(--color-primary)]"
								viewBox="0 0 24 24"
								fill="none"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						</div>
					) : (
						<>
							<p
								data-testid="modal-period-title"
								className="text-sm text-[var(--color-text-secondary)] mb-4"
							>
								{formatDate(date)}
							</p>

							<div className="grid grid-cols-3 gap-2 mb-4">
								<div
									data-testid="summary-income"
									className="text-center p-2 bg-green-50 rounded-lg"
								>
									<span className="block text-xs text-green-700">Receitas</span>
									<span className="text-sm font-semibold text-green-600">
										{formatCurrency(income)}
									</span>
								</div>

								<div
									data-testid="summary-expenses"
									className="text-center p-2 bg-red-50 rounded-lg"
								>
									<span className="block text-xs text-red-700">Despesas</span>
									<span className="text-sm font-semibold text-red-600">
										{formatCurrency(expenses)}
									</span>
								</div>

								<div
									data-testid="summary-balance"
									className={`text-center p-2 rounded-lg ${
										balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'
									}`}
								>
									<span
										className={`block text-xs ${
											balance >= 0 ? 'text-blue-700' : 'text-orange-700'
										}`}
									>
										Saldo
									</span>
									<span
										className={`text-sm font-semibold ${
											balance >= 0 ? 'text-blue-600' : 'text-orange-600'
										}`}
									>
										{formatCurrency(balance)}
									</span>
								</div>
							</div>

							{income === 0 && expenses === 0 ? (
								<div
									data-testid="modal-empty-state"
									className="text-center py-4 text-[var(--color-text-secondary)]"
								>
									Sem transações neste período
								</div>
							) : (
								<div className="space-y-2">
									<div
										data-testid="modal-transaction-row"
										className="text-sm text-[var(--color-text-secondary)]"
									>
										Clique em "Ver Todas" para ver detalhes
									</div>
								</div>
							)}
						</>
					)}
				</div>

				<div className="flex gap-2 p-4 border-t border-[var(--color-border)]">
					<button
						data-testid="view-all-btn"
						onClick={onViewTransactions}
						className="flex-1 py-2 px-4 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
					>
						Ver Todas
					</button>
					<button
						onClick={onClose}
						className="py-2 px-4 border border-[var(--color-border)] rounded-lg font-medium hover:bg-[var(--color-background-secondary)] transition-colors"
					>
						Fechar
					</button>
				</div>
			</div>
		</div>
	)
}
