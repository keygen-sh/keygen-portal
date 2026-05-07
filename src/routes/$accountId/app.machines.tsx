import { createFileRoute } from "@tanstack/react-router"
import { type MachineFilters } from "@/queries/machines"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function validateSearch(search: Record<string, unknown>): MachineFilters {
  const filters: MachineFilters = {}

  if (typeof search.fingerprint === "string")
    filters.fingerprint = search.fingerprint
  if (typeof search.ip === "string") filters.ip = search.ip
  if (typeof search.hostname === "string") filters.hostname = search.hostname
  if (typeof search.product === "string") filters.product = search.product
  if (typeof search.policy === "string") filters.policy = search.policy
  if (typeof search.license === "string") filters.license = search.license
  if (typeof search.owner === "string") filters.owner = search.owner
  if (typeof search.user === "string") filters.user = search.user
  if (typeof search.group === "string") filters.group = search.group
  if (isRecord(search.metadata))
    filters.metadata = search.metadata as Record<string, string>

  return filters
}

export const Route = createFileRoute("/$accountId/app/machines")({
  component: () => <Page.App.Machines />,
  validateSearch,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "machine.read"),
})
