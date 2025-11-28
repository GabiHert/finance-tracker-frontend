import { useState, useCallback } from 'react'
import { Button } from '@main/components/ui/Button'
import { Modal } from '@main/components/ui/Modal'
import { RuleRow } from './components/RuleRow'
import { RuleModal } from './RuleModal'
import { mockRules } from './mock-data'
import type { CategoryRule, CreateRuleInput } from './types'

export function RulesScreen() {
	const [rules, setRules] = useState<CategoryRule[]>(mockRules)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedRule, setSelectedRule] = useState<CategoryRule | null>(null)
	const [deleteRule, setDeleteRule] = useState<CategoryRule | null>(null)
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

	const handleAddRule = () => {
		setSelectedRule(null)
		setIsModalOpen(true)
	}

	const handleEditRule = (rule: CategoryRule) => {
		setSelectedRule(rule)
		setIsModalOpen(true)
	}

	const handleDeleteRule = (rule: CategoryRule) => {
		setDeleteRule(rule)
	}

	const handleConfirmDelete = () => {
		if (deleteRule) {
			setRules(rules.filter(r => r.id !== deleteRule.id))
			setDeleteRule(null)
		}
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedRule(null)
	}

	const handleSaveRule = (data: CreateRuleInput) => {
		if (selectedRule) {
			// Update existing rule
			setRules(rules.map(r =>
				r.id === selectedRule.id
					? { ...r, pattern: data.pattern, matchType: data.matchType, categoryId: data.categoryId }
					: r
			))
		} else {
			// Create new rule
			const newRule: CategoryRule = {
				id: `rule-${Date.now()}`,
				pattern: data.pattern,
				matchType: data.matchType,
				categoryId: data.categoryId,
				categoryName: 'Nova Categoria',
				categoryIcon: 'tag',
				categoryColor: '#6B7280',
				priority: rules.length + 1,
				isActive: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			setRules([...rules, newRule])
		}
		handleCloseModal()
	}

	const handleDragStart = useCallback((index: number) => {
		setDraggedIndex(index)
	}, [])

	const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
		e.preventDefault()
		if (draggedIndex === null || draggedIndex === index) return

		const newRules = [...rules]
		const draggedRule = newRules[draggedIndex]
		newRules.splice(draggedIndex, 1)
		newRules.splice(index, 0, draggedRule)

		// Update priorities
		const updatedRules = newRules.map((rule, idx) => ({
			...rule,
			priority: idx + 1,
		}))

		setRules(updatedRules)
		setDraggedIndex(index)
	}, [draggedIndex, rules])

	const handleDragEnd = useCallback(() => {
		setDraggedIndex(null)
	}, [])

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
							<div
								key={rule.id}
								draggable
								onDragStart={() => handleDragStart(index)}
								onDragOver={(e) => handleDragOver(e, index)}
								onDragEnd={handleDragEnd}
							>
								<RuleRow
									rule={rule}
									onEdit={handleEditRule}
									onDelete={handleDeleteRule}
									isDragging={draggedIndex === index}
								/>
							</div>
						))
					)}
				</div>
			</div>

			<RuleModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSave={handleSaveRule}
				rule={selectedRule}
			/>

			<Modal
				isOpen={!!deleteRule}
				onClose={() => setDeleteRule(null)}
				title="Excluir Regra"
				size="sm"
				data-testid="confirm-delete-dialog"
				footer={
					<>
						<Button variant="secondary" onClick={() => setDeleteRule(null)}>
							Cancelar
						</Button>
						<Button
							data-testid="confirm-delete-btn"
							variant="danger"
							onClick={handleConfirmDelete}
						>
							Excluir
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
