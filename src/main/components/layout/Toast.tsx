import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
	id: string
	type: ToastType
	message: string
	duration?: number
}

interface ToastContextValue {
	toasts: Toast[]
	showToast: (type: ToastType, message: string, duration?: number) => void
	hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

function SuccessIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
			<polyline points="22,4 12,14.01 9,11.01" />
		</svg>
	)
}

function ErrorIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<circle cx="12" cy="12" r="10" />
			<line x1="15" y1="9" x2="9" y2="15" />
			<line x1="9" y1="9" x2="15" y2="15" />
		</svg>
	)
}

function WarningIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</svg>
	)
}

function InfoIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="16" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12.01" y2="8" />
		</svg>
	)
}

function CloseIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	)
}

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: ReactNode }> = {
	success: {
		bg: 'bg-green-50',
		border: 'border-green-200',
		text: 'text-green-800',
		icon: <SuccessIcon />,
	},
	error: {
		bg: 'bg-red-50',
		border: 'border-red-200',
		text: 'text-red-800',
		icon: <ErrorIcon />,
	},
	warning: {
		bg: 'bg-yellow-50',
		border: 'border-yellow-200',
		text: 'text-yellow-800',
		icon: <WarningIcon />,
	},
	info: {
		bg: 'bg-blue-50',
		border: 'border-blue-200',
		text: 'text-blue-800',
		icon: <InfoIcon />,
	},
}

interface ToastItemProps {
	toast: Toast
	onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
	const style = toastStyles[toast.type]

	return (
		<div
			data-testid={`toast-${toast.type}`}
			role="alert"
			className={`
				flex items-center gap-3 p-4 rounded-lg border shadow-lg
				${style.bg} ${style.border} ${style.text}
				animate-slide-in-right
			`}
		>
			<span className="flex-shrink-0">{style.icon}</span>
			<p className="flex-1 text-sm font-medium">{toast.message}</p>
			<button
				onClick={onClose}
				className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
				aria-label="Fechar notificacao"
			>
				<CloseIcon />
			</button>
		</div>
	)
}

interface ToastProviderProps {
	children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
		const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		const newToast: Toast = { id, type, message, duration }

		// Clear existing toasts of the same type to prevent stacking
		setToasts((prev) => [...prev.filter((t) => t.type !== type), newToast])

		if (duration > 0) {
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id))
			}, duration)
		}
	}, [])

	const hideToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id))
	}, [])

	return (
		<ToastContext.Provider value={{ toasts, showToast, hideToast }}>
			{children}
			<div
				data-testid="toast-container"
				className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
			>
				{toasts.map((toast) => (
					<ToastItem
						key={toast.id}
						toast={toast}
						onClose={() => hideToast(toast.id)}
					/>
				))}
			</div>
		</ToastContext.Provider>
	)
}

export function useToast() {
	const context = useContext(ToastContext)
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider')
	}
	return context
}

export default ToastProvider
