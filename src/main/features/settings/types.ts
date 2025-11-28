export interface UserProfile {
	id: string
	name: string
	email: string
	avatarUrl?: string
	createdAt: string
}

export interface UserPreferences {
	dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
	numberFormat: 'BR' | 'US'
	currency: string
	language: string
	theme: 'light' | 'dark' | 'system'
}

export interface NotificationSettings {
	emailNotifications: boolean
	goalAlerts: boolean
	weeklyReport: boolean
	transactionAlerts: boolean
}

export interface SettingsState {
	profile: UserProfile
	preferences: UserPreferences
	notifications: NotificationSettings
}
