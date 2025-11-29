import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@main/components'
import type { LoginFormData, FormErrors } from '../types'

interface LoginFormProps {
	onSubmit: (data: LoginFormData) => Promise<void>
}

function EnvelopeIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
			<path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
			<path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
		</svg>
	)
}

function LockIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
			<path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
		</svg>
	)
}

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

export function LoginForm({ onSubmit }: LoginFormProps) {
	const [formData, setFormData] = useState<LoginFormData>({
		email: '',
		password: '',
		rememberMe: false,
	})
	const [errors, setErrors] = useState<FormErrors>({})
	const [isLoading, setIsLoading] = useState(false)

	const validate = (): boolean => {
		const newErrors: FormErrors = {}

		if (!formData.email) {
			newErrors.email = 'E-mail é obrigatório'
		} else if (!validateEmail(formData.email)) {
			newErrors.email = 'E-mail inválido'
		}

		if (!formData.password) {
			newErrors.password = 'Senha é obrigatória'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()

		if (!validate()) return

		setIsLoading(true)
		try {
			await onSubmit(formData)
		} catch (error) {
			setErrors({
				form: error instanceof Error ? error.message : 'Erro ao fazer login',
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4" noValidate>
			{errors.form && (
				<div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-error-50)] text-[var(--color-error)] text-sm">
					{errors.form}
				</div>
			)}

			<Input
				data-testid="input-email"
				type="email"
				label="E-mail"
				placeholder="Digite seu e-mail"
				value={formData.email}
				onChange={(value) => setFormData({ ...formData, email: value })}
				error={errors.email}
				leftIcon={<EnvelopeIcon />}
				autoComplete="email"
				required
			/>

			<Input
				data-testid="input-password"
				type="password"
				label="Senha"
				placeholder="Digite sua senha"
				value={formData.password}
				onChange={(value) => setFormData({ ...formData, password: value })}
				error={errors.password}
				leftIcon={<LockIcon />}
				showPasswordToggle
				autoComplete="current-password"
				required
			/>

			<div className="flex items-center justify-between mt-4">
				<label className="flex items-center gap-2 cursor-pointer" data-testid="remember-me-label">
					<input
						type="checkbox"
						data-testid="remember-me-checkbox"
						checked={formData.rememberMe}
						onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
						className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
					/>
					<span className="text-sm text-[var(--color-text-secondary)]">Lembrar de mim</span>
				</label>

				<Link
					to="/forgot-password"
					className="text-sm text-[var(--color-primary)] hover:underline"
				>
					Esqueceu a senha?
				</Link>
			</div>

			<Button
				type="submit"
				fullWidth
				isLoading={isLoading}
				className="mt-6"
			>
				Entrar
			</Button>

			<p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
				Não tem uma conta?{' '}
				<Link
					to="/register"
					className="text-[var(--color-primary)] hover:underline font-medium"
				>
					Criar conta
				</Link>
			</p>
		</form>
	)
}

export default LoginForm
