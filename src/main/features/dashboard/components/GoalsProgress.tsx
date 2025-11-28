import { Link } from 'react-router-dom'
import type { GoalProgress } from '../types'
import { formatCurrency } from '../types'

interface GoalsProgressProps {
	goals: GoalProgress[]
}

export function GoalsProgress({ goals }: GoalsProgressProps) {
	return (
		<div
			data-testid="goals-progress"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4"
		>
			<div className="flex items-center justify-between mb-4">
				<h3 data-testid="section-title" className="text-lg font-medium text-[var(--color-text)]">
					Limites de Gastos
				</h3>
				<Link to="/goals" className="text-sm text-[var(--color-primary)] hover:underline">
					Ver todos
				</Link>
			</div>

			{goals.length === 0 ? (
				<div
					data-testid="goals-empty-state"
					className="text-center py-8 text-[var(--color-text-secondary)]"
				>
					Nenhum limite cadastrado
				</div>
			) : (
				<div className="space-y-4">
					{goals.map((goal) => (
						<div
							key={goal.id}
							data-testid="goal-item"
							className={`p-3 rounded-lg border ${
								goal.isOverLimit
									? 'border-red-500 bg-red-500/10 over-limit'
									: 'border-[var(--color-border)]'
							}`}
						>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<span
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: goal.categoryColor }}
									/>
									<span className="text-sm font-medium text-[var(--color-text)]">
										{goal.categoryName}
									</span>
								</div>
								<span
									className={`text-sm font-medium ${
										goal.isOverLimit ? 'text-red-500' : 'text-[var(--color-text-secondary)]'
									}`}
								>
									{goal.percentage}%
								</span>
							</div>

							<div className="w-full h-2 bg-[var(--color-background)] rounded-full overflow-hidden">
								<div
									className={`h-full rounded-full transition-all ${
										goal.isOverLimit ? 'bg-red-500' : 'bg-green-500'
									}`}
									style={{ width: `${Math.min(goal.percentage, 100)}%` }}
								/>
							</div>

							<div className="flex items-center justify-between mt-2 text-xs text-[var(--color-text-secondary)]">
								<span>{formatCurrency(goal.currentAmount)}</span>
								<span>de {formatCurrency(goal.limitAmount)}</span>
							</div>

							{goal.isOverLimit && (
								<p className="text-xs text-red-500 mt-2">
									Limite excedido em {formatCurrency(goal.currentAmount - goal.limitAmount)}
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
