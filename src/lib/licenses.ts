import { AttributeType } from "@/components/attribute/value"

import { License } from "@/types/licenses"
import { Policy } from "@/types/policies"

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

export function getMachinesLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  machineCount: number = 0,
): string {
  const limit = getLimit(
    license.attributes.maxMachines,
    policy?.attributes.maxMachines ?? null,
  )
  return formatLimitDisplay(machineCount, limit)
}

export function getUsersLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  userCount: number = 0,
): string {
  const limit = getLimit(
    license.attributes.maxUsers,
    policy?.attributes.maxUsers ?? null,
  )
  return formatLimitDisplay(userCount, limit)
}

export function getProcessesLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  processCount: number = 0,
): string {
  const limit = getLimit(
    license.attributes.maxProcesses,
    policy?.attributes.maxProcesses ?? null,
  )
  return formatLimitDisplay(processCount, limit)
}

export function getCoresLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
  coreCount: number = 0,
): string {
  const limit = getLimit(
    license.attributes.maxCores,
    policy?.attributes.maxCores ?? null,
  )
  return formatLimitDisplay(coreCount, limit)
}

export function getUsesLimitDisplay(
  license: License,
  policy: Policy | null | undefined,
): string {
  const limit = getLimit(
    license.attributes.maxUses,
    policy?.attributes.maxUses ?? null,
  )
  return formatLimitDisplay(license.attributes.uses, limit)
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
