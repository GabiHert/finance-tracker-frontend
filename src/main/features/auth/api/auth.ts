import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, AuthError } from '../types'
import { API_BASE, authenticatedFetch } from '@main/lib'

export async function login(data: LoginRequest): Promise<LoginResponse> {
	const response = await fetch(`${API_BASE}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		const error: AuthError = await response.json()
		throw new Error(error.message || 'Erro ao fazer login')
	}

	return response.json()
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
	const response = await fetch(`${API_BASE}/auth/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		const error: AuthError = await response.json()

		if (response.status === 409) {
			throw new Error('Este e-mail já está cadastrado')
		}

		throw new Error(error.message || 'Erro ao criar conta')
	}

	return response.json()
}

export async function refreshToken(token: string): Promise<{ access_token: string; refresh_token: string }> {
	const response = await fetch(`${API_BASE}/auth/refresh`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ refresh_token: token }),
	})

	if (!response.ok) {
		throw new Error('Sessão expirada')
	}

	return response.json()
}

export async function logout(token: string): Promise<void> {
	await fetch(`${API_BASE}/auth/logout`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ refresh_token: token }),
	})
}

export async function forgotPassword(email: string): Promise<void> {
	await fetch(`${API_BASE}/auth/forgot-password`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email }),
	})
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
	const response = await fetch(`${API_BASE}/auth/reset-password`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ token, new_password: newPassword }),
	})

	if (!response.ok) {
		throw new Error('Token inválido ou expirado')
	}
}

export async function deleteAccount(password: string, confirmation: string = 'DELETE'): Promise<void> {
	const response = await authenticatedFetch(`${API_BASE}/users/me`, {
		method: 'DELETE',
		body: JSON.stringify({ password, confirmation }),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Erro ao excluir conta' }))
		throw new Error(error.message || 'Erro ao excluir conta')
	}
}
