import { useState, useEffect } from 'react'

function WifiOffIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<line x1="2" y1="2" x2="22" y2="22" />
			<path d="M8.5 16.5a5 5 0 0 1 7 0" />
			<path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
			<path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
			<path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
			<path d="M5 13a10 10 0 0 1 5.24-2.76" />
			<line x1="12" y1="20" x2="12.01" y2="20" />
		</svg>
	)
}

export function OfflineBanner() {
	const [isOffline, setIsOffline] = useState(!navigator.onLine)

	useEffect(() => {
		const handleOnline = () => setIsOffline(false)
		const handleOffline = () => setIsOffline(true)

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
		}
	}, [])

	if (!isOffline) {
		return null
	}

	return (
		<div
			data-testid="offline-banner"
			role="alert"
			className="
				fixed top-0 left-0 right-0 z-[110]
				flex items-center justify-center gap-2
				py-2 px-4
				bg-yellow-500 text-yellow-900
				font-medium text-sm
			"
		>
			<WifiOffIcon />
			<span>Voce esta offline. Algumas funcoes podem nao estar disponiveis.</span>
		</div>
	)
}

export default OfflineBanner
