import { useState } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { checkInviteEligibility, inviteMember } from './api'

interface InviteModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
	groupId: string
}

export function InviteModal({ isOpen, onClose, onSuccess, groupId }: InviteModalProps) {
	const [email, setEmail] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [showConfirmation, setShowConfirmation] = useState(false)

	const handleCheckAndSend = async () => {
		if (!email.trim()) {
			setError('Email e obrigatorio')
			return
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			setError('Email invalido')
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			// Step 1: Check if user exists
			const result = await checkInviteEligibility(groupId, email.trim())

			if (!result.canInvite) {
				// Cannot invite (e.g., already a member)
				setError(result.errorMessage || 'Nao e possivel enviar convite para este email')
				setIsLoading(false)
				return
			}

			if (!result.userExists) {
				// User doesn't exist - show confirmation dialog
				setShowConfirmation(true)
				setIsLoading(false)
				return
			}

			// User exists - proceed directly with invite
			await inviteMember(groupId, email.trim(), false)
			handleSuccess()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao enviar convite')
			setIsLoading(false)
		}
	}

	const handleConfirmNonUserInvite = async () => {
		setIsLoading(true)
		setError(null)

		try {
			await inviteMember(groupId, email.trim(), true)
			handleSuccess()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao enviar convite')
			setIsLoading(false)
		}
	}

	const handleSuccess = () => {
		setEmail('')
		setError(null)
		setShowConfirmation(false)
		setIsLoading(false)
		onSuccess()
		onClose()
	}

	const handleCancelConfirmation = () => {
		setShowConfirmation(false)
	}

	const handleCancel = () => {
		setEmail('')
		setError(null)
		setShowConfirmation(false)
		setIsLoading(false)
		onClose()
	}

	// Confirmation dialog for non-registered users
	if (showConfirmation) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={handleCancel}
				title="Usuario nao encontrado"
				size="sm"
				data-testid="confirm-non-user-dialog"
				footer={
					<>
						<Button
							data-testid="cancel-non-user-invite-btn"
							variant="secondary"
							onClick={handleCancelConfirmation}
							disabled={isLoading}
						>
							Cancelar
						</Button>
						<Button
							data-testid="confirm-send-invite-btn"
							onClick={handleConfirmNonUserInvite}
							disabled={isLoading}
						>
							{isLoading ? 'Enviando...' : 'Sim, Enviar Convite'}
						</Button>
					</>
				}
			>
				<div className="space-y-4">
					<p className="text-[var(--color-text)]">
						O email <strong>{email}</strong> nao pertence a um usuario do Finance Tracker.
					</p>
					<p className="text-[var(--color-text-secondary)]">
						Deseja enviar um convite para esta pessoa se cadastrar na plataforma e entrar no grupo?
					</p>
					{error && (
						<p data-testid="confirmation-error" className="text-sm text-red-500">
							{error}
						</p>
					)}
				</div>
			</Modal>
		)
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			title="Convidar Membro"
			size="sm"
			data-testid="invite-modal"
			footer={
				<>
					<Button
						data-testid="cancel-btn"
						variant="secondary"
						onClick={handleCancel}
						disabled={isLoading}
					>
						Cancelar
					</Button>
					<Button
						data-testid="send-invite-btn"
						onClick={handleCheckAndSend}
						disabled={isLoading}
					>
						{isLoading ? 'Verificando...' : 'Enviar Convite'}
					</Button>
				</>
			}
		>
			<div>
				<label className="block text-sm font-medium text-[var(--color-text)] mb-2">
					Email do convidado
				</label>
				<input
					data-testid="invite-email-input"
					type="email"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value)
						setError(null)
					}}
					placeholder="email@exemplo.com"
					disabled={isLoading}
					className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
				/>
				{error && (
					<p data-testid="email-error" className="mt-1 text-sm text-red-500">
						{error}
					</p>
				)}
			</div>
		</Modal>
	)
}

export default InviteModal
