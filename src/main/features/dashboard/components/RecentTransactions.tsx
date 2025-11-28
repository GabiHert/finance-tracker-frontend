import { Link } from 'react-router-dom'
import type { RecentTransaction } from '../types'
import { formatCurrency, formatDate } from '../types'

interface RecentTransactionsProps {
	transactions: RecentTransaction[]
}

function TransactionIcon({ color }: { color: string }) {
	return (
		<div
			className="w-10 h-10 rounded-full flex items-center justify-center"
			style={{ backgroundColor: `${color}20` }}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className="w-5 h-5">
				<circle cx="12" cy="12" r="10" />
				<path d="M12 8v8" />
				<path d="M8 12h8" />
			</svg>
		</div>
	)
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
	return (
		<div
			data-testid="recent-transactions"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
		>
			<div className="flex items-center justify-between mb-4">
				<h3 data-testid="section-title" className="text-lg font-medium text-[var(--color-text)]">
					Transacoes Recentes
				</h3>
				<Link
					to="/transactions"
					className="text-sm text-[var(--color-primary)] hover:underline"
				>
					Ver todas
				</Link>
			</div>

			{transactions.length === 0 ? (
				<div
					data-testid="transactions-empty-state"
					className="text-center py-8 text-[var(--color-text-secondary)]"
				>
					Nenhuma transacao recente
				</div>
			) : (
				<div className="space-y-3">
					{transactions.slice(0, 8).map((tx) => (
						<div
							key={tx.id}
							data-testid="transaction-item"
							className="flex items-center justify-between py-2"
						>
							<div className="flex items-center gap-3">
								<TransactionIcon color={tx.categoryColor} />
								<div>
									<p className="text-sm font-medium text-[var(--color-text)]">{tx.description}</p>
									<p className="text-xs text-[var(--color-text-secondary)]">
										{tx.categoryName} - {formatDate(tx.date)}
									</p>
								</div>
							</div>
							<span
								className={`text-sm font-medium ${
									tx.amount >= 0 ? 'text-green-500' : 'text-red-500'
								}`}
							>
								{tx.amount >= 0 ? '+' : '-'}
								{formatCurrency(tx.amount)}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
