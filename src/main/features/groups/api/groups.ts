import type {
	Group,
	GroupSummary,
	GroupTransaction,
	GroupCategory,
	GroupMember,
	GroupDashboardData,
	GroupDashboardSummary,
	GroupCategoryBreakdown,
	GroupMemberBreakdown,
	GroupTrendPoint,
	GroupDashboardTransaction,
} from '../types'
import type { Period } from '@main/features/dashboard/types'
import { API_BASE, authenticatedFetch } from '@main/lib'

// API Response types (snake_case from backend)
// Note: GroupResponse from backend for create/update operations
interface GroupApiResponse {
	id: string
	name: string
	created_by: string
	created_at: string
	members?: GroupMemberApiResponse[]
}

// Note: GroupDetailResponse from backend for single group fetch
interface GroupDetailApiResponse {
	id: string
	name: string
	created_by: string
	created_at: string
	members: GroupMemberApiResponse[]
	pending_invites?: GroupInviteApiResponse[]
}

interface GroupMemberApiResponse {
	id: string
	user_id: string
	name: string
	email: string
	role: 'admin' | 'member'
	avatar_url?: string
	joined_at: string
}

interface GroupInviteApiResponse {
	id: string
	email: string
	status: 'pending' | 'accepted' | 'declined' | 'expired'
	expires_at: string
	created_at: string
}

interface GroupCategoryApiResponse {
	id: string
	name: string
	type: 'income' | 'expense'
	icon: string
	color: string
	transaction_count: number
}

interface GroupTransactionApiResponse {
	id: string
	description: string
	amount: string
	date: string
	category_id?: string
	category_name?: string
	category_icon?: string
	category_color?: string
	member_name: string
	member_avatar_url?: string
}

interface GroupSummaryApiResponse {
	total_expenses: string
	total_income: string
	net_balance: string
	expenses_by_member: {
		member_id: string
		member_name: string
		total: string
	}[]
	expenses_by_category: {
		category_id: string
		category_name: string
		category_color: string
		total: string
	}[]
}

// List response wrapper from backend
interface GroupListApiResponse {
	groups: GroupListItemApiResponse[]
}

// Group list item from backend (different from full GroupApiResponse)
interface GroupListItemApiResponse {
	id: string
	name: string
	member_count: number
	role: 'admin' | 'member'
	created_at: string
}

// Transform API response to frontend types
function transformGroup(apiGroup: GroupApiResponse): Group {
	const members = apiGroup.members?.map(transformMember) || []
	const currentMember = members[0]

	return {
		id: apiGroup.id,
		name: apiGroup.name,
		createdAt: apiGroup.created_at,
		updatedAt: apiGroup.created_at,
		memberCount: members.length,
		members,
		currentUserRole: currentMember?.role || 'admin',
	}
}

function transformGroupDetail(apiGroup: GroupDetailApiResponse, currentUserId?: string): Group {
	const members = apiGroup.members.map(transformMember)
	const currentMember = currentUserId
		? members.find(m => m.userId === currentUserId)
		: members[0]

	return {
		id: apiGroup.id,
		name: apiGroup.name,
		createdAt: apiGroup.created_at,
		updatedAt: apiGroup.created_at,
		memberCount: members.length,
		members,
		pendingInvites: apiGroup.pending_invites?.map(invite => ({
			id: invite.id,
			email: invite.email,
			status: invite.status,
			expiresAt: invite.expires_at,
			createdAt: invite.created_at,
		})),
		currentUserRole: currentMember?.role || 'member',
	}
}

function transformMember(apiMember: GroupMemberApiResponse): GroupMember {
	return {
		id: apiMember.id,
		userId: apiMember.user_id,
		name: apiMember.name,
		email: apiMember.email,
		role: apiMember.role,
		avatarUrl: apiMember.avatar_url,
		joinedAt: apiMember.joined_at,
	}
}

function transformCategory(apiCategory: GroupCategoryApiResponse): GroupCategory {
	return {
		id: apiCategory.id,
		name: apiCategory.name,
		type: apiCategory.type,
		icon: apiCategory.icon,
		color: apiCategory.color,
		transactionCount: apiCategory.transaction_count,
	}
}

function transformTransaction(apiTx: GroupTransactionApiResponse): GroupTransaction {
	return {
		id: apiTx.id,
		description: apiTx.description,
		amount: parseFloat(apiTx.amount),
		date: apiTx.date,
		categoryId: apiTx.category_id,
		categoryName: apiTx.category_name,
		categoryIcon: apiTx.category_icon,
		categoryColor: apiTx.category_color,
		memberName: apiTx.member_name,
		memberAvatarUrl: apiTx.member_avatar_url,
	}
}

function transformSummary(apiSummary: GroupSummaryApiResponse): GroupSummary {
	return {
		totalExpenses: parseFloat(apiSummary.total_expenses),
		totalIncome: parseFloat(apiSummary.total_income),
		netBalance: parseFloat(apiSummary.net_balance),
		expensesByMember: apiSummary.expenses_by_member.map(item => ({
			memberId: item.member_id,
			memberName: item.member_name,
			total: parseFloat(item.total),
		})),
		expensesByCategory: apiSummary.expenses_by_category.map(item => ({
			categoryId: item.category_id,
			categoryName: item.category_name,
			categoryColor: item.category_color,
			total: parseFloat(item.total),
		})),
	}
}

function transformGroupListItem(apiGroup: GroupListItemApiResponse): Group {
	return {
		id: apiGroup.id,
		name: apiGroup.name,
		createdAt: apiGroup.created_at,
		updatedAt: apiGroup.created_at,
		memberCount: apiGroup.member_count,
		members: [],
		currentUserRole: apiGroup.role,
	}
}

// Group CRUD operations
export async function fetchGroups(): Promise<Group[]> {
	const response = await authenticatedFetch(`${API_BASE}/groups`, { method: 'GET' })

	if (!response.ok) {
		if (response.status === 404) {
			// API not implemented yet - return empty array
			return []
		}
		throw new Error('Erro ao carregar grupos')
	}

	const data: GroupListApiResponse = await response.json()
	return data.groups.map(transformGroupListItem)
}

export async function fetchGroupById(id: string): Promise<Group> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${id}`, { method: 'GET' })

	if (!response.ok) {
		throw new Error('Erro ao carregar grupo')
	}

	const data: GroupDetailApiResponse = await response.json()
	return transformGroupDetail(data)
}

export interface CreateGroupInput {
	name: string
	description?: string
}

export async function createGroup(input: CreateGroupInput): Promise<Group> {
	const response = await authenticatedFetch(`${API_BASE}/groups`, {
		method: 'POST',
		body: JSON.stringify(input),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao criar grupo' }))
		throw new Error(error.error || 'Erro ao criar grupo')
	}

	const data: GroupApiResponse = await response.json()
	return transformGroup(data)
}

export interface UpdateGroupInput {
	name?: string
	description?: string
}

export async function updateGroup(id: string, input: UpdateGroupInput): Promise<Group> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(input),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao atualizar grupo' }))
		throw new Error(error.error || 'Erro ao atualizar grupo')
	}

	const data: GroupApiResponse = await response.json()
	return transformGroup(data)
}

export async function deleteGroup(id: string): Promise<void> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${id}`, {
		method: 'DELETE',
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao excluir grupo' }))
		throw new Error(error.error || 'Erro ao excluir grupo')
	}
}

// Group summary
export async function fetchGroupSummary(groupId: string): Promise<GroupSummary> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${groupId}/summary`, { method: 'GET' })

	if (!response.ok) {
		if (response.status === 404) {
			return {
				totalExpenses: 0,
				totalIncome: 0,
				netBalance: 0,
				expensesByMember: [],
				expensesByCategory: [],
			}
		}
		throw new Error('Erro ao carregar resumo do grupo')
	}

	const data: GroupSummaryApiResponse = await response.json()
	return transformSummary(data)
}

// Group transactions
export async function fetchGroupTransactions(groupId: string): Promise<GroupTransaction[]> {
	try {
		const response = await authenticatedFetch(`${API_BASE}/groups/${groupId}/transactions`, { method: 'GET' })

		if (!response.ok) {
			if (response.status === 404) {
				return []
			}
			throw new Error('Erro ao carregar transacoes do grupo')
		}

		const data: GroupTransactionApiResponse[] = await response.json()
		return data.map(transformTransaction)
	} catch {
		// Handle CORS errors or network failures for unimplemented endpoints
		return []
	}
}

// Group categories
export async function fetchGroupCategories(groupId: string): Promise<GroupCategory[]> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${groupId}/categories`, { method: 'GET' })

	if (!response.ok) {
		if (response.status === 404) {
			return []
		}
		throw new Error('Erro ao carregar categorias do grupo')
	}

	const data: GroupCategoryApiResponse[] = await response.json()
	return data.map(transformCategory)
}

export interface CreateGroupCategoryInput {
	name: string
	type: 'income' | 'expense'
	color: string
}

export async function createGroupCategory(
	groupId: string,
	input: CreateGroupCategoryInput
): Promise<GroupCategory> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${groupId}/categories`, {
		method: 'POST',
		body: JSON.stringify(input),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao criar categoria' }))
		throw new Error(error.error || 'Erro ao criar categoria')
	}

	const data: GroupCategoryApiResponse = await response.json()
	return transformCategory(data)
}

// Group members
export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${groupId}/members`, { method: 'GET' })

	if (!response.ok) {
		throw new Error('Erro ao carregar membros do grupo')
	}

	const data: GroupMemberApiResponse[] = await response.json()
	return data.map(transformMember)
}

export async function inviteMember(groupId: string, email: string): Promise<void> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${groupId}/invite`, {
		method: 'POST',
		body: JSON.stringify({ email }),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao enviar convite' }))
		throw new Error(error.error || 'Erro ao enviar convite')
	}
}

export async function leaveGroup(groupId: string): Promise<void> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${groupId}/leave`, {
		method: 'POST',
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao sair do grupo' }))
		throw new Error(error.error || 'Erro ao sair do grupo')
	}
}

export async function removeMember(groupId: string, memberId: string): Promise<void> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${groupId}/members/${memberId}`, {
		method: 'DELETE',
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao remover membro' }))
		throw new Error(error.error || 'Erro ao remover membro')
	}
}

export async function updateMemberRole(
	groupId: string,
	memberId: string,
	role: 'admin' | 'member'
): Promise<void> {
	const response = await authenticatedFetch(`${API_BASE}/groups/${groupId}/members/${memberId}`, {
		method: 'PATCH',
		body: JSON.stringify({ role }),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Erro ao atualizar funcao' }))
		throw new Error(error.error || 'Erro ao atualizar funcao')
	}
}

// Dashboard API response types
interface GroupDashboardApiResponse {
	summary: {
		total_expenses: string
		total_income: string
		net_balance: string
		member_count: number
		expenses_change?: number
		income_change?: number
	}
	category_breakdown: Array<{
		category_id: string
		category_name: string
		category_color: string
		amount: string
		percentage: number
	}>
	member_breakdown: Array<{
		member_id: string
		member_name: string
		avatar_url?: string
		total: string
		percentage: number
		transaction_count: number
	}>
	trends: Array<{
		date: string
		income: string
		expenses: string
	}>
	recent_transactions: Array<{
		id: string
		description: string
		amount: string
		date: string
		category_name: string
		category_color: string
		category_icon: string
		member_name: string
		member_avatar_url?: string
	}>
}

function transformDashboardData(api: GroupDashboardApiResponse): GroupDashboardData {
	return {
		summary: {
			totalExpenses: parseFloat(api.summary.total_expenses),
			totalIncome: parseFloat(api.summary.total_income),
			netBalance: parseFloat(api.summary.net_balance),
			memberCount: api.summary.member_count,
			expensesChange: api.summary.expenses_change,
			incomeChange: api.summary.income_change,
		},
		categoryBreakdown: api.category_breakdown.map((cat) => ({
			categoryId: cat.category_id,
			categoryName: cat.category_name,
			categoryColor: cat.category_color,
			amount: parseFloat(cat.amount),
			percentage: cat.percentage,
		})),
		memberBreakdown: api.member_breakdown.map((member) => ({
			memberId: member.member_id,
			memberName: member.member_name,
			avatarUrl: member.avatar_url,
			total: parseFloat(member.total),
			percentage: member.percentage,
			transactionCount: member.transaction_count,
		})),
		trends: api.trends.map((point) => ({
			date: point.date,
			income: parseFloat(point.income),
			expenses: parseFloat(point.expenses),
		})),
		recentTransactions: api.recent_transactions.map((tx) => ({
			id: tx.id,
			description: tx.description,
			amount: parseFloat(tx.amount),
			date: tx.date,
			categoryName: tx.category_name,
			categoryColor: tx.category_color,
			categoryIcon: tx.category_icon,
			memberName: tx.member_name,
			memberAvatarUrl: tx.member_avatar_url,
		})),
	}
}

// Group dashboard
export async function fetchGroupDashboard(
	groupId: string,
	period: Period = 'this_month'
): Promise<GroupDashboardData> {
	const response = await authenticatedFetch(
		`${API_BASE}/groups/${groupId}/dashboard?period=${period}`,
		{ method: 'GET' }
	)

	if (!response.ok) {
		if (response.status === 404) {
			// Return empty dashboard data
			return {
				summary: { totalExpenses: 0, totalIncome: 0, netBalance: 0, memberCount: 0 },
				categoryBreakdown: [],
				memberBreakdown: [],
				trends: [],
				recentTransactions: [],
			}
		}
		throw new Error('Erro ao carregar dashboard do grupo')
	}

	const data: GroupDashboardApiResponse = await response.json()
	return transformDashboardData(data)
}
