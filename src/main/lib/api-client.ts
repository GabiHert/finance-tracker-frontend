/**
 * Centralized API client with 401 handling
 *
 * This module provides a fetch wrapper that automatically handles 401 Unauthorized
 * responses by clearing tokens and redirecting to the login page.
 *
 * Requirements Reference: Frontend UI v3.0 Section 8.2 API Error Handling
 * | Unauthorized | 401 | --- | Redirect to login |
 */

export const API_BASE = '/api/v1'

/**
 * Custom error class for API errors with status code
 */
export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public code?: string
	) {
		super(message)
		this.name = 'ApiError'
	}
}

/**
 * Get authorization header with the current access token
 */
export function getAuthHeader(): Record<string, string> {
	const token = localStorage.getItem('access_token')
	return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthTokens(): void {
	localStorage.removeItem('access_token')
	localStorage.removeItem('refresh_token')
	localStorage.removeItem('user')
}

/**
 * Redirect to login page
 * Uses window.location for a hard redirect to ensure clean state
 */
function redirectToLogin(): void {
	// Only redirect if not already on login page
	if (!window.location.pathname.includes('/login')) {
		window.location.href = '/login'
	}
}

/**
 * Handle 401 Unauthorized response
 * Clears tokens and redirects to login
 * Returns a Promise that never resolves to prevent further code execution
 */
function handle401Response(): Promise<never> {
	clearAuthTokens()
	redirectToLogin()
	// Return a Promise that never resolves to prevent any further processing
	// The redirect will happen, and the page will unload
	return new Promise<never>(() => {
		// This Promise intentionally never resolves
		// It prevents any try/catch from catching an error
		// and keeps the caller suspended until the page navigates away
	})
}

/**
 * Authenticated fetch wrapper with automatic 401 handling
 *
 * This function wraps the native fetch API and:
 * 1. Automatically adds the Authorization header
 * 2. Handles 401 responses by clearing tokens and redirecting to login
 * 3. Returns the response for further processing
 *
 * @param url - The URL to fetch (relative to API_BASE or absolute)
 * @param options - Standard fetch options
 * @returns The fetch Response object
 */
export async function authenticatedFetch(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...getAuthHeader(),
		...(options.headers as Record<string, string> || {}),
	}

	const response = await fetch(url, {
		...options,
		headers,
	})

	// Handle 401 Unauthorized - redirect to login
	if (response.status === 401) {
		return handle401Response()
	}

	return response
}

/**
 * Make an authenticated GET request
 */
export async function apiGet<T>(url: string): Promise<T> {
	const response = await authenticatedFetch(url, { method: 'GET' })

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Request failed' }))
		throw new ApiError(error.error || error.message || 'Request failed', response.status)
	}

	return response.json()
}

/**
 * Make an authenticated POST request
 */
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
	const response = await authenticatedFetch(url, {
		method: 'POST',
		body: data ? JSON.stringify(data) : undefined,
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Request failed' }))
		throw new ApiError(error.error || error.message || 'Request failed', response.status)
	}

	return response.json()
}

/**
 * Make an authenticated PATCH request
 */
export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
	const response = await authenticatedFetch(url, {
		method: 'PATCH',
		body: data ? JSON.stringify(data) : undefined,
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Request failed' }))
		throw new ApiError(error.error || error.message || 'Request failed', response.status)
	}

	return response.json()
}

/**
 * Make an authenticated DELETE request
 */
export async function apiDelete(url: string, data?: unknown): Promise<void> {
	const response = await authenticatedFetch(url, {
		method: 'DELETE',
		body: data ? JSON.stringify(data) : undefined,
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Request failed' }))
		throw new ApiError(error.error || error.message || 'Request failed', response.status)
	}
}
