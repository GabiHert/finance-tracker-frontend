import type { CategoryRule } from './types'

export const mockRules: CategoryRule[] = [
	{
		id: '1',
		pattern: '.*UBER.*',
		matchType: 'contains',
		categoryId: 'cat-1',
		categoryName: 'Transporte',
		categoryIcon: 'car',
		categoryColor: '#3B82F6',
		priority: 1,
		isActive: true,
		createdAt: '2025-11-01T10:00:00Z',
		updatedAt: '2025-11-01T10:00:00Z',
	},
	{
		id: '2',
		pattern: '^PIX.*',
		matchType: 'starts_with',
		categoryId: 'cat-2',
		categoryName: 'Transferencias',
		categoryIcon: 'arrow-right-left',
		categoryColor: '#10B981',
		priority: 2,
		isActive: true,
		createdAt: '2025-11-02T10:00:00Z',
		updatedAt: '2025-11-02T10:00:00Z',
	},
	{
		id: '3',
		pattern: '^NETFLIX$',
		matchType: 'exact',
		categoryId: 'cat-3',
		categoryName: 'Streaming',
		categoryIcon: 'tv',
		categoryColor: '#EF4444',
		priority: 3,
		isActive: true,
		createdAt: '2025-11-03T10:00:00Z',
		updatedAt: '2025-11-03T10:00:00Z',
	},
]

export const mockCategories = [
	{ value: 'cat-1', label: 'Transporte', icon: 'car', color: '#3B82F6' },
	{ value: 'cat-2', label: 'Transferencias', icon: 'arrow-right-left', color: '#10B981' },
	{ value: 'cat-3', label: 'Streaming', icon: 'tv', color: '#EF4444' },
	{ value: 'cat-4', label: 'Alimentacao', icon: 'utensils', color: '#F59E0B' },
	{ value: 'cat-5', label: 'Delivery', icon: 'package', color: '#8B5CF6' },
]

export const mockMatchingTransactions = [
	{
		id: 'tx-1',
		description: 'UBER TRIP',
		amount: -45.90,
		date: '2025-11-20',
	},
	{
		id: 'tx-2',
		description: 'UBER EATS',
		amount: -32.50,
		date: '2025-11-19',
	},
	{
		id: 'tx-3',
		description: 'UBER TRIP',
		amount: -28.00,
		date: '2025-11-18',
	},
]
