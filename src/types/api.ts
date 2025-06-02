export interface APIResponse<T> {
  data?: T
  errors?: ErrorResponse[]
}

export interface ErrorResponse {
  title: string
  detail: string
  code: string
  source: Record<string, any>
  links: Record<string, any>
}
