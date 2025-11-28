import { NavLink, useLocation } from 'react-router-dom'

interface BottomNavItem {
	path: string
	label: string
	icon: React.ReactNode
	testId: string
}

function DashboardIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<rect x="3" y="3" width="7" height="9" rx="1" />
			<rect x="14" y="3" width="7" height="5" rx="1" />
			<rect x="14" y="12" width="7" height="9" rx="1" />
			<rect x="3" y="16" width="7" height="5" rx="1" />
		</svg>
	)
}

function TransactionsIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
		</svg>
	)
}

function CategoriesIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
		</svg>
	)
}

function GoalsIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<circle cx="12" cy="12" r="10" />
			<circle cx="12" cy="12" r="6" />
			<circle cx="12" cy="12" r="2" />
		</svg>
	)
}

function SettingsIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
		</svg>
	)
}

const bottomNavItems: BottomNavItem[] = [
	{ path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, testId: 'dashboard' },
	{ path: '/transactions', label: 'Transacoes', icon: <TransactionsIcon />, testId: 'transactions' },
	{ path: '/categories', label: 'Categorias', icon: <CategoriesIcon />, testId: 'categories' },
	{ path: '/goals', label: 'Metas', icon: <GoalsIcon />, testId: 'goals' },
	{ path: '/settings', label: 'Config', icon: <SettingsIcon />, testId: 'settings' },
]

export function BottomNav() {
	const location = useLocation()

	const isActive = (path: string) => {
		return location.pathname === path || location.pathname.startsWith(`${path}/`)
	}

	return (
		<nav
			data-testid="bottom-nav"
			role="navigation"
			aria-label="Mobile navigation"
			className="
				md:hidden fixed bottom-0 left-0 right-0
				bg-[var(--color-surface)] border-t border-[var(--color-border)]
				z-50 safe-area-pb
			"
		>
			<ul className="flex items-center justify-around h-16 px-2">
				{bottomNavItems.map((item) => {
					const active = isActive(item.path)
					return (
						<li key={item.path} className="flex-1">
							<NavLink
								to={item.path}
								data-testid={`bottom-nav-${item.testId}`}
								data-active={active}
								className={`
									flex flex-col items-center justify-center gap-0.5 py-2
									min-h-[44px] min-w-[44px]
									transition-colors duration-150
									${active
										? 'text-[var(--color-primary)]'
										: 'text-[var(--color-text-secondary)]'
									}
								`}
								aria-current={active ? 'page' : undefined}
							>
								<span className="flex-shrink-0">{item.icon}</span>
								<span className="text-[10px] font-medium truncate max-w-full">
									{item.label}
								</span>
							</NavLink>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}

export default BottomNav
