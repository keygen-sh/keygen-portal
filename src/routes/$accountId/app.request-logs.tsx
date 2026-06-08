import { createFileRoute } from "@tanstack/react-router"

import { type RequestLogFilters } from "@/queries/request-logs"
import { type RequestLogResourceFilter } from "@/types/request-logs"

import { requirePermission } from "@/lib/permissions"

import * as Page from "@/pages/index"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseResourceFilter(
  value: unknown,
): RequestLogResourceFilter | undefined {
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

function validateSearch(search: Record<string, unknown>): RequestLogFilters {
  const filters: RequestLogFilters = {}

  if (typeof search.method === "string") filters.method = search.method
  if (typeof search.status === "string") filters.status = search.status
  if (typeof search.ip === "string") filters.ip = search.ip
  if (typeof search.url === "string") filters.url = search.url

  const resource = parseResourceFilter(search.resource)
  if (resource) filters.resource = resource

  const requestor = parseResourceFilter(search.requestor)
  if (requestor) filters.requestor = requestor

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

export const Route = createFileRoute("/$accountId/app/request-logs")({
  component: () => <Page.App.RequestLogs />,
  validateSearch,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "request-log.read"),
})
