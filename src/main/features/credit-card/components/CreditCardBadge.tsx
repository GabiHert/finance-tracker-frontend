interface CreditCardBadgeProps {
	billingCycle?: string
	hasInstallment?: boolean
	installmentCurrent?: number
	installmentTotal?: number
	isExpanded?: boolean
	linkedCount?: number
}

export function CreditCardBadge({
	billingCycle,
	hasInstallment,
	installmentCurrent,
	installmentTotal,
	isExpanded,
	linkedCount,
}: CreditCardBadgeProps) {
	return (
		<div className="flex items-center gap-1.5 flex-wrap">
			{/* CC Badge */}
			{billingCycle && (
				<span
					data-testid="cc-badge"
					className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800"
				>
					<CreditCardIcon />
					{billingCycle}
				</span>
			)}

			{/* Installment Badge */}
			{hasInstallment && installmentCurrent && installmentTotal && (
				<span
					data-testid="installment-badge"
					className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
				>
					{installmentCurrent}/{installmentTotal}
				</span>
			)}

			{/* Expanded Bill Badge */}
			{isExpanded && (
				<span
					data-testid="expanded-badge"
					className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800"
				>
					<ExpandIcon />
					{linkedCount && linkedCount > 0 ? `${linkedCount} itens` : 'Expandido'}
				</span>
			)}
		</div>
	)
}

function CreditCardIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="20" height="14" x="2" y="5" rx="2" />
			<line x1="2" x2="22" y1="10" y2="10" />
		</svg>
	)
}

function ExpandIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m7 15 5-5 5 5" />
			<path d="m7 9 5 5 5-5" />
		</svg>
	)
}
