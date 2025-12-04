import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@main/components/ui/Button'
import { Modal } from '@main/components/ui/Modal'
import { GroupDashboardTab } from './components/GroupDashboardTab'
import { GroupTransactionsTab } from './components/GroupTransactionsTab'
import { GroupMembersTab } from './components/GroupMembersTab'
import { GroupCategoriesTab } from './components/GroupCategoriesTab'
import { InviteModal } from './InviteModal'
import { GroupCategoryModal } from './GroupCategoryModal'
import {
	fetchGroupById,
	fetchGroupDashboard,
	fetchGroupTransactions,
	fetchGroupCategories,
	createGroupCategory,
	inviteMember,
} from './api'
import type { Group, GroupTab, GroupCategory, GroupTransaction, GroupDashboardData, GroupInvite } from './types'
import type { Period } from '@main/features/dashboard/types'
import type { DateRange } from '@main/features/dashboard/components/PeriodSelector'

function ArrowLeftIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-5 h-5"
		>
			<path d="m12 19-7-7 7-7" />
			<path d="M19 12H5" />
		</svg>
	)
}

function SettingsIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-5 h-5"
		>
			<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	)
}

function UserIcon() {
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
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	)
}

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD format
 */
function convertDateFormat(dateStr: string): string {
	if (!dateStr) return ''
	const [day, month, year] = dateStr.split('/')
	if (!day || !month || !year) return ''
	return `${year}-${month}-${day}`
}

export function GroupDetailScreen() {
	const { groupId } = useParams<{ groupId: string }>()
	const navigate = useNavigate()

	const [group, setGroup] = useState<Group | null>(null)
	const [dashboardData, setDashboardData] = useState<GroupDashboardData | null>(null)
	const [transactions, setTransactions] = useState<GroupTransaction[]>([])
	const [categories, setCategories] = useState<GroupCategory[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isDashboardLoading, setIsDashboardLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState<GroupTab>('dashboard')
	const [period, setPeriod] = useState<Period>('this_month')
	const [customDateRange, setCustomDateRange] = useState<DateRange>({
		startDate: '',
		endDate: '',
	})
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	const loadGroupData = useCallback(async () => {
		if (!groupId) return

		try {
			setIsLoading(true)
			setError(null)

			// Fetch group data first - this is critical and must succeed
			const groupData = await fetchGroupById(groupId)
			setGroup(groupData)

			// Fetch secondary data in parallel, but don't fail if they error
			const [dashResult, transactionsResult, categoriesResult] = await Promise.allSettled([
				fetchGroupDashboard(groupId, period),
				fetchGroupTransactions(groupId),
				fetchGroupCategories(groupId),
			])

			// Set data from successful fetches, use defaults for failures
			if (dashResult.status === 'fulfilled') {
				setDashboardData(dashResult.value)
			} else {
				console.warn('Failed to load dashboard:', dashResult.reason)
				setDashboardData({
					summary: { totalExpenses: 0, totalIncome: 0, netBalance: 0, memberCount: groupData.members?.length || 1 },
					categoryBreakdown: [],
					memberBreakdown: [],
					trends: [],
					recentTransactions: [],
				})
			}

			if (transactionsResult.status === 'fulfilled') {
				setTransactions(transactionsResult.value)
			} else {
				console.warn('Failed to load transactions:', transactionsResult.reason)
				setTransactions([])
			}

			if (categoriesResult.status === 'fulfilled') {
				setCategories(categoriesResult.value)
			} else {
				console.warn('Failed to load categories:', categoriesResult.reason)
				setCategories([])
			}
		} catch (err) {
			setError('Erro ao carregar dados do grupo')
			console.error('Error loading group data:', err)
		} finally {
			setIsLoading(false)
		}
	}, [groupId, period])

	const loadDashboard = useCallback(async () => {
		if (!groupId) return

		try {
			setIsDashboardLoading(true)

			let dashData: GroupDashboardData

			if (period === 'custom' && customDateRange.startDate && customDateRange.endDate) {
				// Convert DD/MM/YYYY to YYYY-MM-DD for API
				dashData = await fetchGroupDashboard({
					groupId,
					period,
					customStartDate: convertDateFormat(customDateRange.startDate),
					customEndDate: convertDateFormat(customDateRange.endDate),
				})
			} else {
				dashData = await fetchGroupDashboard(groupId, period)
			}

			setDashboardData(dashData)
		} catch (err) {
			console.error('Error loading dashboard:', err)
		} finally {
			setIsDashboardLoading(false)
		}
	}, [groupId, period, customDateRange])

	const handlePeriodChange = (newPeriod: Period) => {
		setPeriod(newPeriod)
	}

	const handleCustomDateRangeChange = (range: DateRange) => {
		setCustomDateRange(range)
	}

	useEffect(() => {
		if (group) {
			// Only load if not custom, or if custom and both dates are set
			if (period !== 'custom' || (customDateRange.startDate && customDateRange.endDate)) {
				loadDashboard()
			}
		}
	}, [period, customDateRange, loadDashboard, group])

	useEffect(() => {
		loadGroupData()
	}, [loadGroupData])

	const handleBack = () => {
		navigate('/groups')
	}

	const handleInviteSend = async (email: string) => {
		if (!groupId || !group) return

		try {
			await inviteMember(groupId, email)
			const newInvite: GroupInvite = {
				id: `invite-${Date.now()}`,
				email,
				status: 'pending',
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				createdAt: new Date().toISOString(),
			}
			setGroup({
				...group,
				pendingInvites: [...(group.pendingInvites || []), newInvite],
			})
			setIsInviteModalOpen(false)
		} catch (err) {
			console.error('Error sending invite:', err)
		}
	}

	const handleSaveCategory = async (data: { name: string; type: 'income' | 'expense'; color: string }) => {
		if (!groupId) return

		try {
			const newCategory = await createGroupCategory(groupId, data)
			setCategories([...categories, newCategory])
			setIsCategoryModalOpen(false)
		} catch (err) {
			console.error('Error creating category:', err)
		}
	}

	const tabs: { id: GroupTab; label: string }[] = [
		{ id: 'dashboard', label: 'Dashboard' },
		{ id: 'transactions', label: 'Transacoes' },
		{ id: 'categories', label: 'Categorias' },
		{ id: 'members', label: 'Membros' },
	]

	if (isLoading) {
		return (
			<div data-testid="group-detail-screen" className="min-h-screen bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto p-6">
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div data-testid="group-detail-screen" className="min-h-screen bg-[var(--color-background)]">
				<div className="max-w-4xl mx-auto p-6">
					<div className="text-center py-12">
						<p className="text-red-500 mb-4">{error}</p>
						<Button onClick={loadGroupData}>Tentar novamente</Button>
					</div>
				</div>
			</div>
		)
	}

	if (!group) {
		return (
			<div data-testid="group-detail-screen" className="min-h-screen p-6 bg-[var(--color-background)] flex items-center justify-center">
				<p className="text-[var(--color-text-secondary)]">Grupo nao encontrado</p>
			</div>
		)
	}

	return (
		<div data-testid="group-detail-screen" className="min-h-screen bg-[var(--color-background)]">
			<div data-testid="group-header" className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
				<div className="max-w-4xl mx-auto p-4">
					<div className="flex items-center justify-between mb-4">
						<button
							onClick={handleBack}
							className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
						>
							<ArrowLeftIcon />
							<span>Voltar</span>
						</button>
						{group.currentUserRole === 'admin' && (
							<Button
								data-testid="group-settings-btn"
								variant="tertiary"
								onClick={() => setIsSettingsOpen(true)}
							>
								<SettingsIcon />
							</Button>
						)}
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-[var(--color-text)]">
								{group.name}
							</h1>
							{group.description && (
								<p className="text-[var(--color-text-secondary)] mt-1">
									{group.description}
								</p>
							)}
						</div>
						<div data-testid="member-avatars" className="flex -space-x-2">
							{group.members.slice(0, 5).map((member) => (
								<div
									key={member.id}
									className="w-8 h-8 rounded-full bg-[var(--color-primary)] border-2 border-[var(--color-surface)] flex items-center justify-center text-white text-xs"
									title={member.name}
								>
									{member.avatarUrl ? (
										<img
											src={member.avatarUrl}
											alt={member.name}
											className="w-full h-full rounded-full object-cover"
										/>
									) : (
										<UserIcon />
									)}
								</div>
							))}
							{group.members.length > 5 && (
								<div className="w-8 h-8 rounded-full bg-[var(--color-background)] border-2 border-[var(--color-surface)] flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
									+{group.members.length - 5}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-4xl mx-auto p-4">
				<div
					data-testid="group-tabs"
					className="flex gap-2 mb-6 overflow-x-auto pb-2"
				>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
								activeTab === tab.id
									? 'bg-[var(--color-primary)] text-white'
									: 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)]'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{activeTab === 'dashboard' && (
					<div data-testid="group-dashboard-tab">
						<GroupDashboardTab
							data={dashboardData}
							period={period}
							onPeriodChange={handlePeriodChange}
							customDateRange={customDateRange}
							onCustomDateRangeChange={handleCustomDateRangeChange}
							onRefresh={loadDashboard}
							isLoading={isDashboardLoading}
						/>
					</div>
				)}

				{activeTab === 'transactions' && (
					<div data-testid="group-transactions-tab">
						<GroupTransactionsTab transactions={transactions} />
					</div>
				)}

				{activeTab === 'categories' && (
					<div data-testid="group-categories-tab">
						<GroupCategoriesTab
							categories={categories}
							currentUserRole={group.currentUserRole}
							onAddCategory={() => setIsCategoryModalOpen(true)}
						/>
					</div>
				)}

				{activeTab === 'members' && (
					<div data-testid="group-members-tab">
						<GroupMembersTab
							members={group.members}
							pendingInvites={group.pendingInvites || []}
							currentUserRole={group.currentUserRole}
							onInviteMember={() => setIsInviteModalOpen(true)}
						/>
					</div>
				)}
			</div>

			<InviteModal
				isOpen={isInviteModalOpen}
				onClose={() => setIsInviteModalOpen(false)}
				onSend={handleInviteSend}
			/>

			<GroupCategoryModal
				isOpen={isCategoryModalOpen}
				onClose={() => setIsCategoryModalOpen(false)}
				onSave={handleSaveCategory}
			/>

			<Modal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				title="Configuracoes do Grupo"
				size="md"
				data-testid="group-settings-modal"
			>
				<div className="space-y-4">
					<Button variant="secondary" className="w-full justify-start">
						Editar informacoes do grupo
					</Button>
					<Button variant="secondary" className="w-full justify-start">
						Gerenciar membros
					</Button>
					<Button variant="danger" className="w-full justify-start">
						Excluir grupo
					</Button>
				</div>
			</Modal>
		</div>
	)
}

export default GroupDetailScreen
