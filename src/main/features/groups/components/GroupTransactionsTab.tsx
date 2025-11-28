import type { GroupTransaction } from '../types'

interface GroupTransactionsTabProps {
	transactions: GroupTransaction[]
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(Math.abs(value))
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr)
	return date.toLocaleDateString('pt-BR')
}

export function GroupTransactionsTab({ transactions }: GroupTransactionsTabProps) {
	if (transactions.length === 0) {
		return (
			<div
				data-testid="group-transactions-empty"
				className="text-center py-12"
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
						<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
					</svg>
				</div>
				<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
					Nenhuma transacao
				</h3>
				<p className="text-[var(--color-text-secondary)]">
					Este grupo ainda nao possui transacoes
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-3">
			{transactions.map((transaction) => (
				<div
					key={transaction.id}
					data-testid="group-transaction-item"
					className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] flex items-center justify-between"
				>
					<div className="flex items-center gap-3">
						{transaction.categoryColor && (
							<div
								className="w-10 h-10 rounded-full flex items-center justify-center"
								style={{ backgroundColor: transaction.categoryColor }}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="white"
									strokeWidth="2"
									className="w-5 h-5"
								>
									<circle cx="12" cy="12" r="10" />
								</svg>
							</div>
						)}
						<div>
							<p className="font-medium text-[var(--color-text)]">
								{transaction.description}
							</p>
							<p className="text-sm text-[var(--color-text-secondary)]">
								{transaction.memberName} - {formatDate(transaction.date)}
							</p>
						</div>
					</div>
					<span className={`font-medium ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
						{transaction.amount < 0 ? '-' : '+'}{formatCurrency(transaction.amount)}
					</span>
				</div>
			))}
		</div>
	)
}

export default GroupTransactionsTab
