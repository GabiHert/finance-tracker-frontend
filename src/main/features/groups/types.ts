export type MemberRole = 'admin' | 'member'

export interface GroupMember {
	id: string
	userId: string
	name: string
	email: string
	role: MemberRole
	avatarUrl?: string
	joinedAt: string
}

export interface GroupInvite {
	id: string
	email: string
	status: 'pending' | 'accepted' | 'declined' | 'expired'
	expiresAt: string
	createdAt: string
}

export interface Group {
	id: string
	name: string
	description?: string
	createdAt: string
	updatedAt: string
	memberCount: number
	members: GroupMember[]
	pendingInvites?: GroupInvite[]
	currentUserRole: MemberRole
}

export interface GroupCategory {
	id: string
	name: string
	type: 'income' | 'expense'
	icon: string
	color: string
	transactionCount: number
}

export interface GroupTransaction {
	id: string
	description: string
	amount: number
	date: string
	categoryId?: string
	categoryName?: string
	categoryIcon?: string
	categoryColor?: string
	memberName: string
	memberAvatarUrl?: string
}

export interface GroupSummary {
	totalExpenses: number
	totalIncome: number
	netBalance: number
	expensesByMember: {
		memberId: string
		memberName: string
		total: number
	}[]
	expensesByCategory: {
		categoryId: string
		categoryName: string
		categoryColor: string
		total: number
	}[]
}

// Enhanced dashboard types
export interface GroupDashboardSummary {
	totalExpenses: number
	totalIncome: number
	netBalance: number
	memberCount: number
	expensesChange?: number
	incomeChange?: number
}

export interface GroupCategoryBreakdown {
	categoryId: string
	categoryName: string
	categoryColor: string
	amount: number
	percentage: number
}

export interface GroupMemberBreakdown {
	memberId: string
	memberName: string
	avatarUrl?: string
	total: number
	percentage: number
	transactionCount: number
}

export interface GroupTrendPoint {
	date: string
	income: number
	expenses: number
}

export interface GroupDashboardTransaction {
	id: string
	description: string
	amount: number
	date: string
	categoryName: string
	categoryColor: string
	categoryIcon: string
	memberName: string
	memberAvatarUrl?: string
}

export interface GroupDashboardData {
	summary: GroupDashboardSummary
	categoryBreakdown: GroupCategoryBreakdown[]
	memberBreakdown: GroupMemberBreakdown[]
	trends: GroupTrendPoint[]
	recentTransactions: GroupDashboardTransaction[]
}

export type GroupTab = 'dashboard' | 'transactions' | 'categories' | 'members'
