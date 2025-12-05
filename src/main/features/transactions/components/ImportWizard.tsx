import { useState, useCallback, useRef } from 'react'
import { Modal } from '@main/components/ui/Modal'
import { Button } from '@main/components/ui/Button'
import { Select } from '@main/components/ui/Select'
import { useToast } from '@main/components/layout/Toast'
import { ColumnMappingUI, validateColumnMapping, extractCSVHeaders } from './ColumnMappingUI'
import type { ColumnMapping, ColumnMappingField } from './ColumnMappingUI'
import {
	parseCreditCardCSV,
	toApiFormat,
	validateCreditCardCSV,
	getCCSummary,
} from '@main/features/credit-card/utils/credit-card-parser'
import {
	previewCreditCardImport,
	importCreditCardTransactions,
} from '@main/features/credit-card/api/credit-card'
import { CreditCardMatchPreview } from '@main/features/credit-card/components/CreditCardMatchPreview'
import type {
	CreditCardTransaction,
	ImportPreview,
	ConfirmedMatch,
	ParsedCCLine,
} from '@main/features/credit-card'

interface ParsedTransaction {
	id: string
	date: string
	description: string
	amount: number
	type: 'income' | 'expense'
	categoryId?: string
	isDuplicate?: boolean
	duplicateReason?: string
	isSelected: boolean
}

interface ImportWizardProps {
	isOpen: boolean
	onClose: () => void
	onImport: (transactions: ParsedTransaction[]) => void | Promise<void>
	onCCImportSuccess?: () => void | Promise<void>
	categoryOptions: Array<{ value: string; label: string }>
}

type Step = 'upload' | 'categorize' | 'cc-preview' | 'success'

const BANK_FORMAT_OPTIONS = [
	{ value: 'auto', label: 'Auto Detect' },
	{ value: 'nubank', label: 'Nubank' },
	{ value: 'nubank-cc', label: 'Nubank Cartao de Credito' },
	{ value: 'inter', label: 'Banco Inter' },
	{ value: 'itau', label: 'Itau' },
	{ value: 'custom', label: 'Personalizado' },
]

export function ImportWizard({ isOpen, onClose, onImport, onCCImportSuccess, categoryOptions }: ImportWizardProps) {
	const { showToast } = useToast()
	const [step, setStep] = useState<Step>('upload')
	const [bankFormat, setBankFormat] = useState('auto')
	const [file, setFile] = useState<File | null>(null)
	const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [ignoreDuplicates, setIgnoreDuplicates] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Column mapping state for custom format
	const [csvHeaders, setCsvHeaders] = useState<string[]>([])
	const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
	const [mappingError, setMappingError] = useState<string | null>(null)
	const [rawContent, setRawContent] = useState<string>('')

	// Credit card import state
	const [ccTransactions, setCCTransactions] = useState<CreditCardTransaction[]>([])
	const [ccPreview, setCCPreview] = useState<ImportPreview | null>(null)
	const [ccParsedLines, setCCParsedLines] = useState<ParsedCCLine[]>([])
	const [importedCCCount, setImportedCCCount] = useState(0)

	// Confirmation dialog state
	const [showImportConfirm, setShowImportConfirm] = useState(false)
	const [pendingConfirmData, setPendingConfirmData] = useState<{
		confirmedMatches: ConfirmedMatch[]
		skipUnmatched: boolean
	} | null>(null)

	const resetState = useCallback(() => {
		setStep('upload')
		setBankFormat('auto')
		setFile(null)
		setParsedTransactions([])
		setIsLoading(false)
		setError(null)
		setIgnoreDuplicates(false)
		setCsvHeaders([])
		setColumnMapping({})
		setMappingError(null)
		setRawContent('')
		// Reset CC state
		setCCTransactions([])
		setCCPreview(null)
		setCCParsedLines([])
		setImportedCCCount(0)
		// Reset confirmation dialog state
		setShowImportConfirm(false)
		setPendingConfirmData(null)
	}, [])

	const handleClose = useCallback(async () => {
		resetState()
		await onClose()
	}, [onClose, resetState])

	const parseCSV = useCallback((content: string, customMapping?: ColumnMapping): ParsedTransaction[] => {
		const lines = content.trim().split('\n')
		if (lines.length < 2) return []

		const headers = lines[0].split(',').map(h => h.trim())
		const headersLower = headers.map(h => h.toLowerCase())
		let dateIdx: number
		let descIdx: number
		let amountIdx: number

		if (customMapping) {
			// Use custom column mapping
			dateIdx = headers.findIndex(h => customMapping[h] === 'date')
			descIdx = headers.findIndex(h => customMapping[h] === 'description')
			amountIdx = headers.findIndex(h => customMapping[h] === 'amount')
		} else {
			// Auto-detect columns
			dateIdx = headersLower.findIndex(h => h.includes('data') || h.includes('date'))
			descIdx = headersLower.findIndex(h => h.includes('descri') || h.includes('description'))
			amountIdx = headersLower.findIndex(h => h.includes('valor') || h.includes('amount') || h.includes('value'))
		}

		if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
			throw new Error('Could not detect columns. Please use custom format.')
		}

		const transactions: ParsedTransaction[] = []
		const seen = new Set<string>()

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(',').map(v => v.trim())
			if (values.length < 3) continue

			const date = values[dateIdx]
			const description = values[descIdx]
			const amountStr = values[amountIdx].replace(/[^\d.,\-]/g, '').replace(',', '.')
			const amount = parseFloat(amountStr)

			if (isNaN(amount)) continue

			const key = `${date}-${description}-${amount}`
			const isDuplicate = seen.has(key)
			seen.add(key)

			transactions.push({
				id: `import-${i}-${Date.now()}`,
				date,
				description,
				amount: Math.abs(amount),
				type: amount < 0 ? 'expense' : 'income',
				isDuplicate,
				duplicateReason: isDuplicate ? 'Duplicate in file' : undefined,
				isSelected: !isDuplicate,
			})
		}

		return transactions
	}, [])

	const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (!selectedFile) return

		setError(null)
		setMappingError(null)

		// Validate file type
		const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain']
		const validExtensions = ['.csv', '.ofx']
		const hasValidExtension = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))

		if (!validTypes.includes(selectedFile.type) && !hasValidExtension) {
			setError('Invalid file type. Please upload a CSV or OFX file.')
			return
		}

		setFile(selectedFile)
		setIsLoading(true)

		try {
			const content = await selectedFile.text()
			setRawContent(content)

			// For Nubank Credit Card format
			if (bankFormat === 'nubank-cc') {
				const validation = validateCreditCardCSV(content)
				if (!validation.valid) {
					setError(validation.error || 'Formato de arquivo invalido para cartao de credito')
					setIsLoading(false)
					return
				}

				const parsedLines = parseCreditCardCSV(content)
				if (parsedLines.length === 0) {
					setError('Nenhuma transacao encontrada no arquivo.')
					setIsLoading(false)
					return
				}

				setCCParsedLines(parsedLines)
				const apiTransactions = toApiFormat(parsedLines)
				setCCTransactions(apiTransactions)

				// Get summary for display
				const summary = getCCSummary(parsedLines)
				// Use summary for preview info display later
				setIsLoading(false)
				return
			}

			// For custom format, extract headers and wait for user mapping
			if (bankFormat === 'custom') {
				const headers = extractCSVHeaders(content)
				if (headers.length === 0) {
					setError('Could not extract headers from CSV file.')
					setIsLoading(false)
					return
				}
				setCsvHeaders(headers)
				// Initialize empty mapping for each header
				const initialMapping: ColumnMapping = {}
				headers.forEach(h => {
					initialMapping[h] = ''
				})
				setColumnMapping(initialMapping)
				setParsedTransactions([])
				setIsLoading(false)
				return
			}

			// For other formats, auto-detect columns
			const transactions = parseCSV(content)

			if (transactions.length === 0) {
				setError('No transactions found in file. Please check the format.')
				setIsLoading(false)
				return
			}

			setParsedTransactions(transactions)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to parse file')
		} finally {
			setIsLoading(false)
		}
	}, [parseCSV, bankFormat])

	const handleBrowseFiles = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	const handleColumnMappingChange = useCallback((newMapping: ColumnMapping) => {
		setColumnMapping(newMapping)
		setMappingError(null)

		// Validate the mapping
		const validationError = validateColumnMapping(newMapping)
		if (validationError) {
			setMappingError(validationError)
			setParsedTransactions([])
			return
		}

		// If valid, re-parse the CSV with the custom mapping
		if (rawContent) {
			try {
				const transactions = parseCSV(rawContent, newMapping)
				if (transactions.length === 0) {
					setError('No transactions found in file.')
					setParsedTransactions([])
					return
				}
				setError(null)
				setParsedTransactions(transactions)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to parse file')
				setParsedTransactions([])
			}
		}
	}, [rawContent, parseCSV])

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		const droppedFile = e.dataTransfer.files[0]
		if (droppedFile && fileInputRef.current) {
			const dt = new DataTransfer()
			dt.items.add(droppedFile)
			fileInputRef.current.files = dt.files
			fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
		}
	}, [])

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
	}, [])

	const handleRowSelection = useCallback((id: string) => {
		setParsedTransactions(prev =>
			prev.map(t => (t.id === id ? { ...t, isSelected: !t.isSelected } : t))
		)
	}, [])

	const handleCategoryChange = useCallback((id: string, categoryId: string) => {
		setParsedTransactions(prev =>
			prev.map(t => (t.id === id ? { ...t, categoryId } : t))
		)
	}, [])

	const handleNext = useCallback(async () => {
		if (step === 'upload') {
			// For CC format, go to CC preview step and fetch preview from API
			if (bankFormat === 'nubank-cc') {
				setIsLoading(true)
				setError(null)
				try {
					const preview = await previewCreditCardImport(ccTransactions)
					setCCPreview(preview)
					setStep('cc-preview')
				} catch (err) {
					setError(err instanceof Error ? err.message : 'Erro ao analisar transacoes do cartao')
				} finally {
					setIsLoading(false)
				}
				return
			}
			setStep('categorize')
		}
	}, [step, bankFormat, ccTransactions])

	const handleBack = useCallback(() => {
		if (step === 'categorize' || step === 'cc-preview') {
			setStep('upload')
			setCCPreview(null)
		}
	}, [step])

	// Show confirmation dialog before CC import
	const handleCCImportConfirm = useCallback(
		(confirmedMatches: ConfirmedMatch[], skipUnmatched: boolean) => {
			setPendingConfirmData({ confirmedMatches, skipUnmatched })
			setShowImportConfirm(true)
		},
		[]
	)

	// Actually execute the CC import after confirmation
	const handleConfirmImportAction = useCallback(
		async () => {
			if (!pendingConfirmData) return

			setShowImportConfirm(false)
			setIsLoading(true)
			setError(null)
			try {
				const result = await importCreditCardTransactions(
					ccTransactions,
					pendingConfirmData.confirmedMatches,
					pendingConfirmData.skipUnmatched
				)
				setImportedCCCount(result.importedCount)
				showToast('success', `${result.importedCount} transacoes importadas com sucesso!`)
				// Trigger a refresh of the transaction list immediately after successful CC import
				if (onCCImportSuccess) {
					await onCCImportSuccess()
				}
				// Show success step briefly, then auto-close after a short delay
				// This allows E2E tests that expect the success dialog to find it
				// while also ensuring the modal closes to allow page interactions
				setStep('success')
				setTimeout(() => {
					onClose()
				}, 1500)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Erro ao importar transacoes')
			} finally {
				setIsLoading(false)
				setPendingConfirmData(null)
			}
		},
		[ccTransactions, pendingConfirmData, showToast, onCCImportSuccess, onClose]
	)

	const handleImport = useCallback(async () => {
		const transactionsToImport = parsedTransactions.filter(t => {
			if (!t.isSelected) return false
			if (ignoreDuplicates && t.isDuplicate) return false
			return true
		})

		setIsLoading(true)
		try {
			await onImport(transactionsToImport)
			setStep('success')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to import transactions')
		} finally {
			setIsLoading(false)
		}
	}, [parsedTransactions, ignoreDuplicates, onImport])

	const selectedCount = parsedTransactions.filter(t => t.isSelected && (!ignoreDuplicates || !t.isDuplicate)).length

	const formatCurrency = (amount: number, type: 'income' | 'expense') => {
		const formatted = new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(amount)
		return type === 'expense' ? `-${formatted}` : `+${formatted}`
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={step === 'success' ? 'Import Complete' : 'Import Transactions'}
			size="lg"
		>
			<div data-testid="import-modal-title" className="sr-only">
				{step === 'success' ? 'Import Complete' : 'Importar Transações'}
			</div>

			{/* Step Indicator */}
			<div data-testid="import-step-indicator" className="flex items-center justify-center gap-4 mb-6">
				<div
					data-testid="import-step-1"
					className={`flex items-center gap-2 ${step === 'upload' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
				>
					<div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
						1
					</div>
					<span className="font-medium">Upload</span>
				</div>
				<div className="w-12 h-0.5 bg-[var(--color-border)]" />
				<div
					data-testid="import-step-2"
					className={`flex items-center gap-2 ${step === 'categorize' || step === 'cc-preview' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
				>
					<div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'categorize' || step === 'cc-preview' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
						2
					</div>
					<span className="font-medium">{bankFormat === 'nubank-cc' ? 'Vincular' : 'Categorize'}</span>
				</div>
			</div>

			{/* Step Content */}
			{step === 'upload' && (
				<div data-testid="modal-body">
					{/* Bank Format Selector */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-[var(--color-text)] mb-1">
							Bank Format
						</label>
						<div data-testid="bank-format-selector">
							<Select
								options={BANK_FORMAT_OPTIONS}
								value={bankFormat}
								onChange={setBankFormat}
								placeholder="Select bank format"
							/>
						</div>
					</div>

					{/* Info text for Credit Card format */}
					{bankFormat === 'nubank-cc' && (
						<div data-testid="cc-info-text" className="mb-4 p-3 bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-lg">
							<p className="text-sm text-[var(--color-primary)]">
								O extrato do cartao de credito sera vinculado a transacoes "Pagamento de fatura" existentes.
								As compras individuais substituirao o pagamento agregado.
							</p>
						</div>
					)}

					{/* File Drop Zone */}
					<div
						data-testid="file-drop-zone"
						className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
							file ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
						}`}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept=".csv,.ofx"
							onChange={handleFileSelect}
							className="hidden"
						/>

						{isLoading ? (
							<div data-testid="upload-progress" className="flex flex-col items-center gap-2">
								<div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
								<p className="text-[var(--color-text-secondary)]">Processing file...</p>
							</div>
						) : file ? (
							<div className="flex flex-col items-center gap-2">
								<div className="text-4xl">📄</div>
								<p className="font-medium text-[var(--color-text)]">{file.name}</p>
								<Button variant="outline" size="sm" onClick={() => setFile(null)}>
									Remove
								</Button>
							</div>
						) : (
							<div className="flex flex-col items-center gap-2">
								<div className="text-4xl">📂</div>
								<p className="text-[var(--color-text-secondary)]">
									Drag and drop your file here, or
								</p>
								<Button
									data-testid="browse-files-btn"
									variant="outline"
									onClick={handleBrowseFiles}
								>
									Browse Files
								</Button>
								<p className="text-sm text-[var(--color-text-muted)]">
									Supports CSV and OFX formats
								</p>
							</div>
						)}
					</div>

					{/* Column Mapping UI for Custom Format */}
					{bankFormat === 'custom' && csvHeaders.length > 0 && (
						<ColumnMappingUI
							csvHeaders={csvHeaders}
							mapping={columnMapping}
							onMappingChange={handleColumnMappingChange}
							error={mappingError || undefined}
						/>
					)}

					{/* Error Message */}
					{error && (
						<div data-testid="parse-error" className="mt-4 p-3 bg-[var(--color-error-50)] border border-[var(--color-error-200)] rounded-lg text-[var(--color-error)]">
							{error}
						</div>
					)}

					{/* Preview Table */}
					{parsedTransactions.length > 0 && (
						<div className="mt-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold text-[var(--color-text)]">
									Preview ({parsedTransactions.length} transactions)
								</h3>
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={ignoreDuplicates}
										onChange={e => setIgnoreDuplicates(e.target.checked)}
										data-testid="ignore-duplicates-checkbox"
										className="w-4 h-4 rounded border-[var(--color-border)]"
									/>
									<span className="text-sm text-[var(--color-text-secondary)]">
										Ignore duplicates
									</span>
								</label>
							</div>

							<div data-testid="import-preview-table" className="border border-[var(--color-border)] rounded-lg overflow-hidden max-h-64 overflow-y-auto">
								<table className="w-full">
									<thead className="bg-[var(--color-surface)] sticky top-0">
										<tr>
											<th className="p-2 text-left text-sm font-medium text-[var(--color-text-secondary)]">
												<input
													type="checkbox"
													checked={parsedTransactions.every(t => t.isSelected)}
													onChange={() => {
														const allSelected = parsedTransactions.every(t => t.isSelected)
														setParsedTransactions(prev =>
															prev.map(t => ({ ...t, isSelected: !allSelected }))
														)
													}}
													className="w-4 h-4 rounded border-[var(--color-border)]"
												/>
											</th>
											<th className="p-2 text-left text-sm font-medium text-[var(--color-text-secondary)]">Date</th>
											<th className="p-2 text-left text-sm font-medium text-[var(--color-text-secondary)]">Description</th>
											<th className="p-2 text-right text-sm font-medium text-[var(--color-text-secondary)]">Amount</th>
										</tr>
									</thead>
									<tbody>
										{parsedTransactions.map(transaction => (
											<tr
												key={transaction.id}
												data-testid="import-preview-row"
												className={`border-t border-[var(--color-border)] ${
													transaction.isDuplicate ? 'bg-[var(--color-warning-50)]' : ''
												}`}
											>
												<td className="p-2">
													<input
														type="checkbox"
														checked={transaction.isSelected}
														onChange={() => handleRowSelection(transaction.id)}
														data-testid="import-row-checkbox"
														className="w-4 h-4 rounded border-[var(--color-border)]"
													/>
												</td>
												<td className="p-2 text-sm text-[var(--color-text)]">
													{transaction.date}
												</td>
												<td className="p-2 text-sm text-[var(--color-text)]">
													<div className="flex items-center gap-2">
														{transaction.isDuplicate && (
															<span
																data-testid="duplicate-warning-icon"
																title={transaction.duplicateReason}
																className="text-[var(--color-warning)]"
															>
																⚠️
															</span>
														)}
														{transaction.description}
													</div>
												</td>
												<td className={`p-2 text-sm text-right font-medium ${
													transaction.type === 'expense' ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'
												}`}>
													{formatCurrency(transaction.amount, transaction.type)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div data-testid="import-selected-count" className="mt-2 text-sm text-[var(--color-text-secondary)]">
								{selectedCount} transactions selected for import
							</div>
						</div>
					)}

					{/* Credit Card Preview */}
					{bankFormat === 'nubank-cc' && ccTransactions.length > 0 && (
						<div className="mt-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold text-[var(--color-text)]">
									Transacoes do Cartao (<span data-testid="transaction-count">{ccTransactions.length}</span> transacoes)
								</h3>
								{ccTransactions.find(t => t.isPaymentReceived) && (
									<span data-testid="billing-cycle-display" className="text-sm text-[var(--color-text-secondary)]">
										{ccTransactions.find(t => t.isPaymentReceived)?.date?.substring(0, 7)}
									</span>
								)}
							</div>

							<div data-testid="import-preview-table" className="border border-[var(--color-border)] rounded-lg overflow-hidden max-h-64 overflow-y-auto">
								<table className="w-full">
									<thead className="bg-[var(--color-surface)] sticky top-0">
										<tr>
											<th className="p-2 text-left text-sm font-medium text-[var(--color-text-secondary)]">Data</th>
											<th className="p-2 text-left text-sm font-medium text-[var(--color-text-secondary)]">Descricao</th>
											<th className="p-2 text-right text-sm font-medium text-[var(--color-text-secondary)]">Valor</th>
										</tr>
									</thead>
									<tbody>
										{ccTransactions.map((tx, idx) => (
											<tr
												key={idx}
												data-testid={tx.isPaymentReceived ? 'payment-received-row' : 'transaction-row'}
												className={`border-t border-[var(--color-border)] ${tx.isPaymentReceived ? 'bg-[var(--color-success-50)]' : ''}`}
											>
												<td className="p-2 text-sm text-[var(--color-text)]">
													{tx.date}
												</td>
												<td className="p-2 text-sm text-[var(--color-text)]">
													<div className="flex items-center gap-2">
														{tx.title}
														{tx.installmentCurrent && tx.installmentTotal && (
															<span data-testid="installment-indicator" className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
																{tx.installmentCurrent}/{tx.installmentTotal}
															</span>
														)}
														{tx.isPaymentReceived && (
															<span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
																Pagamento
															</span>
														)}
													</div>
												</td>
												<td className={`p-2 text-sm text-right font-medium ${tx.isPaymentReceived || tx.amount < 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
													{tx.amount < 0 ? '-' : ''}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(tx.amount))}
													<span className="sr-only">{tx.amount.toFixed(2)}</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="mt-2 text-sm text-[var(--color-text-secondary)]">
								{ccTransactions.filter(t => !t.isPaymentReceived).length} transacoes serao importadas
							</div>
						</div>
					)}
				</div>
			)}

			{step === 'categorize' && (
				<div data-testid="categorize-transactions-form">
					<p className="mb-4 text-[var(--color-text-secondary)]">
						Assign categories to your transactions:
					</p>

					{/* Error Message */}
					{error && (
						<div data-testid="import-error-message" className="mb-4 p-3 bg-[var(--color-error-50)] border border-[var(--color-error-200)] rounded-lg text-[var(--color-error)]">
							{error}
						</div>
					)}

					<div className="border border-[var(--color-border)] rounded-lg overflow-hidden max-h-96 overflow-y-auto">
						<table className="w-full">
							<thead className="bg-[var(--color-surface)] sticky top-0">
								<tr>
									<th className="p-2 text-left text-sm font-medium text-[var(--color-text-secondary)]">Description</th>
									<th className="p-2 text-left text-sm font-medium text-[var(--color-text-secondary)]">Amount</th>
									<th className="p-2 text-left text-sm font-medium text-[var(--color-text-secondary)]">Category</th>
								</tr>
							</thead>
							<tbody>
								{parsedTransactions
									.filter(t => t.isSelected && (!ignoreDuplicates || !t.isDuplicate))
									.map(transaction => (
										<tr
											key={transaction.id}
											className="border-t border-[var(--color-border)]"
										>
											<td className="p-2 text-sm text-[var(--color-text)]">
												{transaction.description}
											</td>
											<td className={`p-2 text-sm font-medium ${
												transaction.type === 'expense' ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'
											}`}>
												{formatCurrency(transaction.amount, transaction.type)}
											</td>
											<td className="p-2" data-testid="category-selector">
												<Select
													options={categoryOptions}
													value={transaction.categoryId || ''}
													onChange={value => handleCategoryChange(transaction.id, value)}
													placeholder="Select category"
												/>
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Credit Card Match Preview Step */}
			{step === 'cc-preview' && ccPreview && (
				<CreditCardMatchPreview
					matches={ccPreview.matches}
					transactions={ccTransactions}
					warnings={ccPreview.warnings}
					unmatchedCount={ccPreview.unmatchedTransactionCount}
					totalAmount={ccPreview.totalCCAmount}
					onConfirm={handleCCImportConfirm}
					onCancel={() => handleBack()}
					isLoading={isLoading}
				/>
			)}

			{step === 'success' && (
				<div data-testid="import-success" className="text-center py-8">
					<div className="text-6xl mb-4">🎉</div>
					<h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
						Importacao Concluida!
					</h3>
					<p className="text-[var(--color-text-secondary)]">
						{bankFormat === 'nubank-cc'
							? `${importedCCCount} transacoes do cartao importadas com sucesso.`
							: `${selectedCount} transacoes importadas com sucesso.`}
					</p>
				</div>
			)}

			{/* Footer - hidden during cc-preview as CreditCardMatchPreview has its own buttons */}
			{step !== 'cc-preview' && (
				<div className="flex justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
					{step === 'success' ? (
						<div className="w-full flex justify-center">
							<Button onClick={handleClose} data-testid="import-done-btn">
								Done
							</Button>
						</div>
					) : (
						<>
							<Button
								variant="outline"
								onClick={step === 'upload' ? handleClose : handleBack}
								data-testid="import-cancel-btn"
							>
								{step === 'upload' ? 'Cancel' : 'Back'}
							</Button>

							{step === 'upload' ? (
								<Button
									onClick={handleNext}
									disabled={
										(bankFormat === 'nubank-cc' ? ccTransactions.length === 0 : parsedTransactions.length === 0) ||
										(bankFormat === 'custom' && !!mappingError) ||
										isLoading
									}
									data-testid="import-next-btn"
								>
									{isLoading ? 'Analisando...' : 'Next'}
								</Button>
							) : (
								<Button
									onClick={handleImport}
									disabled={isLoading}
									data-testid="import-confirm-btn"
								>
									{isLoading ? 'Importing...' : `Import ${selectedCount} Transactions`}
								</Button>
							)}
						</>
					)}
				</div>
			)}

			{/* Import Confirmation Dialog */}
			{showImportConfirm && (
				<div
					data-testid="import-confirm-dialog"
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
				>
					<div className="bg-[var(--color-surface)] rounded-lg p-6 max-w-md mx-4 shadow-lg">
						<h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
							Confirmar Importacao
						</h3>
						<p className="text-[var(--color-text-secondary)] mb-6">
							{ccTransactions.filter(t => !t.isPaymentReceived).length} transacoes do cartao de credito serao importadas e vinculadas a fatura selecionada.
							Esta acao nao pode ser desfeita.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => {
									setShowImportConfirm(false)
									setPendingConfirmData(null)
								}}
								data-testid="cancel-import-btn"
							>
								Cancelar
							</Button>
							<Button
								onClick={handleConfirmImportAction}
								disabled={isLoading}
								data-testid="confirm-import-action-btn"
							>
								{isLoading ? 'Importando...' : 'Confirmar'}
							</Button>
						</div>
					</div>
				</div>
			)}
		</Modal>
	)
}
