import { Button } from '@main/components/ui/Button'
import type { Group } from '../types'

interface GroupCardProps {
	group: Group
	onClick: (group: Group) => void
}

function UsersIcon() {
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
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	)
}

export function GroupCard({ group, onClick }: GroupCardProps) {
	return (
		<div
			data-testid="group-card"
			onClick={() => onClick(group)}
			className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)] transition-colors"
		>
			<div className="flex items-start justify-between mb-3">
				<div>
					<h3 className="font-medium text-[var(--color-text)] text-lg">
						{group.name}
					</h3>
					{group.description && (
						<p className="text-sm text-[var(--color-text-secondary)] mt-1">
							{group.description}
						</p>
					)}
				</div>
				{group.currentUserRole === 'admin' && (
					<span
						data-testid="admin-badge"
						className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--color-primary)] text-white"
					>
						Admin
					</span>
				)}
			</div>

			<div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
				<UsersIcon />
				<span className="text-sm">{group.memberCount} membros</span>
			</div>

			{group.pendingInvites && group.pendingInvites.length > 0 && (
				<div className="mt-2 text-xs text-[var(--color-warning)]">
					{group.pendingInvites.length} convite(s) pendente(s)
				</div>
			)}
		</div>
	)
}

export default GroupCard
