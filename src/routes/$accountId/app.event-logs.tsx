import { createFileRoute } from "@tanstack/react-router"

import { type EventLogFilters } from "@/queries/event-logs"
import { type EventLogResourceFilter } from "@/types/event-logs"

import { requirePermission } from "@/lib/permissions"

import * as Page from "@/pages/index"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseResourceFilter(
  value: unknown,
): EventLogResourceFilter | undefined {
  if (typeof value === "string") return value
  if (
    isRecord(value) &&
    typeof value.type === "string" &&
    typeof value.id === "string"
  ) {
    return { type: value.type, id: value.id }
  }
  return undefined
}

function validateSearch(search: Record<string, unknown>): EventLogFilters {
  const filters: EventLogFilters = {}

  if (Array.isArray(search.events)) {
    const events = search.events.filter(
      (event): event is string => typeof event === "string",
    )
    if (events.length > 0) filters.events = events
  }
  if (typeof search.request === "string") filters.request = search.request

  const resource = parseResourceFilter(search.resource)
  if (resource) filters.resource = resource

  const whodunnit = parseResourceFilter(search.whodunnit)
  if (whodunnit) filters.whodunnit = whodunnit

  if (isRecord(search.date)) {
    filters.date = {}
    if (typeof search.date.start === "string") {
      filters.date.start = search.date.start
    }
    if (typeof search.date.end === "string") {
      filters.date.end = search.date.end
    }
  }

  return filters
}

export const Route = createFileRoute("/$accountId/app/event-logs")({
  component: () => <Page.App.EventLogs />,
  validateSearch,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "event-log.read"),
})
