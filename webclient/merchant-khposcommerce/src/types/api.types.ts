/**
 * Global Enterprise API Contracts & Response Wrappers
 */

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from?: number
  to?: number
}

export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  data: T
  meta?: PaginationMeta
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
  pagination?: PaginationMeta
  meta?: PaginationMeta
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}
