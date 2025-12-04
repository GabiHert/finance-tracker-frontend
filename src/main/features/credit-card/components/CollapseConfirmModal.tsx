import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'

interface CollapseConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	billDate: string
	billAmount: number
	linkedCount: number
	isLoading?: boolean
}

export function CollapseConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	billDate,
	billAmount,
	linkedCount,
	isLoading = false,
}: CollapseConfirmModalProps) {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(Math.abs(amount))
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Reverter Expansao"
			size="sm"
		>
			<div data-testid="collapse-confirm-modal" className="space-y-4">
				<div className="p-4 bg-[var(--color-warning-50)] border border-[var(--color-warning-200)] rounded-lg">
					<div className="flex items-start gap-3">
						<WarningIcon />
						<div>
							<p className="font-medium text-[var(--color-warning)]">
								Atencao
							</p>
							<p className="text-sm text-[var(--color-text-secondary)] mt-1">
								Esta acao ira reverter a expansao da fatura e excluir todas as
								transacoes de cartao de credito vinculadas.
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-[var(--color-text-secondary)]">Data da fatura:</span>
						<span className="text-[var(--color-text)]">{billDate}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-[var(--color-text-secondary)]">Valor original:</span>
						<span className="font-medium text-[var(--color-error)]">
							{formatCurrency(billAmount)}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-[var(--color-text-secondary)]">
							Transacoes a serem excluidas:
						</span>
						<span className="font-medium text-[var(--color-text)]">{linkedCount}</span>
					</div>
				</div>

				<div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancelar
					</Button>
					<Button
						variant="danger"
						onClick={onConfirm}
						disabled={isLoading}
						data-testid="collapse-confirm-btn"
					>
						{isLoading ? 'Revertendo...' : 'Reverter'}
					</Button>
				</div>
			</div>
		</Modal>
	)
}

function WarningIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-[var(--color-warning)] flex-shrink-0"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
			<line x1="12" x2="12" y1="9" y2="13" />
			<line x1="12" x2="12.01" y1="17" y2="17" />
		</svg>
	)
}
