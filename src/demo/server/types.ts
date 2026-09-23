import type { ErrorSource, Link, Linkage, Relationship } from "@/types/api"

export type { Link, Linkage, Relationship }

export type MockErrorSource = ErrorSource & { header?: string }

export type MockAttributes = Record<string, unknown>
export type MockRefs = Record<string, Linkage | null>

export interface MockRow<A extends MockAttributes = MockAttributes> {
  id: string
  type: string
  attributes: A
  refs: MockRefs
  created: string
  updated: string
}

export interface MockApiError {
  title: string
  detail?: string
  code?: string
  source?: MockErrorSource
  links?: Record<string, string | null>
}

export interface MockResource {
  id: string
  type: string
  attributes: MockAttributes
  relationships: Record<string, Relationship>
  links: Record<string, string | null>
  meta?: Record<string, unknown>
}

export interface MockDocument {
  data?: unknown
  included?: MockResource[]
  links?: Record<string, string | null>
  meta?: Record<string, unknown>
  errors?: MockApiError[]
}

export interface MockResult {
  status: number
  body?: MockDocument | Record<string, unknown> | null
  headers?: Record<string, string>
}

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json }
