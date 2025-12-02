export type APIResponse<
  TData,
  TMeta extends Record<string, unknown> | undefined = undefined,
> =
  | {
      data: TData
      meta?: TMeta
      links?: Link
      errors?: never
    }
  | {
      data?: never
      meta?: TMeta
      links?: Link
      errors: APIError[]
    }

export interface ErrorSource {
  pointer?: string
  parameter?: string
}

export class APIError extends Error {
  title: string
  detail?: string
  code?: string
  source?: ErrorSource
  links?: Link
  meta?: Record<string, unknown>

  constructor(error: {
    title: string
    detail?: string
    code?: string
    source?: ErrorSource
    links?: Link
    meta?: Record<string, unknown>
  }) {
    super(error.detail ?? error.title)
    this.name = "APIError"
    this.title = error.title
    this.detail = error.detail
    this.code = error.code
    this.source = error.source
    this.links = error.links
    this.meta = error.meta
  }
}

export interface Link {
  related?: string | null
  self?: string | null
}

export interface Linkage<T extends string = string> {
  id: string
  type: T
}

export type Relationship<
  T extends Linkage | Linkage[] | null = Linkage | Linkage[] | null,
> = {
  data?: T
  links?: Link
  meta?: Record<string, unknown>
} | null

export interface Resource<
  TType extends string,
  TAttribute,
  TRelationship extends Record<string, Relationship> = {
    account: Relationship<Linkage<"accounts">>
  },
> {
  id: string
  type: TType
  attributes: TAttribute
  relationships: TRelationship
  links: { self: string }
}

export type Writable<T> = Omit<T, "created" | "updated">

export type OptionalExcept<T, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>
