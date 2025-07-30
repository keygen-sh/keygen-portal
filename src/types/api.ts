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

export type Writable<T> = Omit<T, "created" | "updated">

export type OptionalExcept<T, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>
