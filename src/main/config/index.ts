// Application configuration

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    timeout: 30000,
  },
  app: {
    name: 'Finance Tracker',
    version: '0.1.0',
    locale: 'pt-BR',
    currency: 'BRL',
  },
} as const

export type Config = typeof config
