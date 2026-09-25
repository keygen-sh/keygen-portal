import type { MockContext } from "./context"
import type {
  MockAttributes,
  Linkage,
  Relationship,
  MockResource,
  MockRow,
} from "./types"

export function camelize(key: string): string {
  const trimmed = key.trim()
  if (trimmed === "") return trimmed
  const parts = trimmed.split(/[\s_-]+/).filter((part) => part !== "")
  if (parts.length <= 1) {
    return trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
  }
  return parts
    .map((part, index) =>
      index === 0
        ? part.charAt(0).toLowerCase() + part.slice(1)
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("")
}

export function camelizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelizeKeys)
  if (typeof value !== "object" || value === null) return value

  const output: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    output[camelize(key)] = camelizeKeys(entry)
  }
  return output
}

export function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {}
  }
  return camelizeKeys(value) as Record<string, unknown>
}

export function accountPath(ctx: MockContext): string {
  return `/v1/accounts/${ctx.accountId}`
}

export function resourcePath(
  ctx: MockContext,
  type: string,
  id: string,
): string {
  return `${accountPath(ctx)}/${type}/${id}`
}

export function selfLinks(
  ctx: MockContext,
  row: Pick<MockRow, "type" | "id">,
): Record<string, string | null> {
  return { self: resourcePath(ctx, row.type, row.id) }
}

export function toOne(
  ctx: MockContext,
  linkage: Linkage | null | undefined,
  related?: string | null,
): Relationship {
  if (!linkage) {
    return {
      links: { related: related === undefined ? null : related },
      data: null,
    }
  }
  return {
    links: { related: related ?? resourcePath(ctx, linkage.type, linkage.id) },
    data: { type: linkage.type, id: linkage.id },
  }
}

export function toMany(
  related: string,
  meta?: Record<string, unknown>,
): Relationship {
  return meta ? { links: { related }, meta } : { links: { related } }
}

export function accountRelationship(ctx: MockContext): Relationship {
  return {
    links: { related: accountPath(ctx) },
    data: { type: "accounts", id: ctx.accountId },
  }
}

export function environmentRelationship(
  ctx: MockContext,
  linkage: Linkage | null | undefined,
): Relationship {
  return toOne(ctx, linkage ?? null)
}

export function resource(
  ctx: MockContext,
  row: MockRow,
  attributes: MockAttributes,
  relationships: Record<string, Relationship>,
  extra: {
    links?: Record<string, string | null>
    meta?: Record<string, unknown>
  } = {},
): MockResource {
  return {
    id: row.id,
    type: row.type,
    attributes,
    relationships: {
      account: accountRelationship(ctx),
      ...relationships,
    },
    links: { ...selfLinks(ctx, row), ...extra.links },
    ...(extra.meta ? { meta: extra.meta } : {}),
  }
}

export function linkage(type: string, id: string): Linkage {
  return { type, id }
}

export function rowLinkage(row: Pick<MockRow, "type" | "id">): Linkage {
  return { type: row.type, id: row.id }
}

export function sameLinkage(
  a: Linkage | null | undefined,
  b: Linkage | null | undefined,
): boolean {
  if (!a || !b) return a == null && b == null
  return a.type === b.type && a.id === b.id
}

export function pluralType(type: string): string {
  if (type.endsWith("s")) return type
  if (type.endsWith("ch") || type.endsWith("sh")) return `${type}es`
  return `${type}s`
}

export function singularType(type: string): string {
  if (type === "arches") return "arch"
  if (type === "licenses") return "license"
  if (type === "processes") return "process"
  if (type === "second-factors") return "second-factor"
  return type.endsWith("s") ? type.slice(0, -1) : type
}
