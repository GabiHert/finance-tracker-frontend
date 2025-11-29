import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@main/components/ui/Button'
import { Modal } from '@main/components/ui/Modal'
import { logout, deleteAccount } from '@main/features/auth'
import { ProfileSection } from './components/ProfileSection'
import { PreferencesSection } from './components/PreferencesSection'
import { NotificationsSection } from './components/NotificationsSection'
import { DataSection } from './components/DataSection'
import { EditProfileModal } from './EditProfileModal'
import { ChangePasswordModal } from './ChangePasswordModal'
import { DeleteAccountModal } from './DeleteAccountModal'
import { mockUserProfile, mockUserPreferences, mockNotificationSettings } from './mock-data'
import type { UserProfile, UserPreferences, NotificationSettings } from './types'

export function SettingsScreen() {
	const navigate = useNavigate()
	const [profile, setProfile] = useState<UserProfile>(mockUserProfile)
	const [preferences, setPreferences] = useState<UserPreferences>(mockUserPreferences)
	const [notifications, setNotifications] = useState<NotificationSettings>(mockNotificationSettings)

	const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
	const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)

	const handleSaveProfile = (name: string) => {
		setProfile({ ...profile, name })
		setIsEditProfileOpen(false)
	}

	const handleSavePassword = (currentPassword: string, newPassword: string) => {
		// In mock mode, simulate validation
		if (currentPassword === 'WrongPassword123') {
			return { success: false, error: 'Senha atual incorreta' }
		}
		setIsChangePasswordOpen(false)
		return { success: true }
	}

	const handleDeleteAccount = async (password: string) => {
		try {
			await deleteAccount(password)
		} catch {
			// Continue with local cleanup even if API fails
			// Backend endpoint may not be implemented yet
		}
		// Clear tokens and redirect to login
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
		setIsDeleteAccountOpen(false)
		navigate('/login')
	}

	const handlePreferencesChange = (key: keyof UserPreferences, value: string) => {
		setPreferences({ ...preferences, [key]: value })
	}

	const handleNotificationsChange = (key: keyof NotificationSettings, value: boolean) => {
		setNotifications({ ...notifications, [key]: value })
	}

	const handleLogout = async () => {
		const refreshToken = localStorage.getItem('refresh_token')
		if (refreshToken) {
			try {
				await logout(refreshToken)
			} catch {
				// Ignore logout API errors, proceed with local cleanup
			}
		}
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
		navigate('/login')
	}

	return (
		<div data-testid="settings-screen" className="min-h-screen p-6 bg-[var(--color-background)]">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
					Configuracoes
				</h1>

				<div className="space-y-6">
					<ProfileSection
						profile={profile}
						onEdit={() => setIsEditProfileOpen(true)}
					/>

					<PreferencesSection
						preferences={preferences}
						onChange={handlePreferencesChange}
					/>

					<NotificationsSection
						settings={notifications}
						onChange={handleNotificationsChange}
					/>

					<DataSection
						onChangePassword={() => setIsChangePasswordOpen(true)}
						onDeleteAccount={() => setIsDeleteAccountOpen(true)}
						onLogout={handleLogout}
					/>
				</div>
			</div>

			<EditProfileModal
				isOpen={isEditProfileOpen}
				onClose={() => setIsEditProfileOpen(false)}
				onSave={handleSaveProfile}
				currentName={profile.name}
			/>

			<ChangePasswordModal
				isOpen={isChangePasswordOpen}
				onClose={() => setIsChangePasswordOpen(false)}
				onSave={handleSavePassword}
			/>

			<DeleteAccountModal
				isOpen={isDeleteAccountOpen}
				onClose={() => setIsDeleteAccountOpen(false)}
				onConfirm={handleDeleteAccount}
			/>
		</div>
	)
}

export default SettingsScreen
