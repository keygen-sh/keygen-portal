import { createFileRoute } from "@tanstack/react-router"

import { type EventLogFilters } from "@/queries/event-logs"

import { requirePermission } from "@/lib/permissions"

import * as Page from "@/pages/index"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function validateSearch(search: Record<string, unknown>): EventLogFilters {
  const filters: EventLogFilters = {}

  if (typeof search.event === "string") filters.event = search.event
  if (typeof search.request === "string") filters.request = search.request
  if (typeof search.resource === "string") filters.resource = search.resource
  if (typeof search.whodunnit === "string") filters.whodunnit = search.whodunnit
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
