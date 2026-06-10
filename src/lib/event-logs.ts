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

const SUCCESS_EVENT_RE = [/\.created$/, /\.valid$/]

export const EVENT_LOG_EVENT_FILTERS: Record<string, readonly string[]> = {
  "license.validation.*": [
    "license.validation.succeeded",
    "license.validation.failed",
  ],
  "machine.heartbeat.*": [
    "machine.heartbeat.ping",
    "machine.heartbeat.pong",
    "machine.heartbeat.dead",
    "machine.heartbeat.reset",
    "machine.heartbeat.resurrected",
  ],
  "process.heartbeat.*": [
    "process.heartbeat.ping",
    "process.heartbeat.pong",
    "process.heartbeat.dead",
  ],
}

export function expandEventLogEventFilters(events: readonly string[]) {
  return Array.from(
    new Set(events.flatMap((event) => EVENT_LOG_EVENT_FILTERS[event] ?? event)),
  )
}

export function eventLogBadgeVariant(
  event: string,
): "secondary" | "destructive" | "success" | "warning" {
  if (DESTRUCTIVE_EVENT_RE.some((re) => re.test(event))) {
    return "destructive"
  }

  if (SUCCESS_EVENT_RE.some((re) => re.test(event))) {
    return "success"
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
