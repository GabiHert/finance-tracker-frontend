import { Button } from '@main/components/ui/Button'
import type { GroupCategory, MemberRole } from '../types'

interface GroupCategoriesTabProps {
	categories: GroupCategory[]
	currentUserRole: MemberRole
	onAddCategory: () => void
}

export function GroupCategoriesTab({
	categories,
	currentUserRole,
	onAddCategory,
}: GroupCategoriesTabProps) {
	if (categories.length === 0) {
		return (
			<div
				data-testid="group-categories-empty"
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
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
					</svg>
				</div>
				<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
					Nenhuma categoria
				</h3>
				<p className="text-[var(--color-text-secondary)] mb-4">
					Crie categorias para organizar as despesas do grupo
				</p>
				{currentUserRole === 'admin' && (
					<Button data-testid="new-category-btn" onClick={onAddCategory}>
						Criar Categoria
					</Button>
				)}
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{currentUserRole === 'admin' && (
				<div className="flex justify-end">
					<Button
						data-testid="new-category-btn"
						onClick={onAddCategory}
					>
						+ Nova Categoria
					</Button>
				</div>
			)}

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{categories.map((category) => (
					<div
						key={category.id}
						data-testid="group-category-card"
						className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
					>
						<div className="flex items-center gap-3 mb-2">
							<div
								className="w-10 h-10 rounded-full flex items-center justify-center"
								style={{ backgroundColor: category.color }}
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
							<div>
								<h3 className="font-medium text-[var(--color-text)]">
									{category.name}
								</h3>
								<p className="text-sm text-[var(--color-text-secondary)]">
									{category.type === 'expense' ? 'Despesa' : 'Receita'}
								</p>
							</div>
						</div>
						<p className="text-sm text-[var(--color-text-secondary)]">
							{category.transactionCount} transacoes
						</p>
					</div>
				))}
			</div>
		</div>
	)
}

export default GroupCategoriesTab
