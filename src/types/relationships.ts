export interface Resource {
  id: string
  type: string
}

export interface Links {
  related?: string | null
  self?: string | null
}

export type Relationship<T = Resource | Resource[]> = {
  data?: T | null
  links?: Links
  meta?: Record<string, unknown>
} | null

export type Relationships = {
  account?: Relationship<Resource>
  artifacts?: Relationship<Resource[]>
  channels?: Relationship<Resource[]>
  environment?: Relationship<Resource | null>
  licenses?: Relationship<Resource[]>
  machines?: Relationship<Resource[]>
  platforms?: Relationship<Resource[]>
  policies?: Relationship<Resource[]>
  releases?: Relationship<Resource[]>
  tokens?: Relationship<Resource[]>
  users?: Relationship<Resource[]>
}
