import { useState, useEffect, useCallback } from 'react'
import { Button } from '@main/components/ui/Button/Button'
import { useToast } from '@main/components/layout/Toast'
import { PendingCycleCard, LinkedCycleCard } from './BillingCycleCard'
import { BillSelectionModal } from './BillSelectionModal'
import {
	fetchPendingCycles,
	fetchLinkedCycles,
	triggerReconciliation,
	linkCycleToBill,
	unlinkCycle,
} from '../api/reconciliation'
import type {
	PendingCycle,
	LinkedCycle,
	ReconciliationSummary,
} from '../types'

/**
 * Main reconciliation screen showing pending and linked billing cycles
 */
export function ReconciliationScreen() {
	const { showToast } = useToast()
	const [pendingCycles, setPendingCycles] = useState<PendingCycle[]>([])
	const [linkedCycles, setLinkedCycles] = useState<LinkedCycle[]>([])
	const [summary, setSummary] = useState<ReconciliationSummary>({ totalPending: 0, totalLinked: 0, monthsCovered: 0 })
	const [isLoading, setIsLoading] = useState(true)
	const [isReconciling, setIsReconciling] = useState(false)
	const [linkingCycle, setLinkingCycle] = useState<string | null>(null)
	const [unlinkingCycle, setUnlinkingCycle] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	// Bill selection modal state
	const [selectionModal, setSelectionModal] = useState<{
		isOpen: boolean
		cycle: PendingCycle | null
	}>({ isOpen: false, cycle: null })

	// Unlink confirmation modal state
	const [unlinkConfirmModal, setUnlinkConfirmModal] = useState<{
		isOpen: boolean
		billingCycle: string | null
	}>({ isOpen: false, billingCycle: null })

	const loadData = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			const [pendingResponse, linkedResponse] = await Promise.all([
				fetchPendingCycles(20, 0),
				fetchLinkedCycles(10, 0),
			])
			setPendingCycles(pendingResponse.cycles)
			setLinkedCycles(linkedResponse.cycles)
			setSummary(pendingResponse.summary)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadData()
	}, [loadData])

	const handleTriggerReconciliation = async () => {
		setIsReconciling(true)
		try {
			const result = await triggerReconciliation()

			// Show appropriate toast
			if (result.autoLinked.length > 0) {
				showToast(
					`${result.autoLinked.length} ${result.autoLinked.length === 1 ? 'fatura vinculada' : 'faturas vinculadas'} automaticamente`,
					'success'
				)
			} else if (result.requiresSelection.length > 0) {
				showToast('Múltiplas faturas encontradas - selecione manualmente', 'info')
			} else if (result.noMatch.length > 0) {
				showToast('Nenhuma correspondência encontrada', 'info')
			}

			// Reload data
			await loadData()
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Erro ao reconciliar', 'error')
		} finally {
			setIsReconciling(false)
		}
	}

	const handleLinkClick = (billingCycle: string) => {
		const cycle = pendingCycles.find((c) => c.billingCycle === billingCycle)
		if (!cycle) return

		if (cycle.potentialBills.length === 0) {
			showToast('Nenhuma fatura encontrada para este ciclo', 'info')
			return
		}

		if (cycle.potentialBills.length === 1) {
			// Auto-link if only one match
			handleLink(billingCycle, cycle.potentialBills[0].billId)
		} else {
			// Show selection modal
			setSelectionModal({ isOpen: true, cycle })
		}
	}

	const handleLink = async (billingCycle: string, billId: string | null, force?: boolean) => {
		if (!billId) {
			setSelectionModal({ isOpen: false, cycle: null })
			return
		}

		setLinkingCycle(billingCycle)
		try {
			await linkCycleToBill(billingCycle, billId, force)
			showToast('Fatura vinculada com sucesso', 'success')
			setSelectionModal({ isOpen: false, cycle: null })
			await loadData()
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Erro ao vincular', 'error')
		} finally {
			setLinkingCycle(null)
		}
	}

	const handleUnlinkClick = (billingCycle: string) => {
		setUnlinkConfirmModal({ isOpen: true, billingCycle })
	}

	const handleConfirmUnlink = async () => {
		const billingCycle = unlinkConfirmModal.billingCycle
		if (!billingCycle) return

		setUnlinkConfirmModal({ isOpen: false, billingCycle: null })
		setUnlinkingCycle(billingCycle)
		try {
			await unlinkCycle(billingCycle)
			showToast('Fatura desvinculada com sucesso', 'success')
			await loadData()
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Erro ao desvincular', 'error')
		} finally {
			setUnlinkingCycle(null)
		}
	}

	if (isLoading) {
		return (
			<div className="p-6" data-testid="reconciliation-loading">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/3" />
					<div className="h-32 bg-gray-200 rounded" />
					<div className="h-32 bg-gray-200 rounded" />
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-6" data-testid="reconciliation-error">
				<div className="text-center py-8">
					<p className="text-red-600 mb-4">{error}</p>
					<Button onClick={loadData}>Tentar novamente</Button>
				</div>
			</div>
		)
	}

	const isEmpty = pendingCycles.length === 0 && linkedCycles.length === 0

	return (
		<div className="p-6 space-y-8" data-testid="reconciliation-screen">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-[var(--color-text)]">
					Reconciliação de Cartão de Crédito
				</h1>
				{!isEmpty && (
					<Button
						variant="primary"
						onClick={handleTriggerReconciliation}
						isLoading={isReconciling}
						data-testid="reconcile-btn"
					>
						{isReconciling ? 'Reconciliando...' : 'Reconciliar'}
					</Button>
				)}
			</div>

			{/* Empty state - No CC transactions at all */}
			{isEmpty && (
				<div
					className="text-center py-12"
					data-testid="no-cc-empty-state"
				>
					<CreditCardIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
					<h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
						Nenhuma transação de cartão
					</h2>
					<p className="text-[var(--color-text-secondary)] mb-4">
						Importe suas transações de cartão de crédito para começar a reconciliar.
					</p>
					<Button
						variant="primary"
						onClick={() => window.location.href = '/transactions'}
						data-testid="import-cc-cta"
					>
						Importar transações
					</Button>
				</div>
			)}

			{/* Pending cycles section */}
			{pendingCycles.length > 0 && (
				<section data-testid="pending-cycles">
					<h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
						Faturas Pendentes
					</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{pendingCycles.map((cycle) => (
							<PendingCycleCard
								key={cycle.billingCycle}
								cycle={cycle}
								onLink={handleLinkClick}
								isLinking={linkingCycle === cycle.billingCycle}
							/>
						))}
					</div>
				</section>
			)}

			{/* Empty pending state - has linked but no pending */}
			{pendingCycles.length === 0 && linkedCycles.length > 0 && (
				<div
					className="text-center py-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
					data-testid="pending-empty-state"
				>
					<CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-3" />
					<h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
						Tudo reconciliado!
					</h3>
					<p className="text-sm text-[var(--color-text-secondary)]">
						Nenhum ciclo pendente de vinculação.
					</p>
				</div>
			)}

			{/* Linked cycles section */}
			{linkedCycles.length > 0 && (
				<section data-testid="linked-cycles">
					<h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
						Faturas Vinculadas (últimos 3 meses)
					</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{linkedCycles.map((cycle) => (
							<LinkedCycleCard
								key={cycle.billingCycle}
								cycle={cycle}
								onUnlink={handleUnlinkClick}
								isUnlinking={unlinkingCycle === cycle.billingCycle}
							/>
						))}
					</div>
				</section>
			)}

			{/* Bill selection modal */}
			{selectionModal.cycle && (
				<BillSelectionModal
					isOpen={selectionModal.isOpen}
					onClose={() => setSelectionModal({ isOpen: false, cycle: null })}
					billingCycle={selectionModal.cycle.billingCycle}
					displayName={selectionModal.cycle.displayName}
					ccTotal={selectionModal.cycle.totalAmount}
					potentialBills={selectionModal.cycle.potentialBills}
					onSelect={(billId, force) => handleLink(selectionModal.cycle!.billingCycle, billId, force)}
					isSubmitting={linkingCycle === selectionModal.cycle.billingCycle}
				/>
			)}

			{/* Unlink confirmation modal */}
			{unlinkConfirmModal.isOpen && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					data-testid="unlink-confirm-dialog"
				>
					<div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
						<h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
							Desvincular fatura?
						</h3>
						<p className="text-sm text-[var(--color-text-secondary)] mb-6">
							As transações de cartão voltarão a ficar pendentes de vinculação.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="secondary"
								onClick={() => setUnlinkConfirmModal({ isOpen: false, billingCycle: null })}
							>
								Cancelar
							</Button>
							<Button
								variant="primary"
								onClick={handleConfirmUnlink}
								data-testid="confirm-unlink-btn"
							>
								Desvincular
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function CheckCircleIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="10" />
			<path d="m9 12 2 2 4-4" />
		</svg>
	)
}

function CreditCardIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<rect width="20" height="14" x="2" y="5" rx="2" />
			<line x1="2" x2="22" y1="10" y2="10" />
		</svg>
	)
}

export default ReconciliationScreen
