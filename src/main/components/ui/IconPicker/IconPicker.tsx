import { useState, useMemo, useCallback } from 'react'
import { CATEGORY_ICONS } from './icons'

export interface IconPickerProps {
	value: string
	onChange: (icon: string) => void
	color?: string
	searchable?: boolean
	'data-testid'?: string
}

// Simple SVG icons - in a real app, you'd use a proper icon library
const IconSvgs: Record<string, React.FC<{ className?: string }>> = {
	wallet: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
			<path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
			<path d="M18 12a2 2 0 1 0 0 4h4v-4h-4Z" />
		</svg>
	),
	'credit-card': ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect width="20" height="14" x="2" y="5" rx="2" />
			<line x1="2" x2="22" y1="10" y2="10" />
		</svg>
	),
	bank: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M3 21h18" />
			<path d="M3 10h18" />
			<path d="M5 6l7-3 7 3" />
			<path d="M4 10v11" />
			<path d="M20 10v11" />
			<path d="M8 10v11" />
			<path d="M12 10v11" />
			<path d="M16 10v11" />
		</svg>
	),
	receipt: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
			<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
			<path d="M12 17.5v-11" />
		</svg>
	),
	coins: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="8" cy="8" r="6" />
			<path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
			<path d="M7 6h1v4" />
			<path d="m16.71 13.88.7.71-2.82 2.82" />
		</svg>
	),
	'piggy-bank': ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5Z" />
			<path d="M2 9v1c0 1.1.9 2 2 2h1" />
			<path d="M16 11h.01" />
		</svg>
	),
	'chart-line': ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M3 3v18h18" />
			<path d="m19 9-5 5-4-4-3 3" />
		</svg>
	),
	'dollar-sign': ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<line x1="12" x2="12" y1="2" y2="22" />
			<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
		</svg>
	),
	utensils: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
			<path d="M7 2v20" />
			<path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
		</svg>
	),
	coffee: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M17 8h1a4 4 0 1 1 0 8h-1" />
			<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
			<line x1="6" x2="6" y1="2" y2="4" />
			<line x1="10" x2="10" y1="2" y2="4" />
			<line x1="14" x2="14" y1="2" y2="4" />
		</svg>
	),
	pizza: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M15 11h.01" />
			<path d="M11 15h.01" />
			<path d="M16 16h.01" />
			<path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
			<path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
		</svg>
	),
	apple: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
			<path d="M10 2c1 .5 2 2 2 5" />
		</svg>
	),
	wine: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M8 22h8" />
			<path d="M7 10h10" />
			<path d="M12 15v7" />
			<path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
		</svg>
	),
	car: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
			<circle cx="7" cy="17" r="2" />
			<path d="M9 17h6" />
			<circle cx="17" cy="17" r="2" />
		</svg>
	),
	bus: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M8 6v6" />
			<path d="M15 6v6" />
			<path d="M2 12h19.6" />
			<path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
			<circle cx="7" cy="18" r="2" />
			<path d="M9 18h5" />
			<circle cx="16" cy="18" r="2" />
		</svg>
	),
	plane: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z" />
		</svg>
	),
	train: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect width="16" height="16" x="4" y="3" rx="2" />
			<path d="M4 11h16" />
			<path d="M12 3v8" />
			<path d="m8 19-2 3" />
			<path d="m18 22-2-3" />
			<path d="M8 15h.01" />
			<path d="M16 15h.01" />
		</svg>
	),
	bike: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="18.5" cy="17.5" r="3.5" />
			<circle cx="5.5" cy="17.5" r="3.5" />
			<circle cx="15" cy="5" r="1" />
			<path d="M12 17.5V14l-3-3 4-3 2 3h2" />
		</svg>
	),
	'gas-pump': ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M3 22V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v17" />
			<path d="M3 22h14" />
			<path d="M5 12h10" />
			<path d="M17 12h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V9l-3-3" />
		</svg>
	),
	home: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
			<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
		</svg>
	),
	bed: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M2 4v16" />
			<path d="M2 8h18a2 2 0 0 1 2 2v10" />
			<path d="M2 17h20" />
			<path d="M6 8v9" />
		</svg>
	),
	sofa: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
			<path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
			<path d="M4 18v2" />
			<path d="M20 18v2" />
			<path d="M12 4v9" />
		</svg>
	),
	lamp: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M8 2h8l4 10H4L8 2Z" />
			<path d="M12 12v6" />
			<path d="M8 22v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2H8Z" />
		</svg>
	),
	wrench: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
		</svg>
	),
	music: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M9 18V5l12-2v13" />
			<circle cx="6" cy="18" r="3" />
			<circle cx="18" cy="16" r="3" />
		</svg>
	),
	film: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect width="18" height="18" x="3" y="3" rx="2" />
			<path d="M7 3v18" />
			<path d="M3 7.5h4" />
			<path d="M3 12h18" />
			<path d="M3 16.5h4" />
			<path d="M17 3v18" />
			<path d="M17 7.5h4" />
			<path d="M17 16.5h4" />
		</svg>
	),
	gamepad: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<line x1="6" x2="10" y1="11" y2="11" />
			<line x1="8" x2="8" y1="9" y2="13" />
			<line x1="15" x2="15.01" y1="12" y2="12" />
			<line x1="18" x2="18.01" y1="10" y2="10" />
			<path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" />
		</svg>
	),
	tv: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
			<polyline points="17 2 12 7 7 2" />
		</svg>
	),
	ticket: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
			<path d="M13 5v2" />
			<path d="M13 17v2" />
			<path d="M13 11v2" />
		</svg>
	),
	heart: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
		</svg>
	),
	medical: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3" />
			<path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3" />
			<line x1="12" x2="12" y1="4" y2="20" />
			<line x1="8" x2="16" y1="12" y2="12" />
		</svg>
	),
	pill: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
			<path d="m8.5 8.5 7 7" />
		</svg>
	),
	dumbbell: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M14.4 14.4 9.6 9.6" />
			<path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829Z" />
			<path d="m21.5 21.5-1.4-1.4" />
			<path d="M3.9 3.9 2.5 2.5" />
			<path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829Z" />
		</svg>
	),
	book: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
		</svg>
	),
	'graduation-cap': ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M22 10v6M2 10l10-5 10 5-10 5z" />
			<path d="M6 12v5c3 3 9 3 12 0v-5" />
		</svg>
	),
	pencil: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
			<path d="m15 5 4 4" />
		</svg>
	),
	'shopping-bag': ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
			<path d="M3 6h18" />
			<path d="M16 10a4 4 0 0 1-8 0" />
		</svg>
	),
	'shopping-cart': ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="8" cy="21" r="1" />
			<circle cx="19" cy="21" r="1" />
			<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
		</svg>
	),
	tag: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
			<path d="M7 7h.01" />
		</svg>
	),
	gift: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect x="3" y="8" width="18" height="4" rx="1" />
			<path d="M12 8v13" />
			<path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
			<path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
		</svg>
	),
	percent: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<line x1="19" x2="5" y1="5" y2="19" />
			<circle cx="6.5" cy="6.5" r="2.5" />
			<circle cx="17.5" cy="17.5" r="2.5" />
		</svg>
	),
	bolt: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
		</svg>
	),
	wifi: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M5 12.55a11 11 0 0 1 14.08 0" />
			<path d="M1.42 9a16 16 0 0 1 21.16 0" />
			<path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
			<line x1="12" x2="12.01" y1="20" y2="20" />
		</svg>
	),
	phone: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
			<path d="M12 18h.01" />
		</svg>
	),
	droplet: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />
		</svg>
	),
	flame: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
		</svg>
	),
	briefcase: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
			<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
		</svg>
	),
	globe: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="12" cy="12" r="10" />
			<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
			<path d="M2 12h20" />
		</svg>
	),
	star: ({ className }) => (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
		</svg>
	),
}

// Default icon for unknown names
const DefaultIcon = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<circle cx="12" cy="12" r="10" />
		<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
		<path d="M12 17h.01" />
	</svg>
)

export function getIconComponent(name: string): React.FC<{ className?: string }> {
	return IconSvgs[name] || DefaultIcon
}

export function IconPicker({
	value,
	onChange,
	color = 'var(--color-text-secondary)',
	searchable = true,
	'data-testid': dataTestId = 'icon-picker',
}: IconPickerProps) {
	const [searchQuery, setSearchQuery] = useState('')

	const filteredIcons = useMemo(() => {
		if (!searchQuery) return CATEGORY_ICONS
		const query = searchQuery.toLowerCase()
		return CATEGORY_ICONS.filter(
			icon =>
				icon.name.toLowerCase().includes(query) ||
				icon.category.toLowerCase().includes(query) ||
				icon.keywords.some(kw => kw.toLowerCase().includes(query))
		)
	}, [searchQuery])

	const handleSelect = useCallback(
		(iconName: string) => {
			onChange(iconName)
		},
		[onChange]
	)

	return (
		<div data-testid={dataTestId} className="w-full">
			{/* Search */}
			{searchable && (
				<div className="mb-4">
					<input
						type="text"
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						placeholder="Search icons..."
						className={`
							w-full h-10 px-3
							border border-[var(--color-border)] rounded-[var(--radius-md)]
							text-sm bg-[var(--color-surface-elevated)] text-[var(--color-text)]
							focus:outline-none focus:border-[var(--color-primary)]
						`.replace(/\s+/g, ' ').trim()}
						data-testid="icon-search"
					/>
				</div>
			)}

			{/* Icon Grid */}
			<div className="grid grid-cols-6 gap-2 max-h-[280px] overflow-y-auto">
				{filteredIcons.map(icon => {
					const IconComponent = getIconComponent(icon.name)
					const isSelected = value === icon.name

					return (
						<button
							key={icon.name}
							type="button"
							onClick={() => handleSelect(icon.name)}
							title={icon.name}
							data-testid={`icon-${icon.name}`}
							className={`
								w-10 h-10 flex items-center justify-center
								rounded-[var(--radius-md)]
								transition-all duration-150
								focus-visible:outline focus-visible:outline-2
								focus-visible:outline-[var(--color-primary)]
								${isSelected
									? 'bg-[var(--color-primary-50)] border-2 border-[var(--color-primary)] selected'
									: 'hover:bg-[var(--color-surface)]'
								}
								icon-option
							`.replace(/\s+/g, ' ').trim()}
							data-icon={icon.name}
						>
							<IconComponent
								className={`
									w-6 h-6
									${isSelected ? 'text-[var(--color-primary-600)]' : ''}
								`.replace(/\s+/g, ' ').trim()}
								style={{ color: isSelected ? undefined : color }}
							/>
						</button>
					)
				})}
			</div>

			{filteredIcons.length === 0 && (
				<div className="py-4 text-center text-sm text-[var(--color-text-muted)]">
					No icons found
				</div>
			)}
		</div>
	)
}

export default IconPicker
