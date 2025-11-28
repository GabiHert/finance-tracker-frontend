import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { OfflineBanner } from './OfflineBanner'

interface AppLayoutProps {
	children: ReactNode
}

function SkipToContent() {
	return (
		<a
			href="#main-content"
			data-testid="skip-to-content"
			className="
				sr-only focus:not-sr-only
				focus:fixed focus:top-4 focus:left-4 focus:z-[200]
				focus:px-4 focus:py-2
				focus:bg-[var(--color-primary)] focus:text-white
				focus:rounded-lg focus:shadow-lg
				focus:outline-none
			"
		>
			Pular para o conteudo principal
		</a>
	)
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<div className="min-h-screen bg-[var(--color-background)]">
			<SkipToContent />
			<OfflineBanner />

			{/* Desktop Sidebar */}
			<Sidebar />

			{/* Main Content Area */}
			<main
				id="main-content"
				data-testid="main-content"
				tabIndex={-1}
				className="
					md:ml-[260px]
					pb-20 md:pb-6
					transition-all duration-300
					focus:outline-none
				"
			>
				{children}
			</main>

			{/* Mobile Bottom Navigation */}
			<BottomNav />
		</div>
	)
}

export default AppLayout
