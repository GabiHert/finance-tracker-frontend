import { Card } from '@main/components/ui/Card'
import { CATEGORY_ICONS } from '@main/components/ui/IconPicker'
import type { Category } from '../types'

interface CategoryCardProps {
	category: Category
	onClick?: () => void
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
	const iconDef = CATEGORY_ICONS.find(i => i.name === category.icon)
	const IconPath = iconDef?.path || ''

	return (
		<Card
			variant="clickable"
			onClick={onClick}
			data-testid="category-card"
			padding="md"
			className="transition-all hover:shadow-lg"
		>
			<div className="flex items-center gap-3">
				<div
					data-testid="category-color"
					className="w-12 h-12 rounded-lg flex items-center justify-center"
					style={{ backgroundColor: category.color + '20' }}
				>
					<svg
						data-testid="category-icon"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke={category.color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="w-6 h-6"
					>
						<path d={IconPath} />
					</svg>
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
				<div className="flex items-center">
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
				</div>
			</div>
		</Card>
	)
}

export default CategoryCard
