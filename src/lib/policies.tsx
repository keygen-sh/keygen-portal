import { AttributeType } from "@/components/attribute/value"

import { Entitlement } from "@/types/entitlements"
import { Policy, ExpirationStrategy } from "@/types/policies"

export function isPerpetual(policy: Policy): boolean {
  return policy.attributes.duration == null || policy.attributes.duration === 0
}

export function isTimed(policy: Policy): boolean {
  const duration = policy.attributes.duration

  return typeof duration === "number" && duration > 0
}

export function isPerpetualFallback(policy: Policy): boolean {
  return (
    isTimed(policy) &&
    policy.attributes.expirationStrategy === ExpirationStrategy.MaintainAccess
  )
}

export function isNodeLocked(policy: Policy): boolean {
  const maxMachines = policy.attributes.maxMachines

  return (
    (typeof maxMachines === "number" && maxMachines > 0) ||
    policy.attributes.requireFingerprintScope === true
  )
}

export function isUserLocked(policy: Policy): boolean {
  const maxUsers = policy.attributes.maxUsers

  return (
    (typeof maxUsers === "number" && maxUsers > 0) ||
    policy.attributes.requireUserScope === true
  )
}

export function isProcessBased(policy: Policy): boolean {
  const maxProcesses = policy.attributes.maxProcesses

  return typeof maxProcesses === "number" && maxProcesses > 0
}

export function isLeaseBased(policy: Policy): boolean {
  return policy.attributes.requireHeartbeat === true
}

export function isFeatureBased(entitlements: Entitlement[]): boolean {
  return entitlements.length > 0
}

export function isUsageBased(policy: Policy): boolean {
  const maxUses = policy.attributes.maxUses

  return typeof maxUses === "number" && maxUses > 0
}

export const policyAttributeTypeSchema: Record<
  keyof Omit<Policy["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  name: "string",
  duration: "duration",
  strict: "boolean",
  floating: "boolean",
  scheme: "string",

  requireProductScope: "boolean",
  requirePolicyScope: "boolean",
  requireMachineScope: "boolean",
  requireFingerprintScope: "boolean",
  requireComponentsScope: "boolean",
  requireUserScope: "boolean",
  requireChecksumScope: "boolean",
  requireVersionScope: "boolean",

  requireCheckIn: "boolean",
  checkInInterval: "enum",
  checkInIntervalCount: "number",

  usePool: "boolean",
  maxMachines: "number",
  maxProcesses: "number",
  maxUsers: "number",
  maxCores: "number",
  maxUses: "number",

  encrypted: "boolean",
  protected: "boolean",

  requireHeartbeat: "boolean",
  heartbeatDuration: "duration",
  heartbeatCullStrategy: "enum",
  heartbeatResurrectionStrategy: "enum",
  heartbeatBasis: "enum",

  machineUniquenessStrategy: "enum",
  machineMatchingStrategy: "enum",
  componentUniquenessStrategy: "enum",
  componentMatchingStrategy: "enum",

  expirationStrategy: "enum",
  expirationBasis: "enum",
  renewalBasis: "enum",
  transferStrategy: "enum",

  authenticationStrategy: "enum",
  machineLeasingStrategy: "enum",
  processLeasingStrategy: "enum",
  overageStrategy: "enum",
}
