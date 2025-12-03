import { Card } from '@main/components/ui/Card'
import { getIconComponent } from '@main/components/ui/IconPicker'
import type { Category } from '../types'

interface CategoryCardProps {
	category: Category
	onClick?: () => void
	onDelete?: (category: Category) => void
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
			className="w-4 h-4"
		>
			<polyline points="3,6 5,6 21,6" />
			<path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2,-2V6m3,0V4a2,2 0 0,1,2,-2h4a2,2 0 0,1,2,2v2" />
			<line x1="10" y1="11" x2="10" y2="17" />
			<line x1="14" y1="11" x2="14" y2="17" />
		</svg>
	)
}

export function CategoryCard({ category, onClick, onDelete }: CategoryCardProps) {
	const IconComponent = getIconComponent(category.icon || 'folder')

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation()
		onDelete?.(category)
	}

	return (
		<Card
			variant="clickable"
			onClick={onClick}
			data-testid="category-card"
			padding="md"
			className="transition-all hover:shadow-lg group relative"
		>
			<div className="flex items-center gap-3">
				<div
					data-testid="category-color"
					className="w-12 h-12 rounded-lg flex items-center justify-center"
					style={{ backgroundColor: category.color + '20', color: category.color }}
				>
					<span data-testid="category-icon">
						<IconComponent className="w-6 h-6" />
					</span>
				</div>
				<div className="flex-1 min-w-0">
					<h3
						data-testid="category-name"
						className="font-medium text-[var(--color-text)] truncate"
					>
						{category.name}
					</h3>
					{category.description && (
						<p className="text-sm text-[var(--color-text-secondary)] truncate">
							{category.description}
						</p>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span
						className={`
							text-xs px-2 py-1 rounded-full
							${category.type === 'expense'
								? 'bg-red-100 text-red-700'
								: 'bg-green-100 text-green-700'
							}
						`}
					>
						{category.type}
					</span>
					{onDelete && (
						<button
							data-testid="delete-category-btn"
							onClick={handleDelete}
							className="
								opacity-0 group-hover:opacity-100
								p-2 rounded-full
								text-[var(--color-text-secondary)]
								hover:text-[var(--color-error)] hover:bg-red-50
								transition-all duration-200
								focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500
							"
							aria-label={`Excluir categoria ${category.name}`}
						>
							<TrashIcon />
						</button>
					)}
				</div>
			</div>
		</Card>
	)
}

export default CategoryCard
