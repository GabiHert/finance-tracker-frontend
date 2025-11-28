import { type InputHTMLAttributes, type ReactNode, useState, useId } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
	label?: string
	error?: string
	leftIcon?: ReactNode
	rightIcon?: ReactNode
	showPasswordToggle?: boolean
	onChange?: (value: string) => void
}

function EyeIcon({ open }: { open: boolean }) {
	if (open) {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="h-5 w-5"
				aria-hidden="true"
			>
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
		)
	}
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-5 w-5"
			aria-hidden="true"
		>
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
			<line x1="1" y1="1" x2="23" y2="23" />
		</svg>
	)
}

export function Input({
	label,
	error,
	leftIcon,
	rightIcon,
	showPasswordToggle = false,
	type = 'text',
	className = '',
	id: providedId,
	onChange,
	disabled,
	required,
	...props
}: InputProps) {
	const generatedId = useId()
	const id = providedId || generatedId
	const errorId = `${id}-error`
	const [showPassword, setShowPassword] = useState(false)

	const isPassword = type === 'password'
	const inputType = isPassword && showPassword ? 'text' : type

	const baseInputClasses = `
		w-full h-11 px-3 py-2
		text-base text-[var(--color-text-primary)]
		bg-[var(--color-background)]
		border border-[var(--color-border)]
		rounded-[var(--radius-md)]
		placeholder:text-[var(--color-text-muted)]
		transition-all duration-[var(--transition-fast)]
		focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
		disabled:bg-[var(--color-neutral-100)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed
	`

	const errorClasses = error
		? 'border-[var(--color-error)] border-2 bg-[var(--color-error-50)] focus:ring-[var(--color-error)]'
		: ''

	const iconPaddingLeft = leftIcon ? 'pl-10' : ''
	const iconPaddingRight = rightIcon || (isPassword && showPasswordToggle) ? 'pr-10' : ''

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.value)
	}

	return (
		<div className={`w-full ${className}`}>
			{label && (
				<label
					htmlFor={id}
					className="block mb-1.5 text-sm font-medium text-[var(--color-text-primary)]"
				>
					{label}
					{required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
				</label>
			)}

			<div className="relative">
				{leftIcon && (
					<div
						data-testid="input-left-icon"
						className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
					>
						{leftIcon}
					</div>
				)}

				<input
					id={id}
					type={inputType}
					disabled={disabled}
					required={required}
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={error ? errorId : undefined}
					className={`
						${baseInputClasses}
						${errorClasses}
						${iconPaddingLeft}
						${iconPaddingRight}
					`.replace(/\s+/g, ' ').trim()}
					onChange={handleChange}
					{...props}
				/>

				{isPassword && showPasswordToggle && (
					<button
						type="button"
						data-testid="password-toggle"
						onClick={() => setShowPassword(!showPassword)}
						className="
							absolute right-3 top-1/2 -translate-y-1/2
							text-[var(--color-text-muted)]
							hover:text-[var(--color-text-secondary)]
							focus:outline-none focus:text-[var(--color-primary)]
						"
						aria-label={showPassword ? 'Ocultar' : 'Exibir'}
					>
						<EyeIcon open={showPassword} />
					</button>
				)}

				{rightIcon && !showPasswordToggle && (
					<div
						data-testid="input-right-icon"
						className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
					>
						{rightIcon}
					</div>
				)}
			</div>

			{error && (
				<p
					id={errorId}
					data-testid="input-error-message"
					className="mt-1.5 text-sm text-[var(--color-error)]"
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	)
}

export default Input
