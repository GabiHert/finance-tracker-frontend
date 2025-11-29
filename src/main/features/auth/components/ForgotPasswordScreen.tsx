import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@main/components'
import { forgotPassword } from '../api/auth'

function EnvelopeIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
			<path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
			<path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
		</svg>
	)
}

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

export function ForgotPasswordScreen() {
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setError('')

		if (!email) {
			setError('E-mail e obrigatorio')
			return
		}

		if (!validateEmail(email)) {
			setError('E-mail invalido')
			return
		}

		setIsLoading(true)
		try {
			await forgotPassword(email)
			setIsSubmitted(true)
		} catch {
			// Always show success message to prevent email enumeration
			setIsSubmitted(true)
		} finally {
			setIsLoading(false)
		}
	}

	if (isSubmitted) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
				<div className="w-full max-w-md">
					<div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-lg p-8">
						<div className="text-center">
							<div className="mx-auto w-16 h-16 bg-[var(--color-success-50)] rounded-full flex items-center justify-center mb-4">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[var(--color-success)]">
									<path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
									<path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
								</svg>
							</div>
							<h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
								Verifique seu e-mail
							</h1>
							<p
								data-testid="success-message"
								className="text-[var(--color-text-secondary)] mb-6"
							>
								Se o e-mail existir, enviaremos um link de recuperacao
							</p>
							<Link
								to="/login"
								className="text-[var(--color-primary)] hover:underline font-medium"
							>
								Voltar para o login
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
			<div className="w-full max-w-md">
				<div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-lg p-8">
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-[var(--color-text)]">
							Esqueceu a senha?
						</h1>
						<p className="text-[var(--color-text-secondary)] mt-2">
							Digite seu e-mail para receber um link de recuperacao
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4" noValidate>
						{error && (
							<div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-error-50)] text-[var(--color-error)] text-sm">
								{error}
							</div>
						)}

						<Input
							data-testid="forgot-email-input"
							type="email"
							label="E-mail"
							placeholder="Digite seu e-mail"
							value={email}
							onChange={setEmail}
							leftIcon={<EnvelopeIcon />}
							autoComplete="email"
							required
						/>

						<Button
							type="submit"
							data-testid="send-reset-link-btn"
							fullWidth
							isLoading={isLoading}
							className="mt-6"
						>
							Enviar link
						</Button>

						<p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
							<Link
								to="/login"
								className="text-[var(--color-primary)] hover:underline font-medium"
							>
								Voltar para o login
							</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	)
}

export default ForgotPasswordScreen
