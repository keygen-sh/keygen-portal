import config from "@/keygen/config"
import client from "@/keygen/client"
import { PolicyResponse } from "@/types/policies"
import * as Forms from "@/forms"

config.validate()

export default async function update({
  id,
  name,
  duration,
  strict,
  floating,
  scheme,
  requireProductScope,
  requirePolicyScope,
  requireMachineScope,
  requireFingerprintScope,
  requireComponentsScope,
  requireUserScope,
  requireChecksumScope,
  requireVersionScope,
  requireCheckIn,
  checkInInterval,
  checkInIntervalCount,
  usePool,
  maxMachines,
  maxProcesses,
  maxUsers,
  maxCores,
  maxUses,
  encrypted,
  protected: isProtected,
  requireHeartbeat,
  heartbeatDuration,
  heartbeatCullStrategy,
  heartbeatResurrectionStrategy,
  heartbeatBasis,
  machineUniquenessStrategy,
  machineMatchingStrategy,
  componentUniquenessStrategy,
  componentMatchingStrategy,
  expirationStrategy,
  expirationBasis,
  renewalBasis,
  transferStrategy,
  authenticationStrategy,
  machineLeasingStrategy,
  processLeasingStrategy,
  overageStrategy,
  metadata,
}: Forms.Policies.UpdatePayload & { id: string }): Promise<PolicyResponse> {
  const body = {
    data: {
      type: "policies",
      attributes: {
        ...(name && { name }),
        ...(duration && { duration }),
        ...(strict && { strict }),
        ...(floating && { floating }),
        ...(scheme && { scheme }),
        ...(requireProductScope && { requireProductScope }),
        ...(requirePolicyScope && { requirePolicyScope }),
        ...(requireMachineScope && { requireMachineScope }),
        ...(requireFingerprintScope && { requireFingerprintScope }),
        ...(requireComponentsScope && { requireComponentsScope }),
        ...(requireUserScope && { requireUserScope }),
        ...(requireChecksumScope && { requireChecksumScope }),
        ...(requireVersionScope && { requireVersionScope }),
        ...(requireCheckIn && { requireCheckIn }),
        ...(checkInInterval && { checkInInterval }),
        ...(checkInIntervalCount && { checkInIntervalCount }),
        ...(usePool && { usePool }),
        ...(maxMachines && { maxMachines }),
        ...(maxProcesses && { maxProcesses }),
        ...(maxUsers && { maxUsers }),
        ...(maxCores && { maxCores }),
        ...(maxUses && { maxUses }),
        ...(encrypted && { encrypted }),
        ...(isProtected && { protected: isProtected }),
        ...(requireHeartbeat && { requireHeartbeat }),
        ...(heartbeatDuration && { heartbeatDuration }),
        ...(heartbeatCullStrategy && { heartbeatCullStrategy }),
        ...(heartbeatResurrectionStrategy && {
          heartbeatResurrectionStrategy,
        }),
        ...(heartbeatBasis && { heartbeatBasis }),
        ...(machineUniquenessStrategy && {
          machineUniquenessStrategy,
        }),
        ...(machineMatchingStrategy && {
          machineMatchingStrategy,
        }),
        ...(componentUniquenessStrategy && {
          componentUniquenessStrategy,
        }),
        ...(componentMatchingStrategy && {
          componentMatchingStrategy,
        }),
        ...(expirationStrategy && { expirationStrategy }),
        ...(expirationBasis && { expirationBasis }),
        ...(renewalBasis && { renewalBasis }),
        ...(transferStrategy && { transferStrategy }),
        ...(authenticationStrategy && { authenticationStrategy }),
        ...(machineLeasingStrategy && { machineLeasingStrategy }),
        ...(processLeasingStrategy && { processLeasingStrategy }),
        ...(overageStrategy && { overageStrategy }),
        ...(metadata && { metadata }),
      },
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/policies/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as PolicyResponse

  return result
}
