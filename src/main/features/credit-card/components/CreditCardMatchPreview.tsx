import { useState, useCallback } from 'react'
import { Button } from '@main/components/ui/Button'
import type { BillMatch, CreditCardTransaction, ConfirmedMatch } from '../types'

interface CreditCardMatchPreviewProps {
	matches: BillMatch[]
	transactions: CreditCardTransaction[]
	warnings: string[]
	unmatchedCount: number
	totalAmount: number
	onConfirm: (confirmedMatches: ConfirmedMatch[], skipUnmatched: boolean) => void
	onCancel: () => void
	isLoading?: boolean
}

export function CreditCardMatchPreview({
	matches,
	transactions,
	warnings,
	unmatchedCount,
	totalAmount,
	onConfirm,
	onCancel,
	isLoading = false,
}: CreditCardMatchPreviewProps) {
	const [selectedMatches, setSelectedMatches] = useState<Set<string>>(
		new Set(matches.map((m) => m.billTransactionId))
	)
	const [skipUnmatched, setSkipUnmatched] = useState(false)

	const handleToggleMatch = useCallback((billId: string) => {
		setSelectedMatches((prev) => {
			const next = new Set(prev)
			if (next.has(billId)) {
				next.delete(billId)
			} else {
				next.add(billId)
			}
			return next
		})
	}, [])

	const handleConfirm = useCallback(() => {
		const confirmedMatches: ConfirmedMatch[] = matches
			.filter((m) => selectedMatches.has(m.billTransactionId))
			.map((m) => ({
				billTransactionId: m.billTransactionId,
				paymentReceivedDate: m.paymentReceivedDate || '',
			}))

		onConfirm(confirmedMatches, skipUnmatched)
	}, [matches, selectedMatches, skipUnmatched, onConfirm])

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(Math.abs(amount))
	}

	const formatDate = (dateStr: string) => {
		const [year, month, day] = dateStr.split('-')
		return `${day}/${month}/${year}`
	}

	const totalTransactions = transactions.filter((t) => !t.isPaymentReceived).length

	return (
		<div data-testid="cc-match-preview" className="space-y-6">
			{/* Summary */}
			<div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
				<h3 className="font-semibold text-[var(--color-text)] mb-3">
					Resumo do Cartao de Credito
				</h3>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span className="text-[var(--color-text-secondary)]">Total de transacoes:</span>
						<span className="ml-2 font-medium text-[var(--color-text)]">
							{totalTransactions}
						</span>
					</div>
					<div>
						<span className="text-[var(--color-text-secondary)]">Valor total:</span>
						<span className="ml-2 font-medium text-[var(--color-error)]">
							{formatCurrency(totalAmount)}
						</span>
					</div>
					<div>
						<span className="text-[var(--color-text-secondary)]">Faturas encontradas:</span>
						<span className="ml-2 font-medium text-[var(--color-text)]">
							{matches.length}
						</span>
					</div>
					<div>
						<span className="text-[var(--color-text-secondary)]">Nao vinculadas:</span>
						<span
							className={`ml-2 font-medium ${unmatchedCount > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}
						>
							{unmatchedCount}
						</span>
					</div>
				</div>
			</div>

			{/* Warnings */}
			{warnings.length > 0 && (
				<div
					data-testid="cc-import-warnings"
					className="bg-[var(--color-warning-50)] border border-[var(--color-warning-200)] rounded-lg p-4"
				>
					<h4 className="font-medium text-[var(--color-warning)] mb-2">Avisos</h4>
					<ul className="list-disc list-inside text-sm text-[var(--color-warning)]">
						{warnings.map((warning, idx) => (
							<li key={idx}>{warning}</li>
						))}
					</ul>
				</div>
			)}

			{/* Matches */}
			{matches.length > 0 && (
				<div>
					<h4 className="font-medium text-[var(--color-text)] mb-3">
						Faturas para vincular
					</h4>
					<div className="space-y-3">
						{matches.map((match) => (
							<div
								key={match.billTransactionId}
								data-testid="cc-match-item"
								className={`border rounded-lg p-4 transition-colors ${
									selectedMatches.has(match.billTransactionId)
										? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]'
										: 'border-[var(--color-border)]'
								}`}
							>
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-3">
										<input
											type="checkbox"
											checked={selectedMatches.has(match.billTransactionId)}
											onChange={() => handleToggleMatch(match.billTransactionId)}
											className="mt-1 w-4 h-4 rounded border-[var(--color-border)]"
										/>
										<div>
											<p className="font-medium text-[var(--color-text)]">
												Pagamento de fatura - {formatDate(match.billDate)}
											</p>
											<p className="text-sm text-[var(--color-text-secondary)] mt-1">
												Valor da fatura: {formatCurrency(match.billAmount)}
											</p>
											<p className="text-sm text-[var(--color-text-secondary)]">
												Valor no extrato CC: {formatCurrency(match.ccTotal)}
											</p>
											{match.difference > 0 && (
												<p
													data-testid="cc-match-difference"
													className="text-sm text-[var(--color-warning)] mt-1"
												>
													Diferenca: {formatCurrency(match.difference)}
												</p>
											)}
										</div>
									</div>
									<span
										data-testid="cc-match-count"
										className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-2 py-1 rounded"
									>
										{match.matchedTransactionCount} itens
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Unmatched handling */}
			{unmatchedCount > 0 && (
				<div className="flex items-center gap-3">
					<input
						type="checkbox"
						id="skip-unmatched"
						checked={skipUnmatched}
						onChange={(e) => setSkipUnmatched(e.target.checked)}
						className="w-4 h-4 rounded border-[var(--color-border)]"
					/>
					<label
						htmlFor="skip-unmatched"
						className="text-sm text-[var(--color-text-secondary)]"
					>
						Nao importar {unmatchedCount} transacoes sem fatura vinculada
					</label>
				</div>
			)}

			{/* Actions */}
			<div className="flex justify-between pt-4 border-t border-[var(--color-border)]">
				<Button variant="outline" onClick={onCancel} disabled={isLoading}>
					Cancelar
				</Button>
				<Button
					onClick={handleConfirm}
					disabled={isLoading || (matches.length > 0 && selectedMatches.size === 0)}
					data-testid="cc-confirm-import-btn"
				>
					{isLoading ? 'Importando...' : 'Confirmar Importacao'}
				</Button>
			</div>
		</div>
	)
}
