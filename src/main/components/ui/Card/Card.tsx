import { type HTMLAttributes, type ReactNode, type KeyboardEvent } from 'react'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'
export type CardShadow = 'none' | 'sm' | 'md' | 'lg'
export type CardVariant = 'default' | 'clickable'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
	children: ReactNode
	variant?: CardVariant
	onClick?: () => void
	padding?: CardPadding
	shadow?: CardShadow
	'data-testid'?: string
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

const paddingClasses: Record<CardPadding, string> = {
	none: 'p-0',
	sm: 'p-3 md:p-4',
	md: 'p-4 md:p-6',
	lg: 'p-6 md:p-8',
}

const shadowClasses: Record<CardShadow, string> = {
	none: 'shadow-none',
	sm: 'shadow-sm',
	md: 'shadow-md',
	lg: 'shadow-lg',
}

export function Card({
	children,
	className = '',
	variant = 'default',
	onClick,
	padding = 'md',
	shadow = 'sm',
	'data-testid': dataTestId,
	...props
}: CardProps) {
	const isClickable = variant === 'clickable' && onClick

	const baseClasses = `
		bg-white
		border border-[var(--color-neutral-200)]
		rounded-[8px]
		transition-all duration-[var(--transition-default)]
	`

	const clickableClasses = isClickable
		? `
			cursor-pointer
			hover:shadow-md hover:-translate-y-0.5
			focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
			focus-visible:outline-[var(--color-primary)]
			active:shadow-sm active:translate-y-0
		`
		: ''

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault()
			onClick()
		}
	}

	return (
		<div
			className={`
				${baseClasses}
				${paddingClasses[padding]}
				${shadowClasses[shadow]}
				${clickableClasses}
				${className}
			`.replace(/\s+/g, ' ').trim()}
			onClick={isClickable ? onClick : undefined}
			onKeyDown={isClickable ? handleKeyDown : undefined}
			role={isClickable ? 'button' : undefined}
			tabIndex={isClickable ? 0 : undefined}
			data-testid={dataTestId}
			{...props}
		>
			{children}
		</div>
	)
}

export function CardHeader({
	children,
	className = '',
	...props
}: CardHeaderProps) {
	return (
		<div
			className={`
				pb-4 mb-4
				border-b border-[var(--color-neutral-200)]
				font-semibold text-[var(--color-text)]
				${className}
			`.replace(/\s+/g, ' ').trim()}
			{...props}
		>
			{children}
		</div>
	)
}

export function CardBody({
	children,
	className = '',
	...props
}: CardBodyProps) {
	return (
		<div
			className={`
				text-[var(--color-text-secondary)]
				${className}
			`.replace(/\s+/g, ' ').trim()}
			{...props}
		>
			{children}
		</div>
	)
}

export function CardFooter({
	children,
	className = '',
	...props
}: CardFooterProps) {
	return (
		<div
			className={`
				pt-4 mt-4
				border-t border-[var(--color-neutral-200)]
				${className}
			`.replace(/\s+/g, ' ').trim()}
			{...props}
		>
			{children}
		</div>
	)
}

export default Card
