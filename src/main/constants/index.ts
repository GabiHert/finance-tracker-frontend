// Global constants and enums

export const CURRENCY = 'BRL' as const
export const LOCALE = 'pt-BR' as const

export const DATE_FORMATS = {
  short: 'dd/MM/yyyy',
  long: "dd 'de' MMMM 'de' yyyy",
  time: 'HH:mm',
  full: "dd/MM/yyyy 'as' HH:mm",
} as const

export const STORAGE_KEYS = {
  accessToken: 'ft_access_token',
  refreshToken: 'ft_refresh_token',
  theme: 'ft_theme',
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const
