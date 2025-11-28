import { Link } from 'react-router-dom'
import type { DashboardAlert } from '../types'

interface AlertsBannerProps {
	alerts: DashboardAlert[]
}

function AlertIcon({ severity }: { severity: 'warning' | 'danger' | 'info' }) {
	const color = severity === 'danger' ? 'text-red-500' : severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'

	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-5 h-5 ${color}`}>
			<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</svg>
	)
}

export function AlertsBanner({ alerts }: AlertsBannerProps) {
	if (alerts.length === 0) return null

	const dangerAlerts = alerts.filter((a) => a.severity === 'danger')
	const warningAlerts = alerts.filter((a) => a.severity === 'warning')

	const displayAlert = dangerAlerts[0] || warningAlerts[0] || alerts[0]
	const bgColor =
		displayAlert.severity === 'danger'
			? 'bg-red-500/10 border-red-500'
			: displayAlert.severity === 'warning'
				? 'bg-yellow-500/10 border-yellow-500'
				: 'bg-blue-500/10 border-blue-500'

	return (
		<div data-testid="alerts-banner" className={`rounded-lg border p-4 ${bgColor}`}>
			<div className="flex items-center gap-3">
				<AlertIcon severity={displayAlert.severity} />
				<div className="flex-1">
					<p className="text-sm font-medium text-[var(--color-text)]">{displayAlert.message}</p>
					{alerts.length > 1 && (
						<p className="text-xs text-[var(--color-text-secondary)] mt-1">
							+{alerts.length - 1} outros alertas
						</p>
					)}
				</div>
				{displayAlert.goalId && (
					<Link
						to="/goals"
						className="text-sm font-medium text-[var(--color-primary)] hover:underline"
					>
						Ver limite
					</Link>
				)}
			</div>
		</div>
	)
}
