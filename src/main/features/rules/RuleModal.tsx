import { useState, useEffect } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { Select } from '@main/components/ui/Select'
import { PatternHelper, generateRegexPreview } from './components/PatternHelper'
import { testPattern } from './api/rules'
import { fetchCategories } from '../categories/api/categories'
import type { CategoryRule, MatchType, CreateRuleInput, PatternTestResult } from './types'
import type { Category } from '../categories/types'

interface RuleModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: CreateRuleInput) => void
	rule?: CategoryRule | null
	isSaving?: boolean
}

export function RuleModal({ isOpen, onClose, onSave, rule, isSaving = false }: RuleModalProps) {
	const [matchType, setMatchType] = useState<MatchType>('contains')
	const [pattern, setPattern] = useState('')
	const [categoryId, setCategoryId] = useState('')
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [showTestResults, setShowTestResults] = useState(false)
	const [testResults, setTestResults] = useState<PatternTestResult | null>(null)
	const [isTesting, setIsTesting] = useState(false)
	const [categories, setCategories] = useState<Category[]>([])
	const [isLoadingCategories, setIsLoadingCategories] = useState(true)

	const isEditing = !!rule

	useEffect(() => {
		async function loadCategories() {
			try {
				setIsLoadingCategories(true)
				const data = await fetchCategories()
				setCategories(data)
			} catch (err) {
				console.error('Failed to load categories:', err)
			} finally {
				setIsLoadingCategories(false)
			}
		}

		if (isOpen) {
			loadCategories()
		}
	}, [isOpen])

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (rule) {
			setMatchType(rule.matchType)
			setPattern(getPatternFromRegex(rule.pattern, rule.matchType))
			setCategoryId(rule.categoryId)
		} else {
			setMatchType('contains')
			setPattern('')
			setCategoryId('')
		}
		setErrors({})
		setShowTestResults(false)
		setTestResults(null)
	}, [rule, isOpen])
	/* eslint-enable react-hooks/set-state-in-effect */

	const categoryOptions = categories.map(c => ({
		value: c.id,
		label: c.name,
	}))

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!pattern.trim()) {
			newErrors.pattern = 'Padrao e obrigatorio'
		}

		if (!categoryId) {
			newErrors.category = 'Categoria e obrigatoria'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = () => {
		if (!validate()) return

		const finalPattern = generateRegexPreview(matchType, pattern.trim())

		onSave({
			pattern: finalPattern,
			matchType,
			categoryId,
		})
	}

	const handleTestPattern = async () => {
		if (!pattern.trim()) return

		try {
			setIsTesting(true)
			const regex = generateRegexPreview(matchType, pattern.trim())
			const result = await testPattern(regex)
			setTestResults(result)
			setShowTestResults(true)
		} catch (err) {
			console.error('Failed to test pattern:', err)
			setTestResults({ matchCount: 0, matches: [] })
			setShowTestResults(true)
		} finally {
			setIsTesting(false)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEditing ? 'Editar Regra' : 'Nova Regra'}
			size="md"
			data-testid="rule-modal"
			footer={
				<>
					<Button data-testid="cancel-btn" variant="secondary" onClick={onClose} disabled={isSaving}>
						Cancelar
					</Button>
					<Button data-testid="save-rule-btn" onClick={handleSubmit} disabled={isSaving}>
						{isSaving ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Regra'}
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<PatternHelper
					matchType={matchType}
					pattern={pattern}
					onMatchTypeChange={setMatchType}
					onPatternChange={setPattern}
					error={errors.pattern}
				/>

				<div>
					<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
						Categoria *
					</label>
					<Select
						data-testid="category-selector"
						options={categoryOptions}
						value={categoryId}
						onChange={(val) => setCategoryId(val as string)}
						placeholder={isLoadingCategories ? 'Carregando...' : 'Selecione uma categoria'}
						disabled={isLoadingCategories}
					/>
					{errors.category && (
						<p className="text-sm text-red-500 mt-1">{errors.category}</p>
					)}
				</div>

				<div className="pt-2">
					<Button
						data-testid="test-pattern-btn"
						variant="secondary"
						onClick={handleTestPattern}
						disabled={!pattern.trim() || isTesting}
					>
						{isTesting ? 'Testando...' : 'Testar padrao'}
					</Button>
				</div>

				{showTestResults && testResults && (
					<div data-testid="pattern-test-results" className="border border-[var(--color-border)] rounded-lg p-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-[var(--color-text)]">
								Resultados do teste
							</span>
							<span
								data-testid="match-count"
								className="text-sm text-[var(--color-text-secondary)]"
							>
								{testResults.matchCount} transacoes encontradas
							</span>
						</div>
						{testResults.matches.length > 0 ? (
							<ul className="space-y-2">
								{testResults.matches.slice(0, 5).map(tx => (
									<li
										key={tx.id}
										className="text-sm text-[var(--color-text-secondary)] flex justify-between"
									>
										<span>{tx.description}</span>
										<span className={tx.amount < 0 ? 'text-red-500' : 'text-green-500'}>
											R$ {Math.abs(tx.amount).toFixed(2)}
										</span>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-[var(--color-text-secondary)]">
								Nenhuma transacao corresponde ao padrao
							</p>
						)}
					</div>
				)}
			</div>
		</Modal>
	)
}

function getPatternFromRegex(regex: string, matchType: MatchType): string {
	switch (matchType) {
		case 'contains':
			return regex.replace(/^\.\*/, '').replace(/\.\*$/, '')
		case 'starts_with':
			return regex.replace(/^\^/, '').replace(/\.\*$/, '')
		case 'exact':
			return regex.replace(/^\^/, '').replace(/\$$/, '')
		case 'custom':
			return regex
		default:
			return regex
	}
}

export default RuleModal
