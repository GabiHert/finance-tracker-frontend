import { type ButtonHTMLAttributes, type ReactNode } from 'react'

export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'tertiary'
	| 'danger'
	| 'danger-outline'
	| 'success'
	| 'link'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	isLoading?: boolean
	isDisabled?: boolean
	leftIcon?: ReactNode
	rightIcon?: ReactNode
	fullWidth?: boolean
	children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
	primary: `
		bg-[var(--color-primary)] text-white
		hover:bg-[var(--color-primary-600)]
		active:bg-[var(--color-primary-700)]
	`,
	secondary: `
		bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]
		hover:bg-[var(--color-border)]
		active:bg-[var(--color-border-strong)]
		border border-[var(--color-border)]
	`,
	tertiary: `
		bg-transparent text-[var(--color-primary)]
		hover:bg-[var(--color-primary-50)]
		active:bg-[var(--color-primary-100)]
	`,
	danger: `
		bg-[var(--color-error)] text-white
		hover:bg-[var(--color-error-600)]
		active:bg-[var(--color-error-600)]
	`,
	'danger-outline': `
		bg-transparent text-[var(--color-error)]
		border-2 border-[var(--color-error)]
		hover:bg-[var(--color-error-50)]
		active:bg-[var(--color-error-100)]
	`,
	success: `
		bg-[var(--color-success)] text-white
		hover:bg-[var(--color-success-600)]
		active:bg-[var(--color-success-600)]
	`,
	link: `
		bg-transparent text-[var(--color-primary)]
		hover:underline
		active:text-[var(--color-primary-700)]
		p-0 h-auto min-h-0
	`,
}

const sizeClasses: Record<ButtonSize, string> = {
	xs: 'h-7 px-2 text-xs min-w-[44px]',
	sm: 'h-8 px-3 text-sm min-w-[44px]',
	md: 'h-10 px-4 text-sm min-w-[44px]',
	lg: 'h-12 px-5 text-base min-w-[44px]',
	xl: 'h-14 px-6 text-lg min-w-[44px]',
}

function LoadingSpinner() {
	return (
		<svg
			data-testid="loading-spinner"
			className="animate-spin h-4 w-4"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	)
}

export function Button({
	variant = 'primary',
	size = 'md',
	isLoading = false,
	isDisabled = false,
	leftIcon,
	rightIcon,
	fullWidth = false,
	children,
	className = '',
	type = 'button',
	...props
}: ButtonProps) {
	const disabled = isDisabled || isLoading

	const baseClasses = `
		inline-flex items-center justify-center gap-2
		font-medium rounded-[var(--radius-md)]
		transition-all duration-[150ms] ease-out
		focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
		focus-visible:outline-[var(--color-primary)]
		disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--color-border)]
	`

	return (
		<button
			type={type}
			disabled={disabled}
			className={`
				${baseClasses}
				${variantClasses[variant]}
				${sizeClasses[size]}
				${fullWidth ? 'w-full' : ''}
				${className}
			`.replace(/\s+/g, ' ').trim()}
			aria-busy={isLoading}
			{...props}
		>
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					{leftIcon && (
						<span data-testid="left-icon" className="flex-shrink-0">
							{leftIcon}
						</span>
					)}
					{children}
					{rightIcon && (
						<span data-testid="right-icon" className="flex-shrink-0">
							{rightIcon}
						</span>
					)}
				</>
			)}
		</button>
	)
}

export default Button
