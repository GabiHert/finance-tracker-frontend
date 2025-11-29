import { Button } from '@main/components/ui/Button'

interface DataSectionProps {
	onChangePassword: () => void
	onDeleteAccount: () => void
	onDeleteAllTransactions: () => void
	onLogout: () => void
}

function KeyIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-4 h-4"
		>
			<circle cx="7.5" cy="15.5" r="5.5" />
			<path d="m21 2-9.6 9.6" />
			<path d="m15.5 7.5 3 3L22 7l-3-3" />
		</svg>
	)
}

function TrashIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-4 h-4"
		>
			<path d="M3 6h18" />
			<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
			<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
			<line x1="10" x2="10" y1="11" y2="17" />
			<line x1="14" x2="14" y1="11" y2="17" />
		</svg>
	)
}

function LogoutIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="w-4 h-4"
		>
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" x2="9" y1="12" y2="12" />
		</svg>
	)
}

export function DataSection({ onChangePassword, onDeleteAccount, onDeleteAllTransactions, onLogout }: DataSectionProps) {
	return (
		<div
			data-testid="data-section"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6"
		>
			<h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
				Dados e Privacidade
			</h2>

			<div className="space-y-4">
				<div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
					<div>
						<p className="text-sm font-medium text-[var(--color-text)]">
							Alterar senha
						</p>
						<p className="text-xs text-[var(--color-text-secondary)]">
							Atualize sua senha de acesso
						</p>
					</div>
					<Button
						data-testid="change-password-btn"
						variant="secondary"
						onClick={onChangePassword}
					>
						<KeyIcon />
						<span className="ml-2">Alterar</span>
					</Button>
				</div>

				<div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
					<div>
						<p className="text-sm font-medium text-[var(--color-text)]">
							Sair da conta
						</p>
						<p className="text-xs text-[var(--color-text-secondary)]">
							Encerre sua sessao neste dispositivo
						</p>
					</div>
					<Button
						data-testid="logout-btn"
						variant="secondary"
						onClick={onLogout}
					>
						<LogoutIcon />
						<span className="ml-2">Sair</span>
					</Button>
				</div>

				<div className="pt-4" data-testid="danger-zone">
					<p className="text-sm font-medium text-[var(--color-text)] mb-2">
						Zona de perigo
					</p>
					<p className="text-xs text-[var(--color-text-secondary)] mb-4">
						Acoes irreversiveis que afetam sua conta
					</p>
					<div className="flex flex-col gap-2">
						<Button
							data-testid="delete-all-transactions-btn"
							variant="danger"
							onClick={onDeleteAllTransactions}
						>
							<TrashIcon />
							<span className="ml-2">Excluir todas as transacoes</span>
						</Button>
						<Button
							data-testid="delete-account-btn"
							variant="danger"
							onClick={onDeleteAccount}
						>
							<TrashIcon />
							<span className="ml-2">Excluir conta</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
