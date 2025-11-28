import type {
	Group,
	GroupMember,
	GroupCategory,
	GroupTransaction,
	GroupSummary,
} from './types'

export const mockCurrentUser: GroupMember = {
	id: '1',
	userId: 'user-1',
	name: 'Usuario Teste',
	email: 'usuario@example.com',
	role: 'admin',
	joinedAt: '2025-01-01T00:00:00Z',
}

export const mockMembers: GroupMember[] = [
	mockCurrentUser,
	{
		id: '2',
		userId: 'user-2',
		name: 'Maria Silva',
		email: 'maria@example.com',
		role: 'member',
		joinedAt: '2025-01-15T00:00:00Z',
	},
	{
		id: '3',
		userId: 'user-3',
		name: 'Joao Santos',
		email: 'joao@example.com',
		role: 'member',
		joinedAt: '2025-02-01T00:00:00Z',
	},
]

export const mockGroups: Group[] = [
	{
		id: 'group-1',
		name: 'Familia Silva',
		description: 'Despesas da familia',
		createdAt: '2025-01-01T00:00:00Z',
		updatedAt: '2025-11-20T00:00:00Z',
		memberCount: 3,
		members: mockMembers,
		currentUserRole: 'admin',
		pendingInvites: [
			{
				id: 'invite-1',
				email: 'pendente@example.com',
				status: 'pending',
				expiresAt: '2025-12-01T00:00:00Z',
				createdAt: '2025-11-24T00:00:00Z',
			},
		],
	},
]

export const mockGroupCategories: GroupCategory[] = [
	{
		id: 'cat-1',
		name: 'Mercado',
		type: 'expense',
		icon: 'shopping-cart',
		color: '#F59E0B',
		transactionCount: 15,
	},
	{
		id: 'cat-2',
		name: 'Contas',
		type: 'expense',
		icon: 'file-text',
		color: '#EF4444',
		transactionCount: 8,
	},
	{
		id: 'cat-3',
		name: 'Lazer',
		type: 'expense',
		icon: 'smile',
		color: '#8B5CF6',
		transactionCount: 5,
	},
]

export const mockGroupTransactions: GroupTransaction[] = [
	{
		id: 'tx-1',
		description: 'Supermercado Extra',
		amount: -350.0,
		date: '2025-11-20',
		categoryId: 'cat-1',
		categoryName: 'Mercado',
		categoryIcon: 'shopping-cart',
		categoryColor: '#F59E0B',
		memberName: 'Usuario Teste',
	},
	{
		id: 'tx-2',
		description: 'Conta de Luz',
		amount: -180.5,
		date: '2025-11-19',
		categoryId: 'cat-2',
		categoryName: 'Contas',
		categoryIcon: 'file-text',
		categoryColor: '#EF4444',
		memberName: 'Maria Silva',
	},
	{
		id: 'tx-3',
		description: 'Cinema',
		amount: -85.0,
		date: '2025-11-18',
		categoryId: 'cat-3',
		categoryName: 'Lazer',
		categoryIcon: 'smile',
		categoryColor: '#8B5CF6',
		memberName: 'Joao Santos',
	},
]

export const mockGroupSummary: GroupSummary = {
	totalExpenses: 2500.0,
	totalIncome: 0,
	netBalance: -2500.0,
	expensesByMember: [
		{ memberId: 'user-1', memberName: 'Usuario Teste', total: 1200.0 },
		{ memberId: 'user-2', memberName: 'Maria Silva', total: 800.0 },
		{ memberId: 'user-3', memberName: 'Joao Santos', total: 500.0 },
	],
	expensesByCategory: [
		{ categoryId: 'cat-1', categoryName: 'Mercado', categoryColor: '#F59E0B', total: 1500.0 },
		{ categoryId: 'cat-2', categoryName: 'Contas', categoryColor: '#EF4444', total: 600.0 },
		{ categoryId: 'cat-3', categoryName: 'Lazer', categoryColor: '#8B5CF6', total: 400.0 },
	],
}
