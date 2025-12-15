import { useState } from 'react'
import { Modal } from '@main/components/ui/Modal/Modal'
import { Button } from '@main/components/ui/Button/Button'
import type { PotentialMatch, Confidence } from '../types'

interface BillSelectionModalProps {
	isOpen: boolean
	onClose: () => void
	billingCycle: string
	displayName: string
	ccTotal: number
	potentialBills: PotentialMatch[]
	onSelect: (billId: string | null, force?: boolean) => void
	isSubmitting?: boolean
}

/**
 * Modal for selecting a bill when multiple potential matches exist
 */
export function BillSelectionModal({
	isOpen,
	onClose,
	billingCycle,
	displayName,
	ccTotal,
	potentialBills,
	onSelect,
	isSubmitting = false,
}: BillSelectionModalProps) {
	const [selectedBillId, setSelectedBillId] = useState<string | null>(null)

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(amount / 100)
	}

	const handleSubmit = () => {
		onSelect(selectedBillId)
	}

	const handleClose = () => {
		setSelectedBillId(null)
		onClose()
	}

	const getConfidenceBadge = (confidence: Confidence, diff: number) => {
		if (Math.abs(diff) < 1) {
			return (
				<span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
					<CheckIcon />
					Valor exato
				</span>
			)
		}

		const colors = {
			high: 'text-green-600 dark:text-green-400',
			medium: 'text-yellow-600 dark:text-yellow-400',
			low: 'text-red-600 dark:text-red-400',
		}

		const labels = {
			high: 'Alta confiança',
			medium: 'Média confiança',
			low: 'Baixa confiança',
		}

		return (
			<span className={`inline-flex items-center gap-1 text-xs font-medium ${colors[confidence]}`}>
				<WarningIcon />
				Diferença: {formatCurrency(Math.abs(diff))}
			</span>
		)
	}

	const footer = (
		<>
			<Button
				variant="secondary"
				onClick={handleClose}
				isDisabled={isSubmitting}
			>
				Cancelar
			</Button>
			<Button
				variant="primary"
				onClick={handleSubmit}
				isLoading={isSubmitting}
				isDisabled={selectedBillId === undefined}
				data-testid="confirm-link-btn"
			>
				{selectedBillId === null ? 'Manter pendente' : 'Vincular Fatura'}
			</Button>
		</>
	)

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Selecionar Fatura"
			size="md"
			footer={footer}
			data-testid="bill-selection-dialog"
		>
			<div className="space-y-4">
				{/* Header info */}
				<div className="text-sm text-[var(--color-text-secondary)]">
					<p>
						Encontramos {potentialBills.length} {potentialBills.length === 1 ? 'fatura possível' : 'faturas possíveis'} para <strong>{displayName}</strong>.
					</p>
					<p className="mt-1">
						Qual delas corresponde às transações de cartão?
					</p>
				</div>

				{/* CC Total */}
				<div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
					<span className="text-sm text-[var(--color-text-muted)]">Total das transações CC:</span>
					<span className="ml-2 font-semibold text-[var(--color-text)]" data-testid="cc-total">
						{formatCurrency(ccTotal)}
					</span>
				</div>

				{/* Bill options */}
				<div className="space-y-3" role="radiogroup" aria-label="Selecione uma fatura">
					{potentialBills.map((bill) => (
						<label
							key={bill.billId}
							data-testid="bill-option"
							className={`
								flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
								${selectedBillId === bill.billId
									? 'border-[var(--color-primary)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]'
									: 'border-[var(--color-border)] hover:border-[var(--color-primary-200)]'
								}
							`.replace(/\s+/g, ' ').trim()}
						>
							<input
								type="radio"
								name="bill-selection"
								value={bill.billId}
								checked={selectedBillId === bill.billId}
								onChange={() => setSelectedBillId(bill.billId)}
								className="mt-1 w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
							/>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between gap-2">
									<span className="font-medium text-[var(--color-text)]">
										{bill.billDate} • {formatCurrency(bill.billAmount)}
									</span>
									{getConfidenceBadge(bill.confidence, bill.amountDifference)}
								</div>
								<p className="mt-1 text-sm text-[var(--color-text-secondary)] truncate">
									{bill.billDescription}
								</p>
								{bill.categoryName && (
									<p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
										Categoria: {bill.categoryName}
									</p>
								)}
							</div>
						</label>
					))}

					{/* None option */}
					<label
						data-testid="bill-option-none"
						className={`
							flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
							${selectedBillId === null
								? 'border-[var(--color-primary)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]'
								: 'border-[var(--color-border)] hover:border-[var(--color-primary-200)]'
							}
						`.replace(/\s+/g, ' ').trim()}
					>
						<input
							type="radio"
							name="bill-selection"
							value=""
							checked={selectedBillId === null}
							onChange={() => setSelectedBillId(null)}
							className="mt-1 w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
						/>
						<span className="text-[var(--color-text-secondary)]">
							Nenhuma - manter pendente
						</span>
					</label>
				</div>
			</div>
		</Modal>
	)
}

function CheckIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	)
}

function WarningIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</svg>
	)
}

export default BillSelectionModal
