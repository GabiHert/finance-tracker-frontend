import { useState } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { Input } from '@main/components/ui/Input'

interface ChangePasswordModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (currentPassword: string, newPassword: string) => { success: boolean; error?: string }
}

export function ChangePasswordModal({ isOpen, onClose, onSave }: ChangePasswordModalProps) {
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	const resetForm = () => {
		setCurrentPassword('')
		setNewPassword('')
		setConfirmPassword('')
		setError(null)
	}

	const handleClose = () => {
		resetForm()
		onClose()
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (newPassword !== confirmPassword) {
			setError('As senhas nao conferem')
			return
		}

		if (newPassword.length < 8) {
			setError('A nova senha deve ter pelo menos 8 caracteres')
			return
		}

		const result = onSave(currentPassword, newPassword)
		if (!result.success) {
			setError(result.error || 'Erro ao alterar senha')
		} else {
			resetForm()
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Alterar Senha"
			size="sm"
			data-testid="change-password-modal"
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div
						data-testid="password-error"
						className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
					>
						{error}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
						Senha atual
					</label>
					<Input
						data-testid="current-password-input"
						type="password"
						value={currentPassword}
						onChange={(value) => setCurrentPassword(value)}
						placeholder="Digite sua senha atual"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
						Nova senha
					</label>
					<Input
						data-testid="new-password-input"
						type="password"
						value={newPassword}
						onChange={(value) => setNewPassword(value)}
						placeholder="Digite a nova senha"
						required
						minLength={8}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
						Confirmar nova senha
					</label>
					<Input
						data-testid="confirm-password-input"
						type="password"
						value={confirmPassword}
						onChange={(value) => setConfirmPassword(value)}
						placeholder="Confirme a nova senha"
						required
					/>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<Button type="button" variant="secondary" onClick={handleClose}>
						Cancelar
					</Button>
					<Button
						type="submit"
						data-testid="save-password-btn"
						disabled={!currentPassword || !newPassword || !confirmPassword}
					>
						Salvar
					</Button>
				</div>
			</form>
		</Modal>
	)
}
