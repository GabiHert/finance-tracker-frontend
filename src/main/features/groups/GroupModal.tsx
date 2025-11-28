import { useState, useEffect } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import type { Group } from './types'

interface GroupModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: { name: string; description?: string }) => void
	group?: Group | null
}

export function GroupModal({ isOpen, onClose, onSave, group }: GroupModalProps) {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (group) {
			setName(group.name)
			setDescription(group.description || '')
		} else {
			setName('')
			setDescription('')
		}
		setError(null)
	}, [group, isOpen])

	const handleSave = () => {
		if (!name.trim()) {
			setError('Nome do grupo e obrigatorio')
			return
		}

		onSave({
			name: name.trim(),
			description: description.trim() || undefined,
		})
	}

	const handleCancel = () => {
		setError(null)
		onClose()
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			title={group ? 'Editar Grupo' : 'Novo Grupo'}
			size="md"
			data-testid="group-modal"
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
						data-testid="save-group-btn"
						onClick={handleSave}
					>
						{group ? 'Salvar' : 'Criar Grupo'}
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-2">
						Nome do Grupo
					</label>
					<input
						data-testid="group-name-input"
						type="text"
						value={name}
						onChange={(e) => {
							setName(e.target.value)
							setError(null)
						}}
						placeholder="Ex: Familia Silva"
						className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
					/>
					{error && (
						<p data-testid="name-error" className="mt-1 text-sm text-red-500">
							{error}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-2">
						Descricao (opcional)
					</label>
					<textarea
						data-testid="group-description-input"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Ex: Despesas compartilhadas da familia"
						rows={3}
						className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
					/>
				</div>
			</div>
		</Modal>
	)
}

export default GroupModal
