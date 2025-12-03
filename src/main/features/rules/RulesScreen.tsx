import { useState, useCallback, useEffect } from 'react'
import { Button } from '@main/components/ui/Button'
import { Modal } from '@main/components/ui/Modal'
import { RuleRow } from './components/RuleRow'
import { RuleModal } from './RuleModal'
import { fetchRules, createRule, updateRule, deleteRule, reorderRules } from './api/rules'
import type { CategoryRule, CreateRuleInput } from './types'

export function RulesScreen() {
	const [rules, setRules] = useState<CategoryRule[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedRule, setSelectedRule] = useState<CategoryRule | null>(null)
	const [deleteRuleTarget, setDeleteRuleTarget] = useState<CategoryRule | null>(null)
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	const loadRules = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			const data = await fetchRules()
			setRules(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar regras')
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadRules()
	}, [loadRules])

	const handleAddRule = () => {
		setSelectedRule(null)
		setIsModalOpen(true)
	}

	const handleEditRule = (rule: CategoryRule) => {
		setSelectedRule(rule)
		setIsModalOpen(true)
	}

	const handleDeleteRule = (rule: CategoryRule) => {
		setDeleteRuleTarget(rule)
	}

	const handleConfirmDelete = async () => {
		if (!deleteRuleTarget) return

		try {
			setIsSaving(true)
			await deleteRule(deleteRuleTarget.id)
			setRules(rules.filter(r => r.id !== deleteRuleTarget.id))
			setDeleteRuleTarget(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao excluir regra')
		} finally {
			setIsSaving(false)
		}
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedRule(null)
	}

	const handleSaveRule = async (data: CreateRuleInput) => {
		try {
			setIsSaving(true)
			if (selectedRule) {
				const updated = await updateRule(selectedRule.id, data)
				setRules(rules.map(r => r.id === selectedRule.id ? updated : r))
			} else {
				const newRule = await createRule({
					...data,
					priority: rules.length + 1,
				})
				setRules([...rules, newRule])
			}
			handleCloseModal()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao salvar regra')
		} finally {
			setIsSaving(false)
		}
	}

	const handleDragStart = useCallback((index: number) => {
		setDraggedIndex(index)
	}, [])

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault()
	}, [])

	const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
		e.preventDefault()
		if (draggedIndex === null || draggedIndex === index) return

		const newRules = [...rules]
		const draggedRule = newRules[draggedIndex]
		newRules.splice(draggedIndex, 1)
		newRules.splice(index, 0, draggedRule)

		// Keep original priorities with rules - don't recalculate based on position
		// Rules carry their priority numbers when reordered
		setRules(newRules)
		setDraggedIndex(index)
	}, [draggedIndex, rules])

	const handleDragEnd = useCallback(async () => {
		setDraggedIndex(null)

		// Sync new order with backend
		const order = rules.map((rule, idx) => ({
			id: rule.id,
			priority: rules.length - idx,
		}))

		try {
			await reorderRules(order)
		} catch (err) {
			console.error('Failed to save rule order:', err)
			loadRules() // Reload to get correct order
		}
	}, [rules, loadRules])

	if (isLoading) {
		return (
			<div data-testid="rules-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto">
					<div className="text-center py-12">
						<div className="animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto" />
						<p className="mt-4 text-[var(--color-text-secondary)]">Carregando regras...</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div data-testid="rules-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-[var(--color-text)]">
						Regras de Categorizacao
					</h1>
					<Button data-testid="new-rule-btn" onClick={handleAddRule}>
						+ Nova Regra
					</Button>
				</div>

				<p className="text-[var(--color-text-secondary)] mb-6">
					Defina regras para categorizar automaticamente suas transacoes com base em padroes de texto.
					As regras sao aplicadas em ordem de prioridade - arraste para reordenar.
				</p>

				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
						{error}
						<Button variant="secondary" size="sm" className="ml-4" onClick={loadRules}>
							Tentar novamente
						</Button>
					</div>
				)}

				<div data-testid="rules-list" className="space-y-3">
					{rules.length === 0 ? (
						<div
							data-testid="rules-empty-state"
							className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
						>
							<div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-background)] rounded-full flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="w-8 h-8 text-[var(--color-text-secondary)]"
								>
									<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
									<polyline points="14 2 14 8 20 8" />
									<line x1="16" y1="13" x2="8" y2="13" />
									<line x1="16" y1="17" x2="8" y2="17" />
									<line x1="10" y1="9" x2="8" y2="9" />
								</svg>
							</div>
							<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
								Nenhuma regra cadastrada
							</h3>
							<p className="text-[var(--color-text-secondary)] mb-4">
								Crie sua primeira regra para categorizar transacoes automaticamente
							</p>
							<Button onClick={handleAddRule}>
								Criar Regra
							</Button>
						</div>
					) : (
						rules.map((rule, index) => (
							<RuleRow
								key={rule.id}
								rule={rule}
								onEdit={handleEditRule}
								onDelete={handleDeleteRule}
								isDragging={draggedIndex === index}
								onDragStart={() => handleDragStart(index)}
								onDragEnter={handleDragEnter}
								onDragOver={(e) => handleDragOver(e, index)}
								onDragEnd={handleDragEnd}
							/>
						))
					)}
				</div>
			</div>

			<RuleModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSave={handleSaveRule}
				rule={selectedRule}
				isSaving={isSaving}
			/>

			<Modal
				isOpen={!!deleteRuleTarget}
				onClose={() => setDeleteRuleTarget(null)}
				title="Excluir Regra"
				size="sm"
				data-testid="confirm-delete-dialog"
				footer={
					<>
						<Button variant="secondary" onClick={() => setDeleteRuleTarget(null)} disabled={isSaving}>
							Cancelar
						</Button>
						<Button
							data-testid="confirm-delete-btn"
							variant="danger"
							onClick={handleConfirmDelete}
							disabled={isSaving}
						>
							{isSaving ? 'Excluindo...' : 'Excluir'}
						</Button>
					</>
				}
			>
				<p className="text-[var(--color-text-secondary)]">
					Tem certeza que deseja excluir esta regra? Esta acao nao pode ser desfeita.
				</p>
			</Modal>
		</div>
	)
}

export default RulesScreen
