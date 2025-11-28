export interface IconDefinition {
	name: string
	category: string
	keywords: string[]
}

export const CATEGORY_ICONS: IconDefinition[] = [
	// Finance
	{ name: 'wallet', category: 'finance', keywords: ['money', 'cash', 'payment'] },
	{ name: 'credit-card', category: 'finance', keywords: ['payment', 'card', 'bank'] },
	{ name: 'bank', category: 'finance', keywords: ['money', 'savings', 'institution'] },
	{ name: 'receipt', category: 'finance', keywords: ['bill', 'invoice', 'purchase'] },
	{ name: 'coins', category: 'finance', keywords: ['money', 'change', 'cash'] },
	{ name: 'piggy-bank', category: 'finance', keywords: ['savings', 'money'] },
	{ name: 'chart-line', category: 'finance', keywords: ['investment', 'stocks', 'growth'] },
	{ name: 'dollar-sign', category: 'finance', keywords: ['money', 'currency', 'price'] },

	// Food & Drink
	{ name: 'utensils', category: 'food', keywords: ['food', 'restaurant', 'dining', 'eat'] },
	{ name: 'coffee', category: 'food', keywords: ['drink', 'cafe', 'beverage'] },
	{ name: 'pizza', category: 'food', keywords: ['food', 'fast-food', 'eat'] },
	{ name: 'apple', category: 'food', keywords: ['fruit', 'healthy', 'food'] },
	{ name: 'wine', category: 'food', keywords: ['drink', 'alcohol', 'beverage'] },

	// Transport
	{ name: 'car', category: 'transport', keywords: ['vehicle', 'auto', 'drive'] },
	{ name: 'bus', category: 'transport', keywords: ['public', 'transit', 'commute'] },
	{ name: 'plane', category: 'transport', keywords: ['travel', 'flight', 'airport'] },
	{ name: 'train', category: 'transport', keywords: ['rail', 'metro', 'subway'] },
	{ name: 'bike', category: 'transport', keywords: ['bicycle', 'cycling', 'exercise'] },
	{ name: 'gas-pump', category: 'transport', keywords: ['fuel', 'petrol', 'car'] },

	// Home
	{ name: 'home', category: 'home', keywords: ['house', 'residence', 'living'] },
	{ name: 'bed', category: 'home', keywords: ['sleep', 'bedroom', 'furniture'] },
	{ name: 'sofa', category: 'home', keywords: ['furniture', 'living-room', 'couch'] },
	{ name: 'lamp', category: 'home', keywords: ['light', 'furniture', 'home'] },
	{ name: 'wrench', category: 'home', keywords: ['repair', 'maintenance', 'tools'] },

	// Entertainment
	{ name: 'music', category: 'entertainment', keywords: ['audio', 'song', 'spotify'] },
	{ name: 'film', category: 'entertainment', keywords: ['movie', 'video', 'cinema'] },
	{ name: 'gamepad', category: 'entertainment', keywords: ['gaming', 'video-game', 'play'] },
	{ name: 'tv', category: 'entertainment', keywords: ['television', 'streaming', 'netflix'] },
	{ name: 'ticket', category: 'entertainment', keywords: ['event', 'concert', 'show'] },

	// Health
	{ name: 'heart', category: 'health', keywords: ['love', 'health', 'wellness'] },
	{ name: 'medical', category: 'health', keywords: ['hospital', 'doctor', 'healthcare'] },
	{ name: 'pill', category: 'health', keywords: ['medicine', 'pharmacy', 'drug'] },
	{ name: 'dumbbell', category: 'health', keywords: ['gym', 'fitness', 'exercise'] },

	// Education
	{ name: 'book', category: 'education', keywords: ['reading', 'study', 'learning'] },
	{ name: 'graduation-cap', category: 'education', keywords: ['school', 'university', 'degree'] },
	{ name: 'pencil', category: 'education', keywords: ['writing', 'study', 'notes'] },

	// Shopping
	{ name: 'shopping-bag', category: 'shopping', keywords: ['store', 'purchase', 'retail'] },
	{ name: 'shopping-cart', category: 'shopping', keywords: ['store', 'supermarket', 'grocery'] },
	{ name: 'tag', category: 'shopping', keywords: ['price', 'sale', 'discount'] },
	{ name: 'gift', category: 'shopping', keywords: ['present', 'birthday', 'holiday'] },
	{ name: 'percent', category: 'shopping', keywords: ['discount', 'sale', 'deal'] },

	// Utilities
	{ name: 'bolt', category: 'utilities', keywords: ['electricity', 'power', 'energy'] },
	{ name: 'wifi', category: 'utilities', keywords: ['internet', 'network', 'connection'] },
	{ name: 'phone', category: 'utilities', keywords: ['mobile', 'call', 'communication'] },
	{ name: 'droplet', category: 'utilities', keywords: ['water', 'utility', 'bill'] },
	{ name: 'flame', category: 'utilities', keywords: ['gas', 'heating', 'energy'] },

	// Other
	{ name: 'briefcase', category: 'other', keywords: ['work', 'business', 'job'] },
	{ name: 'globe', category: 'other', keywords: ['world', 'travel', 'international'] },
	{ name: 'star', category: 'other', keywords: ['favorite', 'important', 'special'] },
]

export const ICON_NAMES = CATEGORY_ICONS.map(icon => icon.name)
