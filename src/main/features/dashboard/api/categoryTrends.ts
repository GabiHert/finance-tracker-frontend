import { API_BASE, apiGet } from '@main/lib/api-client'
import type { CategoryTrendsData, Granularity } from '../types'

export interface FetchCategoryTrendsParams {
	startDate: string // YYYY-MM-DD
	endDate: string // YYYY-MM-DD
	granularity: Granularity
	topCategories?: number
}

// API response types (snake_case from backend)
interface ApiCategoryInfo {
	id: string
	name: string
	color: string
	total_amount: number
	is_others: boolean
}

interface ApiCategoryAmount {
	category_id: string
	amount: number
}

interface ApiTrendDataPoint {
	date: string
	period_label: string
	amounts: ApiCategoryAmount[]
}

interface ApiCategoryTrendsResponse {
	data: {
		period: {
			start_date: string
			end_date: string
			granularity: Granularity
		}
		categories: ApiCategoryInfo[]
		trends: ApiTrendDataPoint[]
	}
}

/**
 * Transform API response (snake_case) to frontend model (camelCase)
 */
function transformResponse(response: ApiCategoryTrendsResponse): CategoryTrendsData {
	return {
		period: {
			startDate: response.data.period.start_date,
			endDate: response.data.period.end_date,
			granularity: response.data.period.granularity,
		},
		categories: response.data.categories.map((cat) => ({
			id: cat.id,
			name: cat.name,
			color: cat.color,
			totalAmount: cat.total_amount,
			isOthers: cat.is_others,
		})),
		trends: response.data.trends.map((point) => ({
			date: point.date,
			periodLabel: point.period_label,
			amounts: point.amounts.map((a) => ({
				categoryId: a.category_id,
				amount: a.amount,
			})),
		})),
	}
}

/**
 * Fetch category expense trends from the API
 */
export async function fetchCategoryTrends(params: FetchCategoryTrendsParams): Promise<CategoryTrendsData> {
	const queryParams = new URLSearchParams({
		start_date: params.startDate,
		end_date: params.endDate,
		granularity: params.granularity,
	})

	if (params.topCategories) {
		queryParams.set('top_categories', String(params.topCategories))
	}

	const url = `${API_BASE}/dashboard/category-trends?${queryParams.toString()}`
	const response = await apiGet<ApiCategoryTrendsResponse>(url)
	return transformResponse(response)
}
