import { useState, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavItem {
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

function RulesIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
		</svg>
	)
}

function AiAssistantIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
			<circle cx="9" cy="13" r="1" fill="currentColor" />
			<circle cx="15" cy="13" r="1" fill="currentColor" />
			<path d="M9 17h6" />
		</svg>
	)
}

function GroupsIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function CollapseIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<path d="M11 17l-5-5 5-5" />
			<path d="M18 17l-5-5 5-5" />
		</svg>
	)
}

function ExpandIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<path d="M13 17l5-5-5-5" />
			<path d="M6 17l5-5-5-5" />
		</svg>
	)
}

function LogoIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
			<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
		</svg>
	)
}

const navItems: NavItem[] = [
	{ path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, testId: 'dashboard' },
	{ path: '/transactions', label: 'Transacoes', icon: <TransactionsIcon />, testId: 'transactions' },
	{ path: '/categories', label: 'Categorias', icon: <CategoriesIcon />, testId: 'categories' },
	{ path: '/rules', label: 'Regras', icon: <RulesIcon />, testId: 'rules' },
	{ path: '/ai', label: 'AI Assistant', icon: <AiAssistantIcon />, testId: 'ai-assistant' },
	{ path: '/goals', label: 'Metas', icon: <GoalsIcon />, testId: 'goals' },
	{ path: '/groups', label: 'Grupos', icon: <GroupsIcon />, testId: 'groups' },
	{ path: '/settings', label: 'Configuracoes', icon: <SettingsIcon />, testId: 'settings' },
]

export function Sidebar() {
	const [isCollapsed, setIsCollapsed] = useState(false)
	const location = useLocation()

	const toggleCollapse = useCallback(() => {
		setIsCollapsed((prev) => !prev)
	}, [])

	const isActive = (path: string) => {
		return location.pathname === path || location.pathname.startsWith(`${path}/`)
	}

	return (
		<aside
			data-testid="sidebar-nav"
			role="navigation"
			aria-label="Main navigation"
			className={`
				hidden md:flex flex-col
				h-screen fixed left-0 top-0
				bg-[var(--color-surface)] border-r border-[var(--color-border)]
				transition-all duration-300 ease-in-out z-40
				${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
			`}
		>
			{/* Logo Section */}
			<div className={`
				flex items-center h-16 px-4 border-b border-[var(--color-border)]
				${isCollapsed ? 'justify-center' : 'justify-start gap-3'}
			`}>
				<div className="text-[var(--color-primary)]">
					<LogoIcon />
				</div>
				{!isCollapsed && (
					<span className="font-bold text-lg text-[var(--color-text)]">
						Finance
					</span>
				)}
			</div>

			{/* Navigation Items */}
			<nav className="flex-1 py-4 overflow-y-auto">
				<ul className="space-y-1 px-2">
					{navItems.map((item) => (
						<li key={item.path}>
							<NavLink
								to={item.path}
								data-testid={`nav-item-${item.testId}`}
								className={`
									flex items-center gap-3 px-3 py-2.5 rounded-lg
									transition-colors duration-150
									${isActive(item.path)
										? 'bg-[var(--color-primary-50)] text-[var(--color-primary)]'
										: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]'
									}
									${isCollapsed ? 'justify-center' : ''}
								`}
								title={isCollapsed ? item.label : undefined}
							>
								<span className="flex-shrink-0">{item.icon}</span>
								{!isCollapsed && (
									<span
										data-testid={`nav-label-${item.testId}`}
										className="text-sm font-medium"
									>
										{item.label}
									</span>
								)}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			{/* Collapse Toggle */}
			<div className="p-4 border-t border-[var(--color-border)]">
				<button
					data-testid={isCollapsed ? 'sidebar-expand-btn' : 'sidebar-collapse-btn'}
					onClick={toggleCollapse}
					className={`
						flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
						text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]
						transition-colors duration-150
						${isCollapsed ? 'justify-center' : ''}
					`}
					aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				>
					{isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
					{!isCollapsed && (
						<span className="text-sm font-medium">Recolher</span>
					)}
				</button>
			</div>
		</aside>
	)
}

export default Sidebar
