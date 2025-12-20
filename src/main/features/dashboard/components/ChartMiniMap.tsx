import { useCallback, useRef, useState, useEffect } from 'react'

interface ChartMiniMapProps {
	startDate: Date
	endDate: Date
	viewportStart: number
	viewportEnd: number
	onViewportChange: (start: number) => void
}

export function ChartMiniMap({
	startDate,
	endDate,
	viewportStart,
	viewportEnd,
	onViewportChange,
}: ChartMiniMapProps) {
	const trackRef = useRef<HTMLDivElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const dragStartRef = useRef<{ x: number; viewportStart: number }>({
		x: 0,
		viewportStart: 0,
	})

	const viewportWidth = viewportEnd - viewportStart
	const thumbLeft = `${viewportStart * 100}%`
	const thumbWidth = `${Math.max(viewportWidth * 100, 5)}%`

	const formatDate = (date: Date) => {
		const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date)
		const year = date.getFullYear()
		const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).replace('.', '')
		return `${capitalizedMonth} ${year}`
	}

	const handleMouseDown = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault()
			setIsDragging(true)
			dragStartRef.current = {
				x: event.clientX,
				viewportStart,
			}
		},
		[viewportStart]
	)

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!isDragging || !trackRef.current) return

			const trackRect = trackRef.current.getBoundingClientRect()
			const deltaX = event.clientX - dragStartRef.current.x
			const deltaPercent = deltaX / trackRect.width

			let newStart = dragStartRef.current.viewportStart + deltaPercent
			newStart = Math.max(0, Math.min(1 - viewportWidth, newStart))

			onViewportChange(newStart)
		},
		[isDragging, viewportWidth, onViewportChange]
	)

	const handleMouseUp = useCallback(() => {
		setIsDragging(false)
	}, [])

	const handleTrackClick = useCallback(
		(event: React.MouseEvent) => {
			if (!trackRef.current) return

			const trackRect = trackRef.current.getBoundingClientRect()
			const clickPercent = (event.clientX - trackRect.left) / trackRect.width
			const halfViewport = viewportWidth / 2

			let newStart = clickPercent - halfViewport
			newStart = Math.max(0, Math.min(1 - viewportWidth, newStart))

			onViewportChange(newStart)
		},
		[viewportWidth, onViewportChange]
	)

	useEffect(() => {
		if (isDragging) {
			window.addEventListener('mousemove', handleMouseMove)
			window.addEventListener('mouseup', handleMouseUp)
			return () => {
				window.removeEventListener('mousemove', handleMouseMove)
				window.removeEventListener('mouseup', handleMouseUp)
			}
		}
	}, [isDragging, handleMouseMove, handleMouseUp])

	return (
		<div
			data-testid="chart-minimap"
			className="flex items-center gap-3 py-2"
			role="slider"
			aria-label="Posição do gráfico na linha do tempo"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(viewportStart * 100)}
		>
			<span
				data-testid="minimap-start-date"
				className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap min-w-[70px]"
			>
				{formatDate(startDate)}
			</span>

			<div
				ref={trackRef}
				data-testid="chart-minimap-track"
				onClick={handleTrackClick}
				className="relative flex-1 h-2 bg-[var(--color-background-secondary)] rounded-full cursor-pointer"
			>
				<div
					data-testid="chart-minimap-thumb"
					onMouseDown={handleMouseDown}
					style={{
						left: thumbLeft,
						width: thumbWidth,
					}}
					className={`
						absolute top-0 h-full rounded-full transition-colors
						${isDragging
							? 'bg-[var(--color-primary)]'
							: 'bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)]'
						}
						cursor-grab active:cursor-grabbing
					`}
				/>
			</div>

			<span
				data-testid="minimap-end-date"
				className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap min-w-[70px] text-right"
			>
				{formatDate(endDate)}
			</span>
		</div>
	)
}
