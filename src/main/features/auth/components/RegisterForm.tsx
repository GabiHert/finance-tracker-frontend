import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@main/components'
import type { RegisterFormData, FormErrors } from '../types'

interface RegisterFormProps {
	onSubmit: (data: RegisterFormData) => Promise<void>
}

function PersonIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
			<path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
		</svg>
	)
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

export function RegisterForm({ onSubmit }: RegisterFormProps) {
	const [formData, setFormData] = useState<RegisterFormData>({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		termsAccepted: false,
	})
	const [errors, setErrors] = useState<FormErrors>({})
	const [isLoading, setIsLoading] = useState(false)

	const validate = (): boolean => {
		const newErrors: FormErrors = {}

		if (!formData.name) {
			newErrors.name = 'Nome é obrigatório'
		} else if (formData.name.length < 2) {
			newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
		}

		if (!formData.email) {
			newErrors.email = 'E-mail é obrigatório'
		} else if (!validateEmail(formData.email)) {
			newErrors.email = 'E-mail inválido'
		}

		if (!formData.password) {
			newErrors.password = 'Senha é obrigatória'
		} else if (formData.password.length < 8) {
			newErrors.password = 'Senha deve ter pelo menos 8 caracteres'
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Senhas não coincidem'
		}

		if (!formData.termsAccepted) {
			newErrors.terms = 'Você deve aceitar os termos'
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
				form: error instanceof Error ? error.message : 'Erro ao criar conta',
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
				data-testid="input-name"
				type="text"
				label="Nome completo"
				placeholder="Digite seu nome"
				value={formData.name}
				onChange={(value) => setFormData({ ...formData, name: value })}
				error={errors.name}
				leftIcon={<PersonIcon />}
				autoComplete="name"
				required
			/>

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
				placeholder="Mínimo 8 caracteres"
				value={formData.password}
				onChange={(value) => setFormData({ ...formData, password: value })}
				error={errors.password}
				leftIcon={<LockIcon />}
				showPasswordToggle
				autoComplete="new-password"
				required
			/>

			<Input
				data-testid="input-confirm-password"
				type="password"
				label="Confirmar senha"
				placeholder="Digite a senha novamente"
				value={formData.confirmPassword}
				onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
				error={errors.confirmPassword}
				leftIcon={<LockIcon />}
				showPasswordToggle
				autoComplete="new-password"
				required
			/>

			<div className="mt-4">
				<label className="flex items-start gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={formData.termsAccepted}
						onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
						className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
					/>
					<span className="text-sm text-[var(--color-text-secondary)]">
						Eu concordo com os{' '}
						<a
							href="/terms"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--color-primary)] hover:underline"
						>
							Termos de Serviço
						</a>{' '}
						e{' '}
						<a
							href="/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--color-primary)] hover:underline"
						>
							Política de Privacidade
						</a>
					</span>
				</label>
				{errors.terms && (
					<p className="mt-1 text-sm text-[var(--color-error)]">{errors.terms}</p>
				)}
			</div>

			<Button
				type="submit"
				fullWidth
				isLoading={isLoading}
				className="mt-6"
			>
				Criar conta
			</Button>

			<p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
				Já tem uma conta?{' '}
				<Link
					to="/login"
					className="text-[var(--color-primary)] hover:underline font-medium"
				>
					Entrar
				</Link>
			</p>
		</form>
	)
}

export default RegisterForm
