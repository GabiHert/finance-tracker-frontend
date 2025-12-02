import { Button } from '@main/components/ui/Button'
import { ProgressBar } from './ProgressBar'
import type { Goal } from '../types'
import { calculateProgress, isOverLimit, formatCurrency } from '../types'

interface GoalCardProps {
	goal: Goal
	onEdit: (goal: Goal) => void
	onDelete: (goal: Goal) => void
}

function CategoryIcon({ color }: { color: string }) {
	return (
		<div
			data-testid="goal-category-icon"
			className="w-10 h-10 rounded-full flex items-center justify-center"
			style={{ backgroundColor: color }}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="white"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="w-5 h-5"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M12 16v-4" />
				<path d="M12 8h.01" />
			</svg>
		</div>
	)
}

function PencilIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-4 h-4"
		>
			<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
			<path d="m15 5 4 4" />
		</svg>
	)
}

function TrashIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-4 h-4 text-red-500"
		>
			<path d="M3 6h18" />
			<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
			<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
			<line x1="10" y1="11" x2="10" y2="17" />
			<line x1="14" y1="11" x2="14" y2="17" />
		</svg>
	)
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
	const progress = calculateProgress(goal.currentAmount, goal.limitAmount)
	const overLimit = isOverLimit(goal.currentAmount, goal.limitAmount)
	const isWarning = progress >= 80 && progress < 100

	return (
		<div
			data-testid="goal-card"
			className={`
				p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
				${overLimit ? 'over-limit animate-pulse ring-2 ring-red-500 ring-opacity-50' : ''}
				${isWarning ? 'warning ring-2 ring-yellow-500 ring-opacity-50' : ''}
			`}
		>
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<CategoryIcon color={goal.categoryColor} />
					<div>
						<h3
							data-testid="goal-category-name"
							className="font-medium text-[var(--color-text)]"
						>
							{goal.categoryName}
						</h3>
						<p className="text-sm text-[var(--color-text-secondary)]">
							Limite mensal
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						data-testid="edit-goal-btn"
						variant="tertiary"
						size="sm"
						onClick={() => onEdit(goal)}
					>
						<PencilIcon />
					</Button>
					<Button
						data-testid="delete-goal-btn"
						variant="tertiary"
						size="sm"
						onClick={() => onDelete(goal)}
					>
						<TrashIcon />
					</Button>
				</div>
			</div>

			<div className="mb-3">
				<div className="flex items-center justify-between mb-2">
					<span data-testid="goal-current" className="text-sm text-[var(--color-text)]">
						{formatCurrency(goal.currentAmount)}
					</span>
					<span data-testid="goal-limit" className="text-sm text-[var(--color-text-secondary)]">
						{formatCurrency(goal.limitAmount)}
					</span>
				</div>
				<ProgressBar progress={progress} isOverLimit={overLimit} />
			</div>

			<div className="flex items-center justify-between">
				<span
					data-testid="goal-progress-percent"
					className={`text-sm font-medium ${overLimit ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'}`}
				>
					{progress}%
				</span>
				{isWarning && (
					<span data-testid="warning-indicator" className="text-xs text-yellow-500 font-medium">
						Aproximando do limite!
					</span>
				)}
				{overLimit && (
					<span data-testid="over-limit-indicator" className="text-xs text-red-500 font-medium">
						Limite excedido!
					</span>
				)}
			</div>
		</div>
	)
}

export default GoalCard
