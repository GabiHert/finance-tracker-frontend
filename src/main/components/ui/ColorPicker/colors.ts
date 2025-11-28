export interface ColorDefinition {
	name: string
	hex: string
	label: string
}

export const PRESET_COLORS: ColorDefinition[] = [
	{ name: 'red', hex: '#EF4444', label: 'Red' },
	{ name: 'orange', hex: '#F97316', label: 'Orange' },
	{ name: 'amber', hex: '#F59E0B', label: 'Amber' },
	{ name: 'yellow', hex: '#EAB308', label: 'Yellow' },
	{ name: 'lime', hex: '#84CC16', label: 'Lime' },
	{ name: 'green', hex: '#22C55E', label: 'Green' },
	{ name: 'emerald', hex: '#10B981', label: 'Emerald' },
	{ name: 'teal', hex: '#14B8A6', label: 'Teal' },
	{ name: 'cyan', hex: '#06B6D4', label: 'Cyan' },
	{ name: 'blue', hex: '#3B82F6', label: 'Blue' },
	{ name: 'indigo', hex: '#6366F1', label: 'Indigo' },
	{ name: 'purple', hex: '#A855F7', label: 'Purple' },
	{ name: 'pink', hex: '#EC4899', label: 'Pink' },
	{ name: 'rose', hex: '#F43F5E', label: 'Rose' },
	{ name: 'gray', hex: '#6B7280', label: 'Gray' },
	{ name: 'slate', hex: '#64748B', label: 'Slate' },
]

export const COLOR_NAMES = PRESET_COLORS.map(c => c.name)

export function isValidHex(hex: string): boolean {
	return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

export function normalizeHex(hex: string): string {
	let value = hex.trim()
	if (!value.startsWith('#')) {
		value = '#' + value
	}
	return value.toUpperCase()
}
