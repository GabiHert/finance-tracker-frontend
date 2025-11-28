interface ProgressBarProps {
	progress: number
	isOverLimit: boolean
}

export function ProgressBar({ progress, isOverLimit }: ProgressBarProps) {
	const cappedProgress = Math.min(progress, 100)
	const barColor = isOverLimit
		? 'bg-red-500'
		: 'bg-green-500'

	return (
		<div
			data-testid="progress-bar"
			className="w-full h-3 bg-[var(--color-background)] rounded-full overflow-hidden"
		>
			<div
				data-testid="progress-bar-fill"
				className={`h-full rounded-full transition-all duration-300 ${barColor}`}
				style={{ width: `${cappedProgress}%` }}
			/>
		</div>
	)
}

export default ProgressBar
