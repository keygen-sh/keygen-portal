import { type DiffEntry } from "@/components/diff"

const DESTRUCTIVE_EVENT_RE = [
  /\.banned$/,
  /\.dead$/,
  /\.deleted$/,
  /\.detached$/,
  /\.expired$/,
  /\.revoked$/,
]

const WARNING_EVENT_RE = [
  /\.check-in-overdue$/,
  /\.check-in-required-soon$/,
  /\.expiring-soon$/,
  /\.failed$/,
  /\.suspended$/,
  /\.yanked$/,
]

export function eventLogBadgeVariant(
  event: string,
): "secondary" | "destructive" | "warning" {
  if (DESTRUCTIVE_EVENT_RE.some((re) => re.test(event))) {
    return "destructive"
  }

  if (WARNING_EVENT_RE.some((re) => re.test(event))) {
    return "warning"
  }

  return "secondary"
}

export function visibleMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => key !== "diff"),
  )
}

export function metadataDiffEntries(
  metadata: Record<string, unknown>,
): DiffEntry[] {
  const diff = metadata.diff
  if (!diff || typeof diff !== "object" || Array.isArray(diff)) return []

  return Object.entries(diff as Record<string, unknown>).map(([key, value]) => {
    const pair: unknown[] = Array.isArray(value) ? value : [null, value]
    const [before = null, after = null] = pair

    return { key, before, after }
  })
}
