import {
  format,
  getDay,
  addWeeks,
  parseISO,
  startOfWeek,
  differenceInCalendarWeeks,
} from "date-fns"

import { AttributeType } from "@/components/attribute/value"

import { Policy } from "@/types/policies"
import { License, LicenseAttributeDescriptions } from "@/types/licenses"
import { formatByteLimitDisplay, formatRawByteLimitDisplay } from "@/lib/bytes"

export const licenseAttributeTypeSchema: Record<
  keyof Omit<License["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  name: "string",
  key: "license-key",
  expiry: "date",
  status: "enum",
  uses: "number",
  suspended: "boolean",
  protected: "boolean",
  version: "string",
  maxMachines: "number",
  maxProcesses: "number",
  maxUsers: "number",
  maxCores: "number",
  maxMemory: "bytes",
  maxDisk: "bytes",
  maxUses: "number",
  requireHeartbeat: "boolean",
  requireCheckIn: "boolean",
  lastValidated: "date",
  lastCheckOut: "date",
  lastCheckIn: "date",
  nextCheckIn: "date",
}

export function getLimit(
  licenseValue: number | null,
  policyValue: number | null,
): number | null {
  return licenseValue ?? policyValue
}

export function isLimitOverridden(
  licenseValue: number | null,
  policyValue: number | null | undefined,
): boolean {
  return licenseValue !== null && licenseValue !== policyValue
}

export function formatLimitValue(value: number | null): string {
  return value === null ? "unlimited" : String(value)
}

export function formatLimitDisplay(
  current: number,
  max: number | null,
): string {
  return `${current} of ${formatLimitValue(max)}`
}

type LimitAttribute =
  | "maxMachines"
  | "maxProcesses"
  | "maxUsers"
  | "maxCores"
  | "maxMemory"
  | "maxDisk"
  | "maxUses"

type ByteLimitAttribute = "maxMemory" | "maxDisk"

export type ByteUsageMetric = "memory" | "disk"

export type UsageLimitDisplay = {
  value: string
  enabled: boolean
  tooltip: string
  hoverValue?: string
  overridden: boolean
  wrap?: boolean
}

const ByteUsageLimitAttributes: Record<ByteUsageMetric, ByteLimitAttribute> = {
  memory: "maxMemory",
  disk: "maxDisk",
}

const ByteUsageLimitTooltips: Record<ByteUsageMetric, string> = {
  memory: LicenseAttributeDescriptions.maxMemory,
  disk: LicenseAttributeDescriptions.maxDisk,
}

function getAttributeLimit(
  license: License,
  policy: Policy | null | undefined,
  attribute: LimitAttribute,
): number | null {
  return getLimit(
    license.attributes[attribute],
    policy?.attributes[attribute] ?? null,
  )
}

export function getMachineMetricCount(
  license: License,
  metric: "cores" | "memory" | "disk",
): number {
  const value = license.relationships.machines?.meta?.[metric]

  return typeof value === "number" ? value : 0
}

function getByteLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  attribute: ByteLimitAttribute,
  current: number = 0,
): string {
  return formatByteLimitDisplay(
    current,
    getAttributeLimit(license, policy, attribute),
  )
}

function getByteLimitRawDisplay(
  license: License,
  policy: Policy | null | undefined,
  attribute: ByteLimitAttribute,
  current: number = 0,
): string {
  return formatRawByteLimitDisplay(
    current,
    getAttributeLimit(license, policy, attribute),
    { compactZeroCurrent: true },
  )
}

export function getByteUsageLimit(
  license: License,
  policy: Policy | null | undefined,
  metric: ByteUsageMetric,
): UsageLimitDisplay {
  const count = getMachineMetricCount(license, metric)
  const attribute = ByteUsageLimitAttributes[metric]
  const licenseLimit = license.attributes[attribute]
  const policyLimit = policy?.attributes[attribute]
  const limit = licenseLimit ?? policyLimit

  return {
    value: getByteLimitDisplay(license, policy, attribute, count),
    enabled: Boolean(licenseLimit || policyLimit),
    hoverValue:
      count === 0 && limit == null
        ? undefined
        : getByteLimitRawDisplay(license, policy, attribute, count),
    tooltip: ByteUsageLimitTooltips[metric],
    overridden: isLimitOverridden(licenseLimit, policyLimit),
    wrap: true,
  }
}

export function getMachinesLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  machineCount: number = 0,
): string {
  return formatLimitDisplay(
    machineCount,
    getAttributeLimit(license, policy, "maxMachines"),
  )
}

export function getUsersLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  userCount: number = 0,
): string {
  return formatLimitDisplay(
    userCount,
    getAttributeLimit(license, policy, "maxUsers"),
  )
}

export function getProcessesLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  processCount: number = 0,
): string {
  return formatLimitDisplay(
    processCount,
    getAttributeLimit(license, policy, "maxProcesses"),
  )
}

export function getCoresLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  coreCount: number = 0,
): string {
  return formatLimitDisplay(
    coreCount,
    getAttributeLimit(license, policy, "maxCores"),
  )
}

export function getUsesLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
): string {
  return formatLimitDisplay(
    license.attributes.uses,
    getAttributeLimit(license, policy, "maxUses"),
  )
}

export function getLimitPlaceholder(
  policyValue: number | null | undefined,
): string {
  if (policyValue === null || policyValue === undefined) {
    return "Unlimited"
  }
  return policyValue.toString()
}

export function truncateKey(
  key: string,
  { maxLength = 64 }: { maxLength?: number } = {},
): string {
  if (key.length <= maxLength) return key

  const ellipsis = "…"
  const remaining = maxLength - ellipsis.length
  const head = key.slice(0, Math.ceil(remaining / 2))
  const tail = key.slice(-Math.floor(remaining / 2))

  return `${head}${ellipsis}${tail}`
}

export function getLicenseLabel(license: License) {
  return license.attributes.name || license.attributes.key
}

export function formatTtlLabel(seconds: number | null): string {
  if (seconds === null) return "no TTL"

  const days = Math.floor(seconds / 86400)
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`

  const hours = Math.floor(seconds / 3600)
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`

  return `${seconds} seconds`
}

export type ExpiringLicense = {
  id: string
  name: string | null
  key: string
}

export type ExpirationHeatmapEntry = {
  date: string
  x: number
  y: number
  temperature: number
  count: number
}

export type ExpirationHeatmap = {
  entries: ExpirationHeatmapEntry[]
  licensesByDate: Map<string, ExpiringLicense[]>
  numWeeks: number
  monthLabels: { label: string; weekIndex: number }[]
}

export function buildExpirationHeatmap(
  licenses: License[],
  { start, end }: { start: Date; end: Date },
): ExpirationHeatmap {
  const licensesByDate = new Map<string, ExpiringLicense[]>()

  for (const license of licenses) {
    const { expiry, name, key } = license.attributes
    if (!expiry) continue

    const date = format(parseISO(expiry), "yyyy-MM-dd")
    const bucket = licensesByDate.get(date) ?? []
    bucket.push({ id: license.id, name, key })
    licensesByDate.set(date, bucket)
  }

  const firstWeekStart = startOfWeek(start, { weekStartsOn: 1 })
  const numWeeks =
    differenceInCalendarWeeks(end, firstWeekStart, { weekStartsOn: 1 }) + 1

  const monthLabels: { label: string; weekIndex: number }[] = []
  const seenMonths = new Set<number>()
  for (let week = 0; week < numWeeks; week++) {
    const weekDate = addWeeks(firstWeekStart, week)
    const monthKey = weekDate.getFullYear() * 12 + weekDate.getMonth()
    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey)
      monthLabels.push({ label: format(weekDate, "MMM"), weekIndex: week })
    }
  }

  const maxCount = Math.max(
    1,
    ...Array.from(licensesByDate.values(), (bucket) => bucket.length),
  )

  const entries = Array.from(licensesByDate.keys())
    .sort()
    .map((date) => {
      const parsed = parseISO(date)
      const count = licensesByDate.get(date)!.length

      return {
        date,
        x: differenceInCalendarWeeks(parsed, firstWeekStart, {
          weekStartsOn: 1,
        }),
        y: getDay(parsed),
        count,
        temperature: count / maxCount,
      }
    })

  return { entries, licensesByDate, numWeeks, monthLabels }
}
