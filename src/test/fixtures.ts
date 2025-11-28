import { test as base } from '@playwright/test'

export const test = base.extend({
	page: async ({ page, baseURL }, use) => {
		// Override the goto method to always use absolute URLs
		const originalGoto = page.goto.bind(page)
		page.goto = async (url: string | URL, options?: any) => {
			if (typeof url === 'string' && url.startsWith('/')) {
				url = `http://localhost:3000${url}`
			}
			return originalGoto(url, options)
		}
		await use(page)
	},
})

export { expect } from '@playwright/test'
