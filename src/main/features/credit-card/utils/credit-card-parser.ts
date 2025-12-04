import type { ParsedCCLine, CreditCardTransaction } from '../types'

/**
 * Parse installment information from transaction title
 * Matches patterns like "Parcela 1/3", "- Parcela 2/6", etc.
 */
export function parseInstallment(title: string): { current?: number; total?: number } {
	const match = title.match(/Parcela\s*(\d+)\s*\/\s*(\d+)/i)
	if (match) {
		return {
			current: parseInt(match[1], 10),
			total: parseInt(match[2], 10),
		}
	}
	return {}
}

/**
 * Check if title indicates a "Pagamento recebido" entry
 */
export function isPaymentReceived(title: string): boolean {
	return title.toLowerCase().includes('pagamento recebido')
}

/**
 * Parse Nubank credit card CSV format
 * Format: date,title,amount
 * Date: YYYY-MM-DD
 * Amount: positive = expense, negative = payment/refund
 */
export function parseCreditCardCSV(csvContent: string): ParsedCCLine[] {
	const lines = csvContent.trim().split('\n')

	// Skip header if present
	const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0

	const transactions: ParsedCCLine[] = []

	for (let i = startIndex; i < lines.length; i++) {
		const line = lines[i].trim()
		if (!line) continue

		// Split by comma, but handle potential commas in quoted strings
		const parts = parseCSVLine(line)
		if (parts.length < 3) continue

		const [dateStr, title, amountStr] = parts

		// Parse date (YYYY-MM-DD)
		const date = new Date(dateStr + 'T00:00:00')
		if (isNaN(date.getTime())) continue

		// Parse amount
		const amount = parseFloat(amountStr)
		if (isNaN(amount)) continue

		// Parse installment if present
		const installment = parseInstallment(title)

		transactions.push({
			date,
			title: title.trim(),
			amount,
			installmentCurrent: installment.current,
			installmentTotal: installment.total,
			isPaymentReceived: isPaymentReceived(title),
		})
	}

	return transactions
}

/**
 * Parse a single CSV line, handling quoted strings
 */
function parseCSVLine(line: string): string[] {
	const result: string[] = []
	let current = ''
	let inQuotes = false

	for (let i = 0; i < line.length; i++) {
		const char = line[i]

		if (char === '"') {
			inQuotes = !inQuotes
		} else if (char === ',' && !inQuotes) {
			result.push(current)
			current = ''
		} else {
			current += char
		}
	}

	result.push(current)
	return result
}

/**
 * Convert parsed CC lines to API-ready format
 */
export function toApiFormat(parsed: ParsedCCLine[]): CreditCardTransaction[] {
	return parsed.map((line) => ({
		date: formatDateToISO(line.date),
		title: line.title,
		amount: line.amount,
		installmentCurrent: line.installmentCurrent,
		installmentTotal: line.installmentTotal,
		isPaymentReceived: line.isPaymentReceived,
	}))
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDateToISO(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

/**
 * Get billing cycle from payment received date
 * Payment received in November typically corresponds to October billing cycle
 */
export function getBillingCycleFromPaymentDate(paymentDate: Date): string {
	// Payment received in month N typically corresponds to billing cycle N-1
	const billingMonth = new Date(paymentDate)
	billingMonth.setMonth(billingMonth.getMonth() - 1)

	const year = billingMonth.getFullYear()
	const month = String(billingMonth.getMonth() + 1).padStart(2, '0')
	return `${year}-${month}`
}

/**
 * Validate that the CSV has the expected Nubank CC format
 */
export function validateCreditCardCSV(csvContent: string): { valid: boolean; error?: string } {
	const lines = csvContent.trim().split('\n')

	if (lines.length < 2) {
		return { valid: false, error: 'Arquivo CSV vazio ou com apenas cabecalho' }
	}

	// Check header
	const header = lines[0].toLowerCase()
	if (!header.includes('date') || !header.includes('title') || !header.includes('amount')) {
		return {
			valid: false,
			error: 'Formato invalido. Esperado: date,title,amount (formato Nubank cartao de credito)',
		}
	}

	// Check first data line
	const firstDataLine = lines[1]
	const parts = parseCSVLine(firstDataLine)

	if (parts.length < 3) {
		return { valid: false, error: 'Linha de dados mal formatada' }
	}

	// Validate date format (YYYY-MM-DD)
	const datePattern = /^\d{4}-\d{2}-\d{2}$/
	if (!datePattern.test(parts[0].trim())) {
		return {
			valid: false,
			error: 'Formato de data invalido. Esperado: YYYY-MM-DD',
		}
	}

	// Validate amount is numeric
	const amount = parseFloat(parts[2])
	if (isNaN(amount)) {
		return { valid: false, error: 'Valor do amount nao e numerico' }
	}

	return { valid: true }
}

/**
 * Get summary statistics from parsed CC transactions
 */
export function getCCSummary(transactions: ParsedCCLine[]): {
	totalExpenses: number
	totalPayments: number
	transactionCount: number
	paymentReceivedCount: number
	installmentCount: number
} {
	let totalExpenses = 0
	let totalPayments = 0
	let paymentReceivedCount = 0
	let installmentCount = 0

	for (const tx of transactions) {
		if (tx.isPaymentReceived) {
			paymentReceivedCount++
			totalPayments += Math.abs(tx.amount)
		} else {
			totalExpenses += Math.abs(tx.amount)
		}

		if (tx.installmentCurrent !== undefined) {
			installmentCount++
		}
	}

	return {
		totalExpenses,
		totalPayments,
		transactionCount: transactions.length,
		paymentReceivedCount,
		installmentCount,
	}
}
