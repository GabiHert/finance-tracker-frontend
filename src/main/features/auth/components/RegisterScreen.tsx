import { useNavigate } from 'react-router-dom'
import { RegisterForm } from './RegisterForm'
import { register } from '../api/auth'
import type { RegisterFormData, RegisterRequest } from '../types'

function Logo() {
	return (
		<div data-testid="logo" className="flex items-center gap-2 mb-8">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				className="w-10 h-10 text-[var(--color-primary)]"
			>
				<path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
				<path
					fillRule="evenodd"
					d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
					clipRule="evenodd"
				/>
				<path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
			</svg>
			<span className="text-2xl font-bold text-[var(--color-text)]">Finance Tracker</span>
		</div>
	)
}

export function RegisterScreen() {
	const navigate = useNavigate()

	const handleSubmit = async (data: RegisterFormData) => {
		const request: RegisterRequest = {
			email: data.email,
			name: data.name,
			password: data.password,
			terms_accepted: data.termsAccepted,
		}

		const response = await register(request)

		// Store tokens
		localStorage.setItem('access_token', response.access_token)
		localStorage.setItem('refresh_token', response.refresh_token)

		// Navigate to dashboard
		navigate('/dashboard')
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center">
					<Logo />

					<h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
						Criar Conta
					</h1>
					<p className="text-[var(--color-text-secondary)] mb-8">
						Comece a controlar suas finanças
					</p>
				</div>

				<div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 shadow-sm border border-[var(--color-border)]">
					<RegisterForm onSubmit={handleSubmit} />
				</div>
			</div>
		</div>
	)
}

export default RegisterScreen
