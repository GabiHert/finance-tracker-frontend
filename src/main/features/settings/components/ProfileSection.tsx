import { Button } from '@main/components/ui/Button'
import type { UserProfile } from '../types'

interface ProfileSectionProps {
	profile: UserProfile
	onEdit: () => void
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
			className="w-12 h-12"
		>
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	)
}

function EditIcon() {
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
			<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
			<path d="m15 5 4 4" />
		</svg>
	)
}

export function ProfileSection({ profile, onEdit }: ProfileSectionProps) {
	return (
		<div
			data-testid="profile-section"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6"
		>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-[var(--color-text)]">
					Perfil
				</h2>
				<Button
					data-testid="edit-profile-btn"
					variant="tertiary"
					onClick={onEdit}
				>
					<EditIcon />
					<span className="ml-2">Editar</span>
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
					{profile.avatarUrl ? (
						<img
							src={profile.avatarUrl}
							alt={profile.name}
							className="w-full h-full rounded-full object-cover"
						/>
					) : (
						<UserIcon />
					)}
				</div>
				<div>
					<p data-testid="user-name" className="text-lg font-medium text-[var(--color-text)]">
						{profile.name}
					</p>
					<p data-testid="user-email" className="text-sm text-[var(--color-text-secondary)]">
						{profile.email}
					</p>
				</div>
			</div>
		</div>
	)
}
