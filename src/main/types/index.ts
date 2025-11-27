// Global TypeScript types and interfaces
// Add shared types here as they are created

export type Nullable<T> = T | null

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
