import { License } from "@/types/licenses"
import { Policy } from "@/types/policies"

export function generateLicenseKey(): string {
  const segments = 8
  const segmentLength = 4
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const key: string[] = []

  for (let i = 0; i < segments; i++) {
    let segment = ""
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    key.push(segment)
  }

  return key.join("-")
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
