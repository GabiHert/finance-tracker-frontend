import { useState, useEffect } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { Input } from '@main/components/ui/Input'

interface EditProfileModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (name: string) => void
	currentName: string
}

export function EditProfileModal({ isOpen, onClose, onSave, currentName }: EditProfileModalProps) {
	const [name, setName] = useState(currentName)

	useEffect(() => {
		if (isOpen) {
			setName(currentName)
		}
	}, [isOpen, currentName])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (name.trim()) {
			onSave(name.trim())
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Editar Perfil"
			size="sm"
			data-testid="edit-profile-modal"
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
						Nome
					</label>
					<Input
						data-testid="profile-name-input"
						type="text"
						value={name}
						onChange={(value) => setName(value)}
						placeholder="Seu nome"
						required
					/>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<Button type="button" variant="secondary" onClick={onClose}>
						Cancelar
					</Button>
					<Button
						type="submit"
						data-testid="save-profile-btn"
						disabled={!name.trim()}
					>
						Salvar
					</Button>
				</div>
			</form>
		</Modal>
	)
}
