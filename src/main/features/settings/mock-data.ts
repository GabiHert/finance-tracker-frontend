import type { UserProfile, UserPreferences, NotificationSettings } from './types'

export const mockUserProfile: UserProfile = {
	id: 'user-1',
	name: 'Usuario Teste',
	email: 'e2e-user@test.com',
	createdAt: '2025-01-15T10:00:00Z',
}

export const mockUserPreferences: UserPreferences = {
	dateFormat: 'DD/MM/YYYY',
	numberFormat: 'BR',
	currency: 'BRL',
	language: 'pt-BR',
	theme: 'light',
}

export const mockNotificationSettings: NotificationSettings = {
	emailNotifications: true,
	goalAlerts: true,
	weeklyReport: false,
	transactionAlerts: true,
}
