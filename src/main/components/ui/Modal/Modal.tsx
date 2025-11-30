import {
	type ReactNode,
	type HTMLAttributes,
	useEffect,
	useRef,
	useCallback,
} from 'react'
import { createPortal } from 'react-dom'

export type ModalSize = 'sm' | 'md' | 'lg' | 'full'

export interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title?: string
	size?: ModalSize
	children: ReactNode
	footer?: ReactNode
	closeOnEscape?: boolean
	closeOnOutsideClick?: boolean
	showCloseButton?: boolean
	'data-testid'?: string
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
	onClose?: () => void
	showCloseButton?: boolean
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

const sizeClasses: Record<ModalSize, string> = {
	sm: 'max-w-[400px]',
	md: 'max-w-[560px]',
	lg: 'max-w-[720px]',
	full: 'max-w-[1200px] w-[90vw]',
}

function CloseIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M15 5L5 15M5 5L15 15"
				stroke="currentColor"
				strokeWidth="1.67"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export function Modal({
	isOpen,
	onClose,
	title,
	size = 'md',
	children,
	footer,
	closeOnEscape = true,
	closeOnOutsideClick = true,
	showCloseButton = true,
	'data-testid': dataTestId = 'modal',
}: ModalProps) {
	const modalRef = useRef<HTMLDivElement>(null)
	const previousActiveElement = useRef<HTMLElement | null>(null)

	const handleEscapeKey = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Escape' && closeOnEscape) {
				onClose()
			}
		},
		[closeOnEscape, onClose]
	)

	const handleBackdropClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (event.target === event.currentTarget && closeOnOutsideClick) {
				onClose()
			}
		},
		[closeOnOutsideClick, onClose]
	)

	// Focus trap
	const handleTabKey = useCallback((event: KeyboardEvent) => {
		if (event.key !== 'Tab' || !modalRef.current) return

		const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		)

		const firstElement = focusableElements[0]
		const lastElement = focusableElements[focusableElements.length - 1]

		if (event.shiftKey && document.activeElement === firstElement) {
			event.preventDefault()
			lastElement?.focus()
		} else if (!event.shiftKey && document.activeElement === lastElement) {
			event.preventDefault()
			firstElement?.focus()
		}
	}, [])

	useEffect(() => {
		if (isOpen) {
			// Save current focus
			previousActiveElement.current = document.activeElement as HTMLElement

			// Add event listeners
			document.addEventListener('keydown', handleEscapeKey)
			document.addEventListener('keydown', handleTabKey)

			// Prevent body scroll
			document.body.style.overflow = 'hidden'

			// Focus first focusable element
			const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
			focusableElements?.[0]?.focus()

			return () => {
				document.removeEventListener('keydown', handleEscapeKey)
				document.removeEventListener('keydown', handleTabKey)
				document.body.style.overflow = ''

				// Restore focus
				previousActiveElement.current?.focus()
			}
		}
	}, [isOpen, handleEscapeKey, handleTabKey])

	if (!isOpen) return null

	const modalContent = (
		<div
			className="fixed inset-0 z-[500] flex items-center justify-center p-4"
			data-testid={dataTestId}
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? 'modal-title' : undefined}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 animate-in fade-in duration-300"
				data-testid="modal-backdrop"
				onClick={handleBackdropClick}
				aria-hidden="true"
			/>

			{/* Modal Content */}
			<div
				ref={modalRef}
				className={`
					relative z-[510] w-full bg-[var(--color-surface-elevated)]
					rounded-[12px] shadow-xl
					max-h-[90vh] flex flex-col
					animate-in zoom-in-95 fade-in duration-300
					${sizeClasses[size]}
				`.replace(/\s+/g, ' ').trim()}
				data-testid="modal-content"
			>
				{/* Header */}
				{(title || showCloseButton) && (
					<ModalHeader onClose={onClose} showCloseButton={showCloseButton}>
						{title && (
							<h2
								id="modal-title"
								className="text-[20px] font-semibold text-[var(--color-text)]"
								data-testid="modal-title"
							>
								{title}
							</h2>
						)}
					</ModalHeader>
				)}

				{/* Body */}
				<ModalBody>{children}</ModalBody>

				{/* Footer */}
				{footer && <ModalFooter>{footer}</ModalFooter>}
			</div>
		</div>
	)

	return createPortal(modalContent, document.body)
}

export function ModalHeader({
	children,
	className = '',
	onClose,
	showCloseButton = true,
	...props
}: ModalHeaderProps) {
	return (
		<div
			className={`
				flex items-center justify-between
				p-6 pb-4 border-b border-[var(--color-border)]
				${className}
			`.replace(/\s+/g, ' ').trim()}
			data-testid="modal-header"
			{...props}
		>
			<div className="flex-1">{children}</div>
			{showCloseButton && onClose && (
				<button
					type="button"
					onClick={onClose}
					className={`
						w-8 h-8 flex items-center justify-center
						text-[var(--color-text-muted)]
						hover:text-[var(--color-text-secondary)]
						hover:bg-[var(--color-border)]
						rounded-[var(--radius-md)]
						transition-colors duration-150
						focus-visible:outline focus-visible:outline-2
						focus-visible:outline-[var(--color-primary)]
					`.replace(/\s+/g, ' ').trim()}
					data-testid="modal-close-btn"
					aria-label="Close modal"
				>
					<CloseIcon />
				</button>
			)}
		</div>
	)
}

export function ModalBody({
	children,
	className = '',
	...props
}: ModalBodyProps) {
	return (
		<div
			className={`
				p-6 flex-1 overflow-y-auto
				${className}
			`.replace(/\s+/g, ' ').trim()}
			data-testid="modal-body"
			{...props}
		>
			{children}
		</div>
	)
}

export function ModalFooter({
	children,
	className = '',
	...props
}: ModalFooterProps) {
	return (
		<div
			className={`
				p-6 pt-4 border-t border-[var(--color-border)]
				flex items-center justify-end gap-4
				${className}
			`.replace(/\s+/g, ' ').trim()}
			data-testid="modal-footer"
			{...props}
		>
			{children}
		</div>
	)
}

export default Modal
