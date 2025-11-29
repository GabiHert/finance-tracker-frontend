import { useState, useEffect } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { Input } from '@main/components/ui/Input'

interface DeleteAllTransactionsModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: (password: string) => void
}

function AlertIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-12 h-12 text-red-500"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</svg>
	)
}

export function DeleteAllTransactionsModal({ isOpen, onClose, onConfirm }: DeleteAllTransactionsModalProps) {
	const [password, setPassword] = useState('')
	const [confirmation, setConfirmation] = useState('')

	useEffect(() => {
		if (!isOpen) {
			setPassword('')
			setConfirmation('')
		}
	}, [isOpen])

	const isValid = password.length > 0 && confirmation === 'DELETE_ALL_TRANSACTIONS'

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (isValid) {
			onConfirm(password)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Excluir Todas as Transacoes"
			size="sm"
			data-testid="delete-all-transactions-modal"
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="flex justify-center mb-4">
					<AlertIcon />
				</div>

				<div
					data-testid="delete-transactions-warning"
					className="p-4 bg-red-50 border border-red-200 rounded-lg"
				>
					<p className="text-sm text-red-700 font-medium mb-2">
						Esta acao e irreversivel!
					</p>
					<p className="text-sm text-red-600">
						Ao excluir todas as transacoes, todo o seu historico financeiro sera
						permanentemente removido. Suas categorias e metas serao mantidas.
					</p>
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
						Digite sua senha
					</label>
					<Input
						data-testid="delete-transactions-password-input"
						type="password"
						value={password}
						onChange={(value) => setPassword(value)}
						placeholder="Sua senha"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
						Digite DELETE_ALL_TRANSACTIONS para confirmar
					</label>
					<Input
						data-testid="delete-transactions-confirmation-input"
						type="text"
						value={confirmation}
						onChange={(value) => setConfirmation(value)}
						placeholder="DELETE_ALL_TRANSACTIONS"
						required
					/>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<Button
						type="button"
						variant="secondary"
						onClick={onClose}
						data-testid="cancel-delete-transactions-btn"
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						variant="danger"
						data-testid="confirm-delete-transactions-btn"
						disabled={!isValid}
					>
						Excluir todas as transacoes
					</Button>
				</div>
			</form>
		</Modal>
	)
}
