import type { BadgeVariant } from "@/components/ui/badge"

import { formatDate } from "@/lib/utils"

import {
  Policy,
  PolicyDurations,
  PolicyAttributeDescriptions,
} from "@/types/policies"

export function isPerpetual(policy: Policy): boolean {
  return policy.attributes.duration == null || policy.attributes.duration === 0
}

export function isTimed(policy: Policy): boolean {
  const d = policy.attributes.duration
  return typeof d === "number" && d > 0
}

export function isPerpetualFallback(policy: Policy): boolean {
  return (
    isTimed(policy) &&
    policy.attributes.expirationStrategy === "MAINTAIN_ACCESS"
  )
}

export function isNodeLocked(policy: Policy): boolean {
  const m = policy.attributes.maxMachines
  return (
    (typeof m === "number" && m > 0) ||
    policy.attributes.requireFingerprintScope === true
  )
}

export function isUserLocked(policy: Policy): boolean {
  const u = policy.attributes.maxUsers
  return (
    (typeof u === "number" && u > 0) ||
    policy.attributes.requireUserScope === true
  )
}

export function isProcessBased(policy: Policy): boolean {
  const p = policy.attributes.maxProcesses
  return typeof p === "number" && p > 0
}

export function isLeaseBased(policy: Policy): boolean {
  return policy.attributes.requireHeartbeat === true
}

export function isFeatureBased(policy: Policy): boolean {
  const count = policy.relationships?.entitlements?.data?.length ?? 0
  return count > 0
}

export function isUsageBased(policy: Policy): boolean {
  const uses = policy.attributes.maxUses
  return typeof uses === "number" && uses > 0
}

export function policyDurationToString(seconds?: number | null): string {
  if (seconds == null || seconds === 0) return "Unlimited"
  const match = PolicyDurations.find((duration) => duration.seconds === seconds)
  return match ? match.label : `${seconds}s`
}

function policyAttributesTitle(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function policyLabel(
  value?: string | null,
  map?: Record<string, string>,
) {
  if (!value) return "--"
  return (map && map[value]) || policyAttributesTitle(value)
}

export type Formatted = {
  value: string
  variant: BadgeVariant
  tooltip?: string
}

export function formatPolicyAttribute(
  key: keyof Policy["attributes"],
  raw: unknown,
  options?: { forceDisabled?: boolean },
): Formatted {
  const isUnset =
    raw === null || raw === undefined || (typeof raw === "string" && raw === "")

  if (isUnset) {
    return {
      value: "Not set",
      variant: "disabled",
      tooltip: PolicyAttributeDescriptions[key],
    }
  }

  let value: string
  if (key === "duration") value = policyDurationToString(raw as number)
  else if (key === "created" || key === "updated")
    value = formatDate(String(raw))
  else if (typeof raw === "boolean") value = raw ? "Enabled" : "Disabled"
  else if (typeof raw === "string") value = policyLabel(raw)
  else value = String(raw)

  const variant: BadgeVariant = options?.forceDisabled
    ? "disabled"
    : typeof raw === "boolean"
      ? raw
        ? "success"
        : "disabled"
      : "default"

  return { value, variant, tooltip: PolicyAttributeDescriptions[key] }
}
