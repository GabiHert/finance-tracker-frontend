import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@main/components/ui/Button'
import { Modal } from '@main/components/ui/Modal'
import { GroupDashboardTab } from './components/GroupDashboardTab'
import { GroupTransactionsTab } from './components/GroupTransactionsTab'
import { GroupMembersTab } from './components/GroupMembersTab'
import { GroupCategoriesTab } from './components/GroupCategoriesTab'
import { InviteModal } from './InviteModal'
import { GroupCategoryModal } from './GroupCategoryModal'
import { getGroupById } from './groups-store'
import {
	mockGroupTransactions,
	mockGroupCategories,
	mockGroupSummary,
} from './mock-data'
import type { Group, GroupTab, GroupCategory, GroupInvite } from './types'

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

export function GroupDetailScreen() {
	const { groupId } = useParams<{ groupId: string }>()
	const navigate = useNavigate()

	const [group, setGroup] = useState<Group | null>(null)
	const [activeTab, setActiveTab] = useState<GroupTab>('dashboard')
	const [categories, setCategories] = useState(mockGroupCategories)
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	useEffect(() => {
		const foundGroup = getGroupById(groupId || '')
		if (foundGroup) {
			setGroup(foundGroup)
		}
	}, [groupId])

	if (!group) {
		return (
			<div className="min-h-screen p-6 bg-[var(--color-background)] flex items-center justify-center">
				<p className="text-[var(--color-text-secondary)]">Grupo nao encontrado</p>
			</div>
		)
	}

	const handleBack = () => {
		navigate('/groups')
	}

	const handleInviteSend = (email: string) => {
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
	}

	const handleSaveCategory = (data: { name: string; type: 'income' | 'expense'; color: string }) => {
		const newCategory: GroupCategory = {
			id: `cat-${Date.now()}`,
			name: data.name,
			type: data.type,
			icon: 'tag',
			color: data.color,
			transactionCount: 0,
		}
		setCategories([...categories, newCategory])
		setIsCategoryModalOpen(false)
	}

	const tabs: { id: GroupTab; label: string }[] = [
		{ id: 'dashboard', label: 'Dashboard' },
		{ id: 'transactions', label: 'Transacoes' },
		{ id: 'categories', label: 'Categorias' },
		{ id: 'members', label: 'Membros' },
	]

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
						<GroupDashboardTab summary={mockGroupSummary} />
					</div>
				)}

				{activeTab === 'transactions' && (
					<div data-testid="group-transactions-tab">
						<GroupTransactionsTab transactions={mockGroupTransactions} />
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
