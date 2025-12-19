import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@main/components/ui/Button'
import { Modal } from '@main/components/ui/Modal'
import { SuggestionCard } from './components/SuggestionCard'
import { EditSuggestionModal } from './components/EditSuggestionModal'
import { AffectedTransactionsModal } from './components/AffectedTransactionsModal'
import { ProcessingProgress } from './components/ProcessingProgress'
import { PartialFailureBanner } from './components/PartialFailureBanner'
import {
	getCategorizationStatus,
	startCategorization,
	getSuggestions,
	approveSuggestion,
	rejectSuggestion,
	clearAllSuggestions,
} from './api/ai-categorization'
import { fetchCategories } from '@main/features/categories/api/categories'
import type {
	CategorizationStatus,
	AISuggestion,
	SuggestionsResponse,
	EditSuggestionInput,
	SkippedTransaction,
	AIProcessingError,
} from './types'
import type { Category } from '@main/features/categories'

type ScreenState = 'loading' | 'idle' | 'processing' | 'suggestions' | 'empty' | 'error' | 'ai_error'

export function SmartCategorizationScreen() {
	const navigate = useNavigate()
	const [screenState, setScreenState] = useState<ScreenState>('loading')
	const [status, setStatus] = useState<CategorizationStatus | null>(null)
	const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
	const [skippedTransactions, setSkippedTransactions] = useState<SkippedTransaction[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [error, setError] = useState<string | null>(null)
	const [aiError, setAiError] = useState<AIProcessingError | null>(null)
	const [isProcessing, setIsProcessing] = useState(false)
	const [isPartialResults, setIsPartialResults] = useState(false)

	// Modal states
	const [editingSuggestion, setEditingSuggestion] = useState<AISuggestion | null>(null)
	const [viewingTransactions, setViewingTransactions] = useState<AISuggestion | null>(null)
	const [rejectingId, setRejectingId] = useState<string | null>(null)
	const [showClearConfirm, setShowClearConfirm] = useState(false)

	const loadStatus = useCallback(async () => {
		try {
			const data = await getCategorizationStatus()
			setStatus(data)
			return data
		} catch (err) {
			throw err
		}
	}, [])

	const loadSuggestions = useCallback(async () => {
		try {
			const data = await getSuggestions()
			setSuggestions(data.suggestions)
			setSkippedTransactions(data.skippedTransactions)
			setIsPartialResults(data.isPartial)
			return data
		} catch (err) {
			throw err
		}
	}, [])

	const loadCategories = useCallback(async () => {
		try {
			const data = await fetchCategories()
			setCategories(data)
		} catch (err) {
			console.error('Failed to load categories:', err)
		}
	}, [])

	const determineScreenState = useCallback((
		statusData: CategorizationStatus,
		suggestionsData?: SuggestionsResponse
	): ScreenState => {
		// Check for AI error first (highest priority)
		if (statusData.hasError && statusData.error) {
			return 'ai_error'
		}
		if (statusData.isProcessing) {
			return 'processing'
		}
		if (suggestionsData && suggestionsData.suggestions.length > 0) {
			return 'suggestions'
		}
		if (statusData.uncategorizedCount === 0) {
			return 'empty'
		}
		return 'idle'
	}, [])

	const initialize = useCallback(async () => {
		setScreenState('loading')
		setError(null)
		setAiError(null)

		try {
			const [statusData] = await Promise.all([
				loadStatus(),
				loadCategories(),
			])

			let suggestionsData: SuggestionsResponse | undefined

			// Load suggestions if any pending
			if (statusData.pendingSuggestionsCount > 0) {
				suggestionsData = await loadSuggestions()
			}

			// Check for AI error with partial results
			if (statusData.hasError && statusData.error) {
				setAiError(statusData.error)
				// If we have suggestions despite the error, show them with the error banner
				if (suggestionsData && suggestionsData.suggestions.length > 0) {
					setScreenState('suggestions')
				} else {
					setScreenState('ai_error')
				}
				return
			}

			setScreenState(determineScreenState(statusData, suggestionsData))
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
			setScreenState('error')
		}
	}, [loadStatus, loadCategories, loadSuggestions, determineScreenState])

	useEffect(() => {
		initialize()
	}, [initialize])

	// Polling for processing state
	useEffect(() => {
		if (screenState !== 'processing') return

		const pollInterval = setInterval(async () => {
			try {
				const statusData = await loadStatus()

				// Check for AI error - but also check for partial results
				if (statusData.hasError && statusData.error) {
					setAiError(statusData.error)
					// Load suggestions to check for partial results
					const suggestionsData = await loadSuggestions()
					if (suggestionsData.suggestions.length > 0) {
						// Partial failure - show suggestions with error banner
						setScreenState('suggestions')
					} else {
						setScreenState('ai_error')
					}
					return
				}

				// Fetch suggestions during processing for incremental display
				if (statusData.pendingSuggestionsCount > 0) {
					await loadSuggestions()
				}

				if (!statusData.isProcessing) {
					const suggestionsData = await loadSuggestions()
					setScreenState(determineScreenState(statusData, suggestionsData))
				}
			} catch (err) {
				console.error('Polling error:', err)
			}
		}, 3000)

		return () => clearInterval(pollInterval)
	}, [screenState, loadStatus, loadSuggestions, determineScreenState])

	const handleStartCategorization = useCallback(async () => {
		setIsProcessing(true)
		setError(null)

		try {
			await startCategorization()
			setScreenState('processing')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao iniciar categorizacao')
		} finally {
			setIsProcessing(false)
		}
	}, [])

	const handleRetry = useCallback(async () => {
		setAiError(null)
		setScreenState('idle')
		await handleStartCategorization()
	}, [handleStartCategorization])

	const handleApprove = useCallback(async (id: string, edits?: EditSuggestionInput) => {
		setIsProcessing(true)
		setError(null)

		try {
			await approveSuggestion(id, edits)
			setSuggestions(prev => prev.filter(s => s.id !== id))
			setEditingSuggestion(null)

			// Check if we need to update state
			const remaining = suggestions.length - 1
			if (remaining === 0) {
				const statusData = await loadStatus()
				setScreenState(determineScreenState(statusData))
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao aprovar sugestao')
		} finally {
			setIsProcessing(false)
		}
	}, [suggestions.length, loadStatus, determineScreenState])

	const handleReject = useCallback(async (id: string) => {
		setIsProcessing(true)
		setError(null)

		try {
			const result = await rejectSuggestion(id, 'skip')

			if (result.newSuggestion) {
				setSuggestions(prev =>
					prev.map(s => s.id === id ? result.newSuggestion! : s)
				)
			} else {
				setSuggestions(prev => prev.filter(s => s.id !== id))

				// Check if we need to update state
				const remaining = suggestions.length - 1
				if (remaining === 0) {
					const statusData = await loadStatus()
					setScreenState(determineScreenState(statusData))
				}
			}

			setRejectingId(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao rejeitar sugestao')
		} finally {
			setIsProcessing(false)
		}
	}, [suggestions.length, loadStatus, determineScreenState])

	const handleClearAll = useCallback(async () => {
		setIsProcessing(true)
		setError(null)

		try {
			await clearAllSuggestions()
			setSuggestions([])
			setSkippedTransactions([])
			setShowClearConfirm(false)

			const statusData = await loadStatus()
			setScreenState(determineScreenState(statusData))
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao limpar sugestoes')
		} finally {
			setIsProcessing(false)
		}
	}, [loadStatus, determineScreenState])

	const handleEdit = useCallback((suggestion: AISuggestion) => {
		setEditingSuggestion(suggestion)
	}, [])

	const handleViewAllTransactions = useCallback((suggestion: AISuggestion) => {
		setViewingTransactions(suggestion)
	}, [])

	const handleSaveEdit = useCallback((id: string, edits: EditSuggestionInput) => {
		handleApprove(id, edits)
	}, [handleApprove])

	// Loading State
	if (screenState === 'loading') {
		return (
			<div data-testid="ai-categorization-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto">
					<div className="text-center py-12">
						<div className="animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto" />
						<p className="mt-4 text-[var(--color-text-secondary)]">Carregando...</p>
					</div>
				</div>
			</div>
		)
	}

	// Error State
	if (screenState === 'error') {
		return (
			<div data-testid="ai-categorization-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
						AI Assistant
					</h1>
					<div
						data-testid="error-state"
						className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-red-200"
					>
						<div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
							<svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
							Erro ao carregar
						</h3>
						<p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
						<Button onClick={initialize}>Tentar novamente</Button>
					</div>
				</div>
			</div>
		)
	}

	// AI Error State - Processing error from backend
	if (screenState === 'ai_error' && aiError) {
		return (
			<div data-testid="ai-categorization-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
						AI Assistant
					</h1>
					<div
						data-testid="ai-error-state"
						className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-amber-200 dark:border-amber-800"
					>
						<div className="w-16 h-16 mx-auto mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
							<svg className="w-8 h-8 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
							Erro no Processamento
						</h3>
						<p className="text-[var(--color-text-secondary)] mb-2">
							{aiError.message}
						</p>
						{aiError.code && (
							<p className="text-xs text-[var(--color-text-tertiary)] mb-4">
								Codigo: {aiError.code}
							</p>
						)}
						<div className="flex gap-3 justify-center">
							<Button
								data-testid="retry-categorization-btn"
								onClick={handleRetry}
								disabled={isProcessing}
							>
								{isProcessing ? 'Iniciando...' : 'Tentar Novamente'}
							</Button>
							<Button
								variant="secondary"
								onClick={() => navigate('/dashboard')}
							>
								Voltar ao Dashboard
							</Button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div data-testid="ai-categorization-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold text-[var(--color-text)]">
							AI Assistant
						</h1>
						<p className="text-[var(--color-text-secondary)]">
							Categorizacao inteligente de transacoes
						</p>
					</div>

					{screenState === 'suggestions' && suggestions.length > 0 && (
						<Button
							data-testid="clear-all-btn"
							variant="secondary"
							onClick={() => setShowClearConfirm(true)}
							disabled={isProcessing}
						>
							Limpar Tudo
						</Button>
					)}
				</div>

				{/* Error Banner */}
				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
						{error}
						<button
							className="ml-4 text-sm underline"
							onClick={() => setError(null)}
						>
							Fechar
						</button>
					</div>
				)}

				{/* Empty State - No uncategorized transactions */}
				{screenState === 'empty' && (
					<div
						data-testid="empty-state"
						className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
					>
						<div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
							<svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
							Tudo categorizado!
						</h3>
						<p className="text-[var(--color-text-secondary)] mb-4">
							Todas as suas transacoes ja estao categorizadas.
						</p>
						<Button variant="secondary" onClick={() => navigate('/dashboard')}>
							Ir para Dashboard
						</Button>
					</div>
				)}

				{/* Idle State - Has uncategorized transactions */}
				{screenState === 'idle' && status && (
					<div
						data-testid="idle-state"
						className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
					>
						<div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center">
							<svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
						<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
							{status.uncategorizedCount} {status.uncategorizedCount === 1 ? 'transacao' : 'transacoes'} sem categoria
						</h3>
						<p className="text-[var(--color-text-secondary)] mb-4">
							Use a IA para categorizar automaticamente suas transacoes.
						</p>
						<Button
							data-testid="start-categorization-btn"
							onClick={handleStartCategorization}
							disabled={isProcessing}
						>
							{isProcessing ? 'Iniciando...' : 'Iniciar Categorizacao'}
						</Button>
					</div>
				)}

				{/* Processing State */}
				{screenState === 'processing' && (
					<div data-testid="processing-state" className="space-y-6">
						{/* Progress Indicator */}
						{status?.progress ? (
							<ProcessingProgress
								progress={status.progress}
								pendingSuggestionsCount={suggestions.length}
							/>
						) : (
							<div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
								<div className="animate-spin w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4" />
								<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
									Iniciando processamento...
								</h3>
								<p className="text-[var(--color-text-secondary)]">
									A IA esta analisando suas transacoes e criando sugestoes de categorizacao.
								</p>
							</div>
						)}

						{/* Incremental Suggestions Display */}
						{suggestions.length > 0 && (
							<>
								<div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
									<span>{suggestions.length} sugestoes prontas</span>
									<span data-testid="more-suggestions-loading" className="text-xs">(mais a caminho...)</span>
								</div>
								<div data-testid="suggestions-list" className="space-y-4">
									{suggestions.map((suggestion) => (
										<SuggestionCard
											key={suggestion.id}
											suggestion={suggestion}
											onApprove={handleApprove}
											onReject={(id) => setRejectingId(id)}
											onEdit={handleEdit}
											onViewAll={handleViewAllTransactions}
											isProcessing={isProcessing}
										/>
									))}
								</div>
							</>
						)}
					</div>
				)}

				{/* Suggestions State */}
				{screenState === 'suggestions' && (
					<>
						{/* Partial Failure Banner */}
						{aiError && suggestions.length > 0 && (
							<div className="mb-6">
								<PartialFailureBanner
									error={aiError}
									suggestionsCount={suggestions.length}
									uncategorizedCount={status?.uncategorizedCount ?? 0}
									onRetry={handleRetry}
									isRetrying={isProcessing}
								/>
							</div>
						)}

						{/* Stats */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
							<div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
								<p className="text-2xl font-bold text-[var(--color-text)]">{suggestions.length}</p>
								<p className="text-sm text-[var(--color-text-secondary)]">Sugestoes</p>
							</div>
							<div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
								<p className="text-2xl font-bold text-[var(--color-text)]">
									{suggestions.reduce((acc, s) => acc + s.affectedCount, 0)}
								</p>
								<p className="text-sm text-[var(--color-text-secondary)]">Transacoes</p>
							</div>
							{skippedTransactions.length > 0 && (
								<div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 text-center">
									<p className="text-2xl font-bold text-amber-600">{skippedTransactions.length}</p>
									<p className="text-sm text-[var(--color-text-secondary)]">Ignoradas</p>
								</div>
							)}
						</div>

						{/* Suggestions List */}
						<div data-testid="suggestions-list" className="space-y-4">
							{suggestions.map((suggestion) => (
								<SuggestionCard
									key={suggestion.id}
									suggestion={suggestion}
									onApprove={handleApprove}
									onReject={(id) => setRejectingId(id)}
									onEdit={handleEdit}
									onViewAll={handleViewAllTransactions}
									isProcessing={isProcessing}
								/>
							))}
						</div>

						{/* Skipped Transactions Section */}
						{skippedTransactions.length > 0 && (
							<div className="mt-8">
								<h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
									Transacoes Ignoradas
								</h2>
								<div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
									<p className="text-sm text-[var(--color-text-secondary)] mb-3">
										Estas transacoes foram ignoradas pela IA por conflitos ou erros.
									</p>
									<div className="space-y-2">
										{skippedTransactions.map((tx) => (
											<div
												key={tx.id}
												className="flex items-center justify-between py-2 px-3 bg-[var(--color-background)] rounded-lg"
											>
												<div className="flex-1">
													<p className="text-sm text-[var(--color-text)]">{tx.description}</p>
													<p className="text-xs text-amber-600">{tx.skipReason}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* Edit Modal */}
			<EditSuggestionModal
				isOpen={!!editingSuggestion}
				onClose={() => setEditingSuggestion(null)}
				onSave={handleSaveEdit}
				suggestion={editingSuggestion}
				categories={categories}
				isSaving={isProcessing}
			/>

			{/* Reject Confirmation */}
			<Modal
				isOpen={!!rejectingId}
				onClose={() => setRejectingId(null)}
				title="Rejeitar Sugestao"
				size="sm"
				data-testid="reject-dialog"
				footer={
					<>
						<Button
							variant="secondary"
							onClick={() => setRejectingId(null)}
							disabled={isProcessing}
						>
							Cancelar
						</Button>
						<Button
							data-testid="confirm-reject-btn"
							variant="danger"
							onClick={() => rejectingId && handleReject(rejectingId)}
							disabled={isProcessing}
						>
							{isProcessing ? 'Rejeitando...' : 'Rejeitar'}
						</Button>
					</>
				}
			>
				<p className="text-[var(--color-text-secondary)]">
					Tem certeza que deseja rejeitar esta sugestao? A transacao sera ignorada para categorizacao automatica.
				</p>
			</Modal>

			{/* Clear All Confirmation */}
			<Modal
				isOpen={showClearConfirm}
				onClose={() => setShowClearConfirm(false)}
				title="Limpar Todas as Sugestoes"
				size="sm"
				data-testid="clear-confirm-dialog"
				footer={
					<>
						<Button
							variant="secondary"
							onClick={() => setShowClearConfirm(false)}
							disabled={isProcessing}
						>
							Cancelar
						</Button>
						<Button
							data-testid="confirm-clear-btn"
							variant="danger"
							onClick={handleClearAll}
							disabled={isProcessing}
						>
							{isProcessing ? 'Limpando...' : 'Limpar Tudo'}
						</Button>
					</>
				}
			>
				<p className="text-[var(--color-text-secondary)]">
					Tem certeza que deseja limpar todas as sugestoes? Esta acao nao pode ser desfeita.
				</p>
			</Modal>

			{/* Affected Transactions Modal */}
			<AffectedTransactionsModal
				isOpen={!!viewingTransactions}
				onClose={() => setViewingTransactions(null)}
				suggestion={viewingTransactions}
			/>
		</div>
	)
}

export default SmartCategorizationScreen
