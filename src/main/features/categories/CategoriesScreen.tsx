import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@main/components/ui/Button'
import { Input } from '@main/components/ui/Input'
import { Select } from '@main/components/ui/Select'
import { CategoryCard } from './components/CategoryCard'
import { CategoryModal } from './CategoryModal'
import { mockCategories } from './mock-data'
import type { Category } from './types'

const typeFilterOptions = [
	{ value: 'all', label: 'All Types' },
	{ value: 'expense', label: 'Expense' },
	{ value: 'income', label: 'Income' },
]

export function CategoriesScreen() {
	const [searchParams] = useSearchParams()
	const isEmpty = searchParams.get('empty') === 'true'

	const [categories] = useState<Category[]>(isEmpty ? [] : mockCategories)
	const [searchQuery, setSearchQuery] = useState('')
	const [typeFilter, setTypeFilter] = useState<string>('all')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

	const filteredCategories = useMemo(() => {
		return categories.filter(category => {
			const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
			const matchesType = typeFilter === 'all' || category.type === typeFilter
			return matchesSearch && matchesType
		})
	}, [categories, searchQuery, typeFilter])

	const handleAddCategory = () => {
		setSelectedCategory(null)
		setIsModalOpen(true)
	}

	const handleEditCategory = (category: Category) => {
		setSelectedCategory(category)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedCategory(null)
	}

	const handleSaveCategory = (data: Partial<Category>) => {
		console.log('Save category:', data)
		handleCloseModal()
	}

	return (
		<div data-testid="categories-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-[var(--color-text)]">
						Categories
					</h1>
					<Button
						data-testid="add-category-btn"
						onClick={handleAddCategory}
					>
						+ Add Category
					</Button>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					<div className="flex-1">
						<Input
							data-testid="category-search"
							placeholder="Search categories..."
							value={searchQuery}
							onChange={setSearchQuery}
						/>
					</div>
					<div className="w-full sm:w-48">
						<div data-testid="category-type-filter">
							<Select
								options={typeFilterOptions}
								value={typeFilter}
								onChange={(val) => setTypeFilter(val as string)}
								placeholder="Filter by type"
							/>
						</div>
					</div>
				</div>

				{filteredCategories.length === 0 ? (
					<div
						data-testid="empty-state"
						className="text-center py-12"
					>
						<div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-surface)] rounded-full flex items-center justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="w-8 h-8 text-[var(--color-text-secondary)]"
							>
								<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
							</svg>
						</div>
						<h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
							No categories found
						</h3>
						<p className="text-[var(--color-text-secondary)] mb-4">
							{searchQuery || typeFilter !== 'all'
								? 'Try adjusting your search or filters'
								: 'Get started by creating your first category'
							}
						</p>
						{!searchQuery && typeFilter === 'all' && (
							<Button onClick={handleAddCategory}>
								Create Category
							</Button>
						)}
					</div>
				) : (
					<div
						data-testid="categories-grid"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
					>
						{filteredCategories.map(category => (
							<CategoryCard
								key={category.id}
								category={category}
								onClick={() => handleEditCategory(category)}
							/>
						))}
					</div>
				)}
			</div>

			<CategoryModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSave={handleSaveCategory}
				category={selectedCategory}
			/>
		</div>
	)
}

export default CategoriesScreen
