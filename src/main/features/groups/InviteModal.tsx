import { useState } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'

interface InviteModalProps {
	isOpen: boolean
	onClose: () => void
	onSend: (email: string) => void
}

export function InviteModal({ isOpen, onClose, onSend }: InviteModalProps) {
	const [email, setEmail] = useState('')
	const [error, setError] = useState<string | null>(null)

	const handleSend = () => {
		if (!email.trim()) {
			setError('Email e obrigatorio')
			return
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			setError('Email invalido')
			return
		}

		onSend(email.trim())
		setEmail('')
		setError(null)
	}

	const handleCancel = () => {
		setEmail('')
		setError(null)
		onClose()
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
					>
						Cancelar
					</Button>
					<Button
						data-testid="send-invite-btn"
						onClick={handleSend}
					>
						Enviar Convite
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
					className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
