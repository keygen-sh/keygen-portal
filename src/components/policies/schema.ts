import { z } from "zod"

import {
  Policy,
  PolicyFormValues,
  TimingTemplates,
  AccessTemplates,
  MeteredTemplates,
  CheckInInterval,
  AuthenticationStrategy,
  ExpirationStrategy,
  OverageStrategy,
  ExpirationBasis,
  RenewalBasis,
  TransferStrategy,
  MachineUniquenessStrategy,
  MachineMatchingStrategy,
  MachineLeasingStrategy,
  ProcessLeasingStrategy,
  ComponentUniquenessStrategy,
  ComponentMatchingStrategy,
  HeartbeatBasis,
  HeartbeatCullStrategy,
  HeartbeatResurrectionStrategy,
} from "@/types/policies"

export const BaseShape = z.object({
  name: z.string().trim().min(1, "Policy name is required"),
  duration: z.coerce
    .number()
    .int()
    .nonnegative()
    .nullish()
    .transform((value) => (value == null ? value : value === 0 ? null : value)),
  strict: z.boolean().default(true),
  floating: z.boolean().default(false),

  requireProductScope: z.boolean().default(false),
  requirePolicyScope: z.boolean().default(false),
  requireMachineScope: z.boolean().default(false),
  requireFingerprintScope: z.boolean().default(false),
  requireComponentsScope: z.boolean().default(false),
  requireUserScope: z.boolean().default(false),
  requireChecksumScope: z.boolean().default(false),
  requireVersionScope: z.boolean().default(false),
  requireCheckIn: z.boolean().default(false),

  checkInInterval: z.nativeEnum(CheckInInterval).nullish(),
  checkInIntervalCount: z.union([
    z.coerce.number().int(),
    z.null(),
    z.undefined(),
  ]),

  usePool: z.boolean().default(false),
  maxMachines: z.coerce
    .number()
    .int()
    .nonnegative()
    .nullish()
    .transform((value) => (value == null ? value : value === 0 ? null : value)),
  maxProcesses: z.coerce
    .number()
    .int()
    .nonnegative()
    .nullish()
    .transform((value) => (value == null ? value : value === 0 ? null : value)),
  maxUsers: z.coerce
    .number()
    .int()
    .nonnegative()
    .nullish()
    .transform((value) => (value == null ? value : value === 0 ? null : value)),
  maxUses: z.coerce.number().int().positive().nullish(),
  protected: z.boolean().default(true),

  requireHeartbeat: z.boolean().default(false),
  heartbeatDuration: z.union([
    z.coerce.number().int(),
    z.null(),
    z.undefined(),
  ]),
  heartbeatCullStrategy: z
    .nativeEnum(HeartbeatCullStrategy)
    .nullish()
    .default(HeartbeatCullStrategy.DEACTIVATE_DEAD),
  heartbeatResurrectionStrategy: z
    .nativeEnum(HeartbeatResurrectionStrategy)
    .nullish()
    .default(HeartbeatResurrectionStrategy.NO_REVIVE),
  heartbeatBasis: z
    .nativeEnum(HeartbeatBasis)
    .nullish()
    .default(HeartbeatBasis.FROM_FIRST_PING),
  machineUniquenessStrategy: z
    .nativeEnum(MachineUniquenessStrategy)
    .nullish()
    .default(MachineUniquenessStrategy.UNIQUE_PER_LICENSE),
  machineMatchingStrategy: z
    .nativeEnum(MachineMatchingStrategy)
    .nullish()
    .default(MachineMatchingStrategy.MATCH_ANY),
  componentUniquenessStrategy: z
    .nativeEnum(ComponentUniquenessStrategy)
    .nullish()
    .default(ComponentUniquenessStrategy.UNIQUE_PER_MACHINE),
  componentMatchingStrategy: z
    .nativeEnum(ComponentMatchingStrategy)
    .nullish()
    .default(ComponentMatchingStrategy.MATCH_ANY),
  expirationStrategy: z
    .nativeEnum(ExpirationStrategy)
    .nullish()
    .default(ExpirationStrategy.RESTRICT_ACCESS),
  expirationBasis: z
    .nativeEnum(ExpirationBasis)
    .nullish()
    .default(ExpirationBasis.FROM_CREATION),
  renewalBasis: z
    .nativeEnum(RenewalBasis)
    .nullish()
    .default(RenewalBasis.FROM_EXPIRY),
  transferStrategy: z
    .nativeEnum(TransferStrategy)
    .nullish()
    .default(TransferStrategy.KEEP_EXPIRY),
  authenticationStrategy: z
    .nativeEnum(AuthenticationStrategy)
    .nullish()
    .default(AuthenticationStrategy.MIXED),
  machineLeasingStrategy: z
    .nativeEnum(MachineLeasingStrategy)
    .nullish()
    .default(MachineLeasingStrategy.PER_LICENSE),
  processLeasingStrategy: z
    .nativeEnum(ProcessLeasingStrategy)
    .nullish()
    .default(ProcessLeasingStrategy.PER_MACHINE),
  overageStrategy: z
    .nativeEnum(OverageStrategy)
    .nullish()
    .default(OverageStrategy.NO_OVERAGE),
  metadata: z.record(z.string()).default({}),

  product: z.object({
    id: z
      .string({ required_error: "Product is required" })
      .min(1, "Product is required."),
  }),

  entitlements: z
    .object({
      attach: z.array(z.string()).default([]),
      create: z
        .array(
          z.object({
            name: z.string().min(1),
            code: z.string().min(1),
            metadata: z.record(z.string()).optional(),
          }),
        )
        .default([]),
    })
    .default({ attach: [], create: [] }),
})

export const BaseRules = (
  schema: z.ZodType<PolicyFormValues>,
): z.ZodType<PolicyFormValues> =>
  schema
    .refine(
      (values: PolicyFormValues) =>
        values.duration == null || values.expirationStrategy != null,
      {
        path: ["expirationStrategy"],
        message: "Required when duration is set",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        values.duration == null || values.expirationBasis != null,
      {
        path: ["expirationBasis"],
        message: "Required when duration is set",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        values.duration == null || values.renewalBasis != null,
      {
        path: ["renewalBasis"],
        message: "Required when duration is set",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        values.duration == null || values.transferStrategy != null,
      {
        path: ["transferStrategy"],
        message: "Required when duration is set",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.machineUniquenessStrategy != null,
      {
        path: ["machineUniquenessStrategy"],
        message: "Required when fingerprint scope or max machines is set",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.machineMatchingStrategy != null,
      {
        path: ["machineMatchingStrategy"],
        message: "Required when fingerprint scope or max machines is set",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.componentUniquenessStrategy != null,
      {
        path: ["componentUniquenessStrategy"],
        message: "Required when fingerprint scope or max machines is set",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.componentMatchingStrategy != null,
      {
        path: ["componentMatchingStrategy"],
        message: "Required when fingerprint scope or max machines is set",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.overageStrategy != null,
      {
        path: ["overageStrategy"],
        message: "Required when fingerprint scope or max machines is set",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !values.requireHeartbeat ||
        (values.heartbeatDuration != null && values.heartbeatDuration >= 60),
      {
        path: ["heartbeatDuration"],
        message: "Must be at least 60 seconds",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !values.requireHeartbeat || values.heartbeatBasis != null,
      {
        path: ["heartbeatBasis"],
        message: "Required when heartbeat is enabled",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !values.requireHeartbeat || values.heartbeatCullStrategy != null,
      {
        path: ["heartbeatCullStrategy"],
        message: "Required when heartbeat is enabled",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !values.requireHeartbeat ||
        values.heartbeatResurrectionStrategy != null,
      {
        path: ["heartbeatResurrectionStrategy"],
        message: "Required when heartbeat is enabled",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        values.checkInInterval == null ||
        (values.checkInIntervalCount != null &&
          values.checkInIntervalCount >= 1 &&
          values.checkInIntervalCount <= 365),
      {
        path: ["checkInIntervalCount"],
        message: "Must be a number between 1 and 365",
      },
    )

export const BaseSchema: z.ZodType<PolicyFormValues> = BaseRules(BaseShape)

export const TimedShape = z.object({
  duration: z.coerce.number().int().positive().nullish().default(1209600),
  renewalBasis: z
    .nativeEnum(RenewalBasis)
    .nullish()
    .default(RenewalBasis.FROM_NOW_IF_EXPIRED),
  transferStrategy: z
    .nativeEnum(TransferStrategy)
    .nullish()
    .default(TransferStrategy.RESET_EXPIRY),
})

export const TimedRules = (
  schema: z.ZodType<PolicyFormValues>,
): z.ZodType<PolicyFormValues> =>
  schema
    .refine(
      (values: PolicyFormValues) =>
        values.duration != null && values.duration > 0,
      {
        path: ["duration"],
        message: "Cannot be unlimited for Timed policies",
      },
    )
    .refine((values: PolicyFormValues) => values.expirationStrategy != null, {
      path: ["expirationStrategy"],
      message: "Required for Timed policies",
    })
    .refine((values: PolicyFormValues) => values.expirationBasis != null, {
      path: ["expirationBasis"],
      message: "Required for Timed policies",
    })
    .refine((values: PolicyFormValues) => values.renewalBasis != null, {
      path: ["renewalBasis"],
      message: "Required for Timed policies",
    })
    .refine((values: PolicyFormValues) => values.transferStrategy != null, {
      path: ["transferStrategy"],
      message: "Required for Timed policies",
    })

export const PerpetualShape = z.object({
  duration: z.null().default(null),
})

export const PerpetualRules = (
  schema: z.ZodType<PolicyFormValues>,
): z.ZodType<PolicyFormValues> =>
  schema.refine((values: PolicyFormValues) => values.duration == null, {
    path: ["duration"],
    message: "Must be null for Perpetual policies",
  })

export const PerpetualFallbackShape = z.object({
  expirationStrategy: z
    .nativeEnum(ExpirationStrategy)
    .nullish()
    .default(ExpirationStrategy.MAINTAIN_ACCESS),
})

export const NodeLockedShape = z.object({
  requireFingerprintScope: z.boolean().default(true),
  floating: z.boolean().default(true),
  maxMachines: z.coerce.number().int().min(1).optional().default(1),
})

export const NodeLockedRules = (
  schema: z.ZodType<PolicyFormValues>,
): z.ZodType<PolicyFormValues> =>
  schema
    .refine(
      (values: PolicyFormValues) =>
        values.maxMachines == null ||
        values.floating ||
        values.maxMachines === 1,
      {
        path: ["maxMachines"],
        message: "Non‑floating must be 1 or unlimited",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !values.floating ||
        values.maxMachines == null ||
        values.maxMachines > 0,
      {
        path: ["maxMachines"],
        message: "Must be greater than 0 when floating",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.machineUniquenessStrategy != null,
      {
        path: ["machineUniquenessStrategy"],
        message: "Required for Node-locked policies",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.machineMatchingStrategy != null,
      {
        path: ["machineMatchingStrategy"],
        message: "Required for Node-locked policies",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.componentUniquenessStrategy != null,
      {
        path: ["componentUniquenessStrategy"],
        message: "Required for Node-locked policies",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.componentMatchingStrategy != null,
      {
        path: ["componentMatchingStrategy"],
        message: "Required for Node-locked policies",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        !(
          values.requireFingerprintScope ||
          (values.maxMachines != null && values.maxMachines > 0)
        ) || values.overageStrategy != null,
      {
        path: ["overageStrategy"],
        message: "Required for Node-locked policies",
      },
    )

export const UserLockedShape = z.object({
  requireUserScope: z.boolean().default(true),
})

export const ProcessBasedShape = z.object({
  machineLeasingStrategy: z
    .nativeEnum(MachineLeasingStrategy)
    .nullish()
    .default(MachineLeasingStrategy.PER_LICENSE),
  processLeasingStrategy: z
    .nativeEnum(ProcessLeasingStrategy)
    .nullish()
    .default(ProcessLeasingStrategy.PER_MACHINE),
})

export const ProcessBasedRules = (
  schema: z.ZodType<PolicyFormValues>,
): z.ZodType<PolicyFormValues> =>
  schema
    .refine(
      (values: PolicyFormValues) => values.machineLeasingStrategy != null,
      {
        path: ["machineLeasingStrategy"],
        message: "Required for Process-based policies",
      },
    )
    .refine(
      (values: PolicyFormValues) => values.processLeasingStrategy != null,
      {
        path: ["processLeasingStrategy"],
        message: "Required for Process-based policies",
      },
    )

export const LeaseBasedShape = z.object({
  requireHeartbeat: z.boolean().default(true),
  heartbeatDuration: z
    .union([z.coerce.number().int(), z.null(), z.undefined()])
    .default(60),
  heartbeatBasis: z
    .nativeEnum(HeartbeatBasis)
    .nullish()
    .default(HeartbeatBasis.FROM_CREATION),
  heartbeatCullStrategy: z
    .nativeEnum(HeartbeatCullStrategy)
    .nullish()
    .default(HeartbeatCullStrategy.DEACTIVATE_DEAD),
  heartbeatResurrectionStrategy: z
    .nativeEnum(HeartbeatResurrectionStrategy)
    .nullish()
    .default(HeartbeatResurrectionStrategy.NO_REVIVE),
})

export const LeaseBasedRules = (
  schema: z.ZodType<PolicyFormValues>,
): z.ZodType<PolicyFormValues> =>
  schema
    .refine((values: PolicyFormValues) => values.requireHeartbeat === true, {
      path: ["requireHeartbeat"],
      message: "Required for Lease‑based policies",
    })
    .refine(
      (values: PolicyFormValues) =>
        values.heartbeatDuration != null && values.heartbeatDuration >= 60,
      {
        path: ["heartbeatDuration"],
        message: "Must be at least 60 seconds",
      },
    )
    .refine((values: PolicyFormValues) => values.heartbeatBasis != null, {
      path: ["heartbeatBasis"],
      message: "Required for Lease‑based policies",
    })
    .refine(
      (values: PolicyFormValues) => values.heartbeatCullStrategy != null,
      {
        path: ["heartbeatCullStrategy"],
        message: "Required for Lease‑based policies",
      },
    )
    .refine(
      (values: PolicyFormValues) =>
        values.heartbeatResurrectionStrategy != null,
      {
        path: ["heartbeatResurrectionStrategy"],
        message: "Required for Lease‑based policies",
      },
    )

export const OfflineShape = z.object({
  authenticationStrategy: z
    .nativeEnum(AuthenticationStrategy)
    .nullish()
    .default(AuthenticationStrategy.LICENSE),
})

export function composePolicySchema(selection: {
  timing?: TimingTemplates | null
  access?: AccessTemplates[]
  metered?: MeteredTemplates[]
  offline?: boolean
}): z.ZodType<PolicyFormValues> {
  const access = selection.access ?? []
  const metered = selection.metered ?? []
  const requiresNodeLocked =
    access.includes(AccessTemplates.NODE_LOCKED) ||
    metered.includes(MeteredTemplates.PROCESS_BASED) ||
    metered.includes(MeteredTemplates.LEASE_BASED)

  let shape: z.ZodObject<z.ZodRawShape> = BaseShape

  if (selection.timing === TimingTemplates.TIMED) {
    shape = shape.merge(TimedShape)
  } else if (selection.timing === TimingTemplates.PERPETUAL) {
    shape = shape.merge(PerpetualShape)
  } else if (selection.timing === TimingTemplates.PERPETUAL_FALLBACK) {
    shape = shape.merge(TimedShape).merge(PerpetualFallbackShape)
  }
  if (requiresNodeLocked) shape = shape.merge(NodeLockedShape)
  if (access.includes(AccessTemplates.USER_LOCKED))
    shape = shape.merge(UserLockedShape)
  if (metered.includes(MeteredTemplates.PROCESS_BASED))
    shape = shape.merge(ProcessBasedShape)
  if (metered.includes(MeteredTemplates.LEASE_BASED))
    shape = shape.merge(LeaseBasedShape)
  if (selection.offline) shape = shape.merge(OfflineShape)

  let schema: z.ZodType<PolicyFormValues> =
    shape as unknown as z.ZodType<PolicyFormValues>
  if (selection.timing === TimingTemplates.TIMED) {
    schema = TimedRules(schema)
  }
  if (selection.timing === TimingTemplates.PERPETUAL) {
    schema = PerpetualRules(schema)
  }
  if (selection.timing === TimingTemplates.PERPETUAL_FALLBACK) {
    schema = TimedRules(schema)
  }
  if (requiresNodeLocked) {
    schema = NodeLockedRules(schema)
  }
  if (metered.includes(MeteredTemplates.PROCESS_BASED)) {
    schema = ProcessBasedRules(schema)
  }
  if (metered.includes(MeteredTemplates.LEASE_BASED)) {
    schema = LeaseBasedRules(schema)
  }

  return schema
}

export function getSchemaDefaults<S extends z.ZodTypeAny>(
  schema: S,
): z.infer<S> {
  const parsed = schema.parse({ name: "temp", product: { id: "temp" } })

  parsed.name = ""
  parsed.product.id = ""

  return parsed as z.infer<S>
}

export function getFormValuesFromPolicy(policy: Policy): PolicyFormValues {
  return {
    name: policy.attributes.name,
    product: { id: policy.relationships.product?.data?.id ?? "" },
    metadata: policy.attributes.metadata ?? {},

    duration: policy.attributes.duration,
    expirationStrategy: policy.attributes.expirationStrategy,
    expirationBasis: policy.attributes.expirationBasis,
    renewalBasis: policy.attributes.renewalBasis,
    transferStrategy: policy.attributes.transferStrategy,

    strict: policy.attributes.strict,
    floating: policy.attributes.floating,
    protected: policy.attributes.protected,
    usePool: policy.attributes.usePool,

    requireCheckIn: policy.attributes.requireCheckIn,
    checkInInterval: policy.attributes.checkInInterval,
    checkInIntervalCount: policy.attributes.checkInIntervalCount,

    maxMachines: policy.attributes.maxMachines,
    maxProcesses: policy.attributes.maxProcesses,
    maxUsers: policy.attributes.maxUsers,
    maxUses: policy.attributes.maxUses,
    maxCores: policy.attributes.maxCores,

    requireProductScope: policy.attributes.requireProductScope,
    requirePolicyScope: policy.attributes.requirePolicyScope,
    requireMachineScope: policy.attributes.requireMachineScope,
    requireFingerprintScope: policy.attributes.requireFingerprintScope,
    requireComponentsScope: policy.attributes.requireComponentsScope,
    requireUserScope: policy.attributes.requireUserScope,
    requireChecksumScope: policy.attributes.requireChecksumScope,
    requireVersionScope: policy.attributes.requireVersionScope,

    requireHeartbeat: policy.attributes.requireHeartbeat,
    heartbeatDuration: policy.attributes.heartbeatDuration,
    heartbeatBasis: policy.attributes.heartbeatBasis,
    heartbeatCullStrategy: policy.attributes.heartbeatCullStrategy,
    heartbeatResurrectionStrategy:
      policy.attributes.heartbeatResurrectionStrategy,

    machineUniquenessStrategy: policy.attributes.machineUniquenessStrategy,
    machineMatchingStrategy: policy.attributes.machineMatchingStrategy,
    componentUniquenessStrategy: policy.attributes.componentUniquenessStrategy,
    componentMatchingStrategy: policy.attributes.componentMatchingStrategy,

    authenticationStrategy: policy.attributes.authenticationStrategy,
    machineLeasingStrategy: policy.attributes.machineLeasingStrategy,
    processLeasingStrategy: policy.attributes.processLeasingStrategy,
    overageStrategy: policy.attributes.overageStrategy,

    entitlements: {
      attach: (policy.relationships?.entitlements?.data ?? []).map((e) => e.id),
      create: [],
    },
  }
}
