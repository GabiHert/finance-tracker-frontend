import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@main/components/ui/Button'
import { Input } from '@main/components/ui/Input'
import { Select } from '@main/components/ui/Select'
import { Modal } from '@main/components/ui/Modal'
import { useToast } from '@main/components/layout/Toast'
import { CategoryCard } from './components/CategoryCard'
import { CategoryModal } from './CategoryModal'
import {
	fetchCategories,
	createCategory,
	updateCategory,
	deleteCategory as deleteCategoryApi,
} from './api/categories'
import type { Category, CreateCategoryInput } from './types'

const typeFilterOptions = [
	{ value: 'all', label: 'All Types' },
	{ value: 'expense', label: 'Expense' },
	{ value: 'income', label: 'Income' },
]

export function CategoriesScreen() {
	const [searchParams] = useSearchParams()
	const isEmpty = searchParams.get('empty') === 'true'
	const { showToast } = useToast()

	const [categories, setCategories] = useState<Category[]>([])
	const [isLoading, setIsLoading] = useState(!isEmpty)
	const [error, setError] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [typeFilter, setTypeFilter] = useState<string>('all')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
	const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const loadCategories = useCallback(async () => {
		if (isEmpty) return

		setIsLoading(true)
		setError(null)
		try {
			const data = await fetchCategories()
			setCategories(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar categorias')
			console.error('Error loading categories:', err)
		} finally {
			setIsLoading(false)
		}
	}, [isEmpty])

	useEffect(() => {
		loadCategories()
	}, [loadCategories])

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

	const handleSaveCategory = async (data: Partial<Category>) => {
		setIsSaving(true)
		try {
			if (selectedCategory) {
				// Update existing category
				await updateCategory(selectedCategory.id, {
					name: data.name,
					icon: data.icon,
					color: data.color,
				})
				showToast('success', 'Categoria atualizada')
			} else {
				// Create new category
				const input: CreateCategoryInput = {
					name: data.name || '',
					icon: data.icon || 'folder',
					color: data.color || '#6B7280',
					type: data.type || 'expense',
					description: data.description,
				}
				await createCategory(input)
				showToast('success', 'Categoria criada')
			}
			handleCloseModal()
			await loadCategories()
		} catch (err) {
			showToast('error', err instanceof Error ? err.message : 'Erro ao salvar categoria')
		} finally {
			setIsSaving(false)
		}
	}

	const handleDeleteClick = (category: Category) => {
		setCategoryToDelete(category)
		setIsDeleteModalOpen(true)
	}

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false)
		setCategoryToDelete(null)
	}

	const handleConfirmDelete = async () => {
		if (!categoryToDelete) return

		setIsSaving(true)
		try {
			await deleteCategoryApi(categoryToDelete.id)
			showToast('success', 'Categoria excluida')
			handleCancelDelete()
			await loadCategories()
		} catch (err) {
			showToast('error', err instanceof Error ? err.message : 'Erro ao excluir categoria')
		} finally {
			setIsSaving(false)
		}
	}

	if (isLoading) {
		return (
			<div data-testid="categories-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-2xl font-bold text-[var(--color-text)]">
							Categories
						</h1>
					</div>
					<div data-testid="loading-state" className="text-center py-12">
						<div className="w-8 h-8 mx-auto mb-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
						<p className="text-[var(--color-text-secondary)]">Carregando categorias...</p>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div data-testid="categories-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-2xl font-bold text-[var(--color-text)]">
							Categories
						</h1>
					</div>
					<div data-testid="error-state" className="text-center py-12">
						<p className="text-[var(--color-error)] mb-4">{error}</p>
						<Button onClick={loadCategories}>Tentar novamente</Button>
					</div>
				</div>
			</div>
		)
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
								onDelete={handleDeleteClick}
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
				isSaving={isSaving}
			/>

			<Modal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				title="Excluir categoria"
				size="sm"
				data-testid="delete-category-modal"
				footer={
					<>
						<Button
							variant="secondary"
							onClick={handleCancelDelete}
							data-testid="cancel-delete-btn"
							disabled={isSaving}
						>
							Cancelar
						</Button>
						<Button
							variant="danger"
							onClick={handleConfirmDelete}
							data-testid="confirm-delete-btn"
							disabled={isSaving}
						>
							{isSaving ? 'Excluindo...' : 'Excluir'}
						</Button>
					</>
				}
			>
				<p className="text-[var(--color-text)]" data-testid="delete-confirmation-text">
					Deseja excluir esta categoria?
				</p>
				{categoryToDelete && (
					<>
						<p className="text-sm text-[var(--color-text-secondary)] mt-2">
							A categoria <strong>{categoryToDelete.name}</strong> sera removida permanentemente.
						</p>
						{categoryToDelete.transactionCount && categoryToDelete.transactionCount > 0 && (
							<p
								className="text-sm text-[var(--color-warning)] mt-2 p-2 bg-amber-50 rounded"
								data-testid="transaction-warning"
							>
								{categoryToDelete.transactionCount} transacoes ficarao sem categoria
							</p>
						)}
					</>
				)}
			</Modal>
		</div>
	)
}

export default CategoriesScreen
