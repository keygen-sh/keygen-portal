import type { Linkage, MockRow } from "./types"

export interface MockBearer {
  token: MockRow
  subject: MockRow
}

export interface MockContext {
  requestId: string
  method: string
  url: URL
  path: string
  params: Record<string, string>
  query: URLSearchParams
  body: unknown
  headers: Headers
  prefer: Set<string>
  accountId: string
  account: MockRow | null
  bearer: MockBearer | null
  environment: MockRow | null
  resource: Linkage | null
}

export type QueryValue = string | string[] | QueryObject
export interface QueryObject {
  [key: string]: QueryValue
}

export function queryObject(query: URLSearchParams): QueryObject {
  const output: QueryObject = {}

  for (const [rawKey, value] of query.entries()) {
    const isList = rawKey.endsWith("[]")
    const key = isList ? rawKey.slice(0, -2) : rawKey
    const segments = key.replace(/\]/g, "").split("[")

    let cursor: QueryObject = output
    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        if (isList) {
          const existing = cursor[segment]
          cursor[segment] = Array.isArray(existing)
            ? [...existing, value]
            : [value]
        } else {
          cursor[segment] = value
        }
        return
      }

      const child = cursor[segment]
      if (child && typeof child === "object" && !Array.isArray(child)) {
        cursor = child
      } else {
        const created: QueryObject = {}
        cursor[segment] = created
        cursor = created
      }
    })
  }

  return output
}

export function queryString(
  query: URLSearchParams,
  key: string,
): string | null {
  return query.get(key)
}

export function queryList(query: URLSearchParams, key: string): string[] {
  return [...query.getAll(`${key}[]`), ...query.getAll(key)].filter(
    (value) => value !== "",
  )
}

export function queryNested(
  query: URLSearchParams,
  key: string,
): Record<string, string> {
  const output: Record<string, string> = {}
  const prefix = `${key}[`
  for (const [rawKey, value] of query.entries()) {
    if (rawKey.startsWith(prefix) && rawKey.endsWith("]")) {
      output[rawKey.slice(prefix.length, -1)] = value
    }
  }
  return output
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function bodyData(ctx: MockContext): Record<string, unknown> {
  const data = isRecord(ctx.body) ? ctx.body.data : undefined
  return isRecord(data) ? data : {}
}

export function bodyDataList(ctx: MockContext): Record<string, unknown>[] {
  const data = isRecord(ctx.body) ? ctx.body.data : undefined
  return Array.isArray(data) ? data.filter(isRecord) : []
}

export function bodyAttributes(ctx: MockContext): Record<string, unknown> {
  const attributes = bodyData(ctx).attributes
  return isRecord(attributes) ? attributes : {}
}

export function bodyRelationships(ctx: MockContext): Record<string, unknown> {
  const relationships = bodyData(ctx).relationships
  return isRecord(relationships) ? relationships : {}
}

export function bodyRelationship(
  ctx: MockContext,
  name: string,
): { present: boolean; linkage: Linkage | null } {
  const relationships = bodyRelationships(ctx)
  if (!(name in relationships)) return { present: false, linkage: null }

  const relationship = relationships[name]
  const data = isRecord(relationship) ? relationship.data : undefined

  if (
    isRecord(data) &&
    typeof data.id === "string" &&
    typeof data.type === "string"
  ) {
    return { present: true, linkage: { type: data.type, id: data.id } }
  }

  return { present: true, linkage: null }
}

export function bodyMeta(ctx: MockContext): Record<string, unknown> {
  const meta = isRecord(ctx.body) ? ctx.body.meta : undefined
  return isRecord(meta) ? meta : {}
}

export function linkageOf(value: unknown): Linkage | null {
  const data = isRecord(value) ? value.data : undefined
  if (
    isRecord(data) &&
    typeof data.id === "string" &&
    typeof data.type === "string"
  ) {
    return { type: data.type, id: data.id }
  }
  return null
}

export function basicCredentials(
  ctx: MockContext,
): { email: string; password: string } | null {
  const header = ctx.headers.get("authorization") ?? ""
  if (!/^basic /i.test(header)) return null

  try {
    const bytes = Uint8Array.from(atob(header.slice(6).trim()), (char) =>
      char.charCodeAt(0),
    )
    const decoded = new TextDecoder().decode(bytes)
    const separator = decoded.indexOf(":")
    if (separator === -1) return { email: decoded, password: "" }
    return {
      email: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    }
  } catch {
    return null
  }
}

export function bearerSecret(ctx: MockContext): string | null {
  const header = ctx.headers.get("authorization") ?? ""
  if (!/^bearer /i.test(header)) return null
  const secret = header.slice(7).trim()
  return secret === "" ? null : secret
}

export function currentSubject(ctx: MockContext): MockRow | null {
  return ctx.bearer?.subject ?? null
}

export function currentUser(ctx: MockContext): MockRow | null {
  const subject = ctx.bearer?.subject
  return subject?.type === "users" ? subject : null
}

export function subjectLinkage(ctx: MockContext): Linkage | null {
  const subject = ctx.bearer?.subject
  return subject ? { type: subject.type, id: subject.id } : null
}
