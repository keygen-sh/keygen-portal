import { AttributeType } from "@/components/attribute/value"

import { License } from "@/types/licenses"
import { Policy } from "@/types/policies"
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

export function getMemoryLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  memoryCount: number = 0,
): string {
  return formatByteLimitDisplay(
    memoryCount,
    getAttributeLimit(license, policy, "maxMemory"),
  )
}

export function getMemoryLimitRawDisplay(
  license: License,
  policy: Policy | null | undefined,
  memoryCount: number = 0,
): string {
  return formatRawByteLimitDisplay(
    memoryCount,
    getAttributeLimit(license, policy, "maxMemory"),
    { compactZeroCurrent: true },
  )
}

export function getDiskLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  diskCount: number = 0,
): string {
  return formatByteLimitDisplay(
    diskCount,
    getAttributeLimit(license, policy, "maxDisk"),
  )
}

export function getDiskLimitRawDisplay(
  license: License,
  policy: Policy | null | undefined,
  diskCount: number = 0,
): string {
  return formatRawByteLimitDisplay(
    diskCount,
    getAttributeLimit(license, policy, "maxDisk"),
    { compactZeroCurrent: true },
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
