import { Button } from '@main/components/ui/Button'
import type { GroupMember, GroupInvite, MemberRole } from '../types'

interface GroupMembersTabProps {
	members: GroupMember[]
	pendingInvites: GroupInvite[]
	currentUserRole: MemberRole
	onInviteMember: () => void
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
			className="w-5 h-5"
		>
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	)
}

export function GroupMembersTab({
	members,
	pendingInvites,
	currentUserRole,
	onInviteMember,
}: GroupMembersTabProps) {
	return (
		<div className="space-y-6">
			{currentUserRole === 'admin' && (
				<div className="flex justify-end">
					<Button
						data-testid="invite-member-btn"
						onClick={onInviteMember}
					>
						+ Convidar Membro
					</Button>
				</div>
			)}

			<div className="space-y-3">
				{members.map((member) => (
					<div
						key={member.id}
						data-testid="member-item"
						className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] flex items-center justify-between"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
								{member.avatarUrl ? (
									<img
										src={member.avatarUrl}
										alt={member.name}
										className="w-10 h-10 rounded-full object-cover"
									/>
								) : (
									<UserIcon />
								)}
							</div>
							<div>
								<p className="font-medium text-[var(--color-text)]">
									{member.name}
								</p>
								<p className="text-sm text-[var(--color-text-secondary)]">
									{member.email}
								</p>
							</div>
						</div>
						{member.role === 'admin' && (
							<span
								data-testid="admin-badge"
								className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--color-primary)] text-white"
							>
								Admin
							</span>
						)}
					</div>
				))}
			</div>

			{pendingInvites.length > 0 && (
				<div>
					<h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
						Convites Pendentes
					</h3>
					<div className="space-y-3">
						{pendingInvites.map((invite) => (
							<div
								key={invite.id}
								data-testid="pending-invite"
								className="p-4 bg-[var(--color-surface)] rounded-lg border border-dashed border-[var(--color-border)] flex items-center justify-between"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-[var(--color-background)] flex items-center justify-center text-[var(--color-text-secondary)]">
										<UserIcon />
									</div>
									<div>
										<p className="font-medium text-[var(--color-text)]">
											{invite.email}
										</p>
										<p className="text-sm text-[var(--color-text-secondary)]">
											Convite pendente
										</p>
									</div>
								</div>
								<span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
									Pendente
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default GroupMembersTab
