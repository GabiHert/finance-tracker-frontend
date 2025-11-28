export interface User {
	id: string
	email: string
	name: string
	dateFormat: string
	numberFormat: string
	firstDayOfWeek: string
	emailNotifications: boolean
	goalAlerts: boolean
	recurringReminders: boolean
	createdAt: string
	updatedAt: string
}

export interface LoginRequest {
	email: string
	password: string
	remember_me?: boolean
}

export interface LoginResponse {
	access_token: string
	refresh_token: string
	user: User
}

export interface RegisterRequest {
	email: string
	name: string
	password: string
	terms_accepted: boolean
}

export interface RegisterResponse {
	access_token: string
	refresh_token: string
	user: User
}

export interface AuthError {
	message: string
	code?: string
	details?: Record<string, string[]>
}

export interface LoginFormData {
	email: string
	password: string
	rememberMe: boolean
}

export interface RegisterFormData {
	name: string
	email: string
	password: string
	confirmPassword: string
	termsAccepted: boolean
}

export interface FormErrors {
	[key: string]: string
}
