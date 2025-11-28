import type { NotificationSettings } from '../types'

interface NotificationsSectionProps {
	settings: NotificationSettings
	onChange: (key: keyof NotificationSettings, value: boolean) => void
}

interface ToggleProps {
	testId: string
	label: string
	description?: string
	checked: boolean
	onChange: (checked: boolean) => void
}

function Toggle({ testId, label, description, checked, onChange }: ToggleProps) {
	return (
		<div className="flex items-center justify-between py-3">
			<div>
				<p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
				{description && (
					<p className="text-xs text-[var(--color-text-secondary)]">{description}</p>
				)}
			</div>
			<button
				data-testid={testId}
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={`relative w-11 h-6 rounded-full transition-colors ${
					checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
				}`}
			>
				<span
					className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
						checked ? 'translate-x-5' : 'translate-x-0'
					}`}
				/>
			</button>
		</div>
	)
}

export function NotificationsSection({ settings, onChange }: NotificationsSectionProps) {
	return (
		<div
			data-testid="notifications-section"
			className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6"
		>
			<h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
				Notificacoes
			</h2>

			<div className="divide-y divide-[var(--color-border)]">
				<Toggle
					testId="email-notifications-toggle"
					label="Notificacoes por e-mail"
					description="Receba resumos e alertas por e-mail"
					checked={settings.emailNotifications}
					onChange={(value) => onChange('emailNotifications', value)}
				/>

				<Toggle
					testId="goal-alerts-toggle"
					label="Alertas de metas"
					description="Seja notificado quando atingir limites"
					checked={settings.goalAlerts}
					onChange={(value) => onChange('goalAlerts', value)}
				/>

				<Toggle
					testId="weekly-report-toggle"
					label="Relatorio semanal"
					description="Receba um resumo semanal das suas financas"
					checked={settings.weeklyReport}
					onChange={(value) => onChange('weeklyReport', value)}
				/>

				<Toggle
					testId="transaction-alerts-toggle"
					label="Alertas de transacoes"
					description="Seja notificado sobre novas transacoes"
					checked={settings.transactionAlerts}
					onChange={(value) => onChange('transactionAlerts', value)}
				/>
			</div>
		</div>
	)
}
