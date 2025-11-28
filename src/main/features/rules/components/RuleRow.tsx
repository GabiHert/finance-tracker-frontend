import { Button } from '@main/components/ui/Button'
import type { CategoryRule } from '../types'

interface RuleRowProps {
	rule: CategoryRule
	onEdit: (rule: CategoryRule) => void
	onDelete: (rule: CategoryRule) => void
	isDragging?: boolean
}

function GripIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-5 h-5"
		>
			<circle cx="9" cy="5" r="1" fill="currentColor" />
			<circle cx="9" cy="12" r="1" fill="currentColor" />
			<circle cx="9" cy="19" r="1" fill="currentColor" />
			<circle cx="15" cy="5" r="1" fill="currentColor" />
			<circle cx="15" cy="12" r="1" fill="currentColor" />
			<circle cx="15" cy="19" r="1" fill="currentColor" />
		</svg>
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

export function RuleRow({ rule, onEdit, onDelete, isDragging }: RuleRowProps) {
	return (
		<div
			data-testid="rule-row"
			className={`
				flex items-center gap-4 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]
				${isDragging ? 'opacity-50' : ''}
			`}
		>
			<div
				data-testid="drag-handle"
				className="cursor-grab text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
			>
				<GripIcon />
			</div>

			<div
				data-testid="rule-priority"
				className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-primary)] text-white text-sm font-medium"
			>
				{rule.priority}
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<span
						className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
						style={{ backgroundColor: rule.categoryColor }}
					>
						{rule.categoryName.charAt(0)}
					</span>
					<span className="font-medium text-[var(--color-text)]">
						{rule.categoryName}
					</span>
				</div>
				<code
					data-testid="rule-pattern"
					className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-background)] px-2 py-1 rounded"
				>
					{rule.pattern}
				</code>
			</div>

			<div className="flex items-center gap-2">
				<Button
					data-testid="edit-rule-btn"
					variant="tertiary"
					size="sm"
					onClick={() => onEdit(rule)}
				>
					<PencilIcon />
				</Button>
				<Button
					data-testid="delete-rule-btn"
					variant="tertiary"
					size="sm"
					onClick={() => onDelete(rule)}
				>
					<TrashIcon />
				</Button>
			</div>
		</div>
	)
}

export default RuleRow
