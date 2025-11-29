import { useState, type FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Input } from '@main/components'
import { resetPassword } from '../api/auth'

function LockIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
			<path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
		</svg>
	)
}

export function ResetPasswordScreen() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const token = searchParams.get('token')

	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)

	// Check if token is missing or invalid format
	if (!token) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
				<div className="w-full max-w-md">
					<div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-lg p-8">
						<div className="text-center">
							<div className="mx-auto w-16 h-16 bg-[var(--color-error-50)] rounded-full flex items-center justify-center mb-4">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[var(--color-error)]">
									<path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
								</svg>
							</div>
							<h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
								Link invalido
							</h1>
							<p
								data-testid="error-message"
								className="text-[var(--color-text-secondary)] mb-6"
							>
								Link expirado. Solicite um novo
							</p>
							<Link
								to="/forgot-password"
								data-testid="request-new-link"
								className="text-[var(--color-primary)] hover:underline font-medium"
							>
								Solicitar novo link
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setError('')

		if (!newPassword) {
			setError('Nova senha e obrigatoria')
			return
		}

		if (newPassword.length < 8) {
			setError('A senha deve ter pelo menos 8 caracteres')
			return
		}

		if (newPassword !== confirmPassword) {
			setError('As senhas nao conferem')
			return
		}

		setIsLoading(true)
		try {
			await resetPassword(token, newPassword)
			setIsSuccess(true)
			// Redirect to login after 2 seconds
			setTimeout(() => {
				navigate('/login')
			}, 2000)
		} catch (err) {
			if (err instanceof Error && err.message.includes('expirado')) {
				setError('Link expirado. Solicite um novo')
			} else {
				setError('Erro ao redefinir senha. Tente novamente')
			}
		} finally {
			setIsLoading(false)
		}
	}

	if (isSuccess) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
				<div className="w-full max-w-md">
					<div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-lg p-8">
						<div className="text-center">
							<div className="mx-auto w-16 h-16 bg-[var(--color-success-50)] rounded-full flex items-center justify-center mb-4">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[var(--color-success)]">
									<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
								</svg>
							</div>
							<h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
								Senha alterada!
							</h1>
							<p
								data-testid="success-message"
								className="text-[var(--color-text-secondary)] mb-6"
							>
								Senha alterada com sucesso
							</p>
							<p className="text-sm text-[var(--color-text-secondary)]">
								Redirecionando para o login...
							</p>
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
							Redefinir senha
						</h1>
						<p className="text-[var(--color-text-secondary)] mt-2">
							Digite sua nova senha
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4" noValidate>
						{error && (
							<div
								data-testid="reset-error"
								className="p-3 rounded-[var(--radius-md)] bg-[var(--color-error-50)] text-[var(--color-error)] text-sm"
							>
								{error}
							</div>
						)}

						<Input
							data-testid="new-password-input"
							type="password"
							label="Nova senha"
							placeholder="Digite sua nova senha"
							value={newPassword}
							onChange={setNewPassword}
							leftIcon={<LockIcon />}
							showPasswordToggle
							autoComplete="new-password"
							required
						/>

						<Input
							data-testid="confirm-password-input"
							type="password"
							label="Confirmar senha"
							placeholder="Confirme sua nova senha"
							value={confirmPassword}
							onChange={setConfirmPassword}
							leftIcon={<LockIcon />}
							showPasswordToggle
							autoComplete="new-password"
							required
						/>

						<Button
							type="submit"
							data-testid="reset-password-btn"
							fullWidth
							isLoading={isLoading}
							className="mt-6"
						>
							Redefinir senha
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

export default ResetPasswordScreen
