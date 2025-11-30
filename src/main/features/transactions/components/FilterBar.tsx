import { Input } from '@main/components/ui/Input'
import { Select, type SelectOption } from '@main/components/ui/Select'
import { DatePicker } from '@main/components/ui/DatePicker'
import { Button } from '@main/components/ui/Button'
import type { TransactionFilters } from '../types'

export interface FilterBarProps {
	filters: TransactionFilters
	onFiltersChange: (filters: TransactionFilters) => void
	categoryOptions: SelectOption[]
}

export function FilterBar({ filters, onFiltersChange, categoryOptions }: FilterBarProps) {
	const typeOptions: SelectOption[] = [
		{ value: 'all', label: 'All' },
		{ value: 'expense', label: 'Expense' },
		{ value: 'income', label: 'Income' },
	]

	const activeFilterCount = [
		filters.search,
		filters.startDate,
		filters.endDate,
		filters.categoryId,
		filters.type !== 'all',
	].filter(Boolean).length

	const handleClearFilters = () => {
		onFiltersChange({
			search: '',
			startDate: '',
			endDate: '',
			categoryId: '',
			type: 'all',
		})
	}

	return (
		<div
			data-testid="filter-bar"
			className="flex flex-col sm:flex-row gap-4 p-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
		>
			{/* Search */}
			<div className="flex-1">
				<Input
					data-testid="filter-search"
					placeholder="Search transactions..."
					value={filters.search}
					onChange={value => onFiltersChange({ ...filters, search: value })}
				/>
			</div>

			{/* Date Range */}
			<div data-testid="filter-date-range" className="flex gap-2">
				<div data-testid="filter-start-date" className="w-40">
					<DatePicker
						value={filters.startDate}
						onChange={value => onFiltersChange({ ...filters, startDate: value })}
						placeholder="Start date"
						data-testid="filter-start-date"
					/>
				</div>
				<div data-testid="filter-end-date" className="w-40">
					<DatePicker
						value={filters.endDate}
						onChange={value => onFiltersChange({ ...filters, endDate: value })}
						placeholder="End date"
						data-testid="filter-end-date"
					/>
				</div>
			</div>

			{/* Category Filter */}
			<div className="w-48" data-testid="filter-category">
				<Select
					options={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
					value={filters.categoryId}
					onChange={value => onFiltersChange({ ...filters, categoryId: value as string })}
					placeholder="Category"
					data-testid="filter-category"
				/>
			</div>

			{/* Type Filter */}
			<div className="w-40" data-testid="filter-type">
				<Select
					options={typeOptions}
					value={filters.type}
					onChange={value => onFiltersChange({ ...filters, type: value as any })}
					data-testid="filter-type"
				/>
			</div>

			{/* Clear Filters */}
			{activeFilterCount > 0 && (
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={handleClearFilters}
						data-testid="filter-clear-btn"
					>
						Clear
					</Button>
					<span
						data-testid="filter-count"
						className="px-2 py-1 text-xs font-medium bg-[var(--color-primary-50)] text-[var(--color-primary)] rounded-full"
					>
						{activeFilterCount}
					</span>
				</div>
			)}
		</div>
	)
}

export default FilterBar
