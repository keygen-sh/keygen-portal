import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { Writable, OptionalExcept } from "@/types/utility"
import {
  Policy,
  PolicyAttributes,
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
import { MetadataPairsSchema, recordToMetadataPairs } from "@/schemas/metadata"

export type BaseValues = Writable<OptionalExcept<PolicyAttributes, "name">> & {
  entitlements?: {
    attach?: string[]
    create?: {
      name: string
      code: string
      metadata?: Record<string, unknown>
    }[]
  }
}
export type CreateValues = BaseValues & { product: { id: string } }
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames = Exclude<
  FieldPath<AllValues>,
  "scheme" | "encrypted" | "entitlements" | "product.id"
>

type PolicySchema = z.ZodType<
  BaseValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape>
>

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
  checkInIntervalCount: z.coerce
    .number()
    .int()
    .nullish()
    .transform((value) => (value === 0 ? null : value)),

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
  maxCores: z.coerce.number().int().positive().nullish(),
  protected: z.boolean().default(true),

  requireHeartbeat: z.boolean().default(false),
  heartbeatDuration: z.coerce
    .number()
    .int()
    .nullish()
    .transform((value) => (value === 0 ? null : value)),
  heartbeatCullStrategy: z
    .nativeEnum(HeartbeatCullStrategy)
    .nullish()
    .default(HeartbeatCullStrategy.DeactivateDead),
  heartbeatResurrectionStrategy: z
    .nativeEnum(HeartbeatResurrectionStrategy)
    .nullish()
    .default(HeartbeatResurrectionStrategy.NoRevive),
  heartbeatBasis: z
    .nativeEnum(HeartbeatBasis)
    .nullish()
    .default(HeartbeatBasis.FromFirstPing),
  machineUniquenessStrategy: z
    .nativeEnum(MachineUniquenessStrategy)
    .nullish()
    .default(MachineUniquenessStrategy.UniquePerLicense),
  machineMatchingStrategy: z
    .nativeEnum(MachineMatchingStrategy)
    .nullish()
    .default(MachineMatchingStrategy.MatchAny),
  componentUniquenessStrategy: z
    .nativeEnum(ComponentUniquenessStrategy)
    .nullish()
    .default(ComponentUniquenessStrategy.UniquePerMachine),
  componentMatchingStrategy: z
    .nativeEnum(ComponentMatchingStrategy)
    .nullish()
    .default(ComponentMatchingStrategy.MatchAny),
  expirationStrategy: z
    .nativeEnum(ExpirationStrategy)
    .nullish()
    .default(ExpirationStrategy.RestrictAccess),
  expirationBasis: z
    .nativeEnum(ExpirationBasis)
    .nullish()
    .default(ExpirationBasis.FromCreation),
  renewalBasis: z
    .nativeEnum(RenewalBasis)
    .nullish()
    .default(RenewalBasis.FromExpiry),
  transferStrategy: z
    .nativeEnum(TransferStrategy)
    .nullish()
    .default(TransferStrategy.KeepExpiry),
  authenticationStrategy: z
    .nativeEnum(AuthenticationStrategy)
    .nullish()
    .default(AuthenticationStrategy.Mixed),
  machineLeasingStrategy: z
    .nativeEnum(MachineLeasingStrategy)
    .nullish()
    .default(MachineLeasingStrategy.PerLicense),
  processLeasingStrategy: z
    .nativeEnum(ProcessLeasingStrategy)
    .nullish()
    .default(ProcessLeasingStrategy.PerMachine),
  overageStrategy: z
    .nativeEnum(OverageStrategy)
    .nullish()
    .default(OverageStrategy.NoOverage),
  metadata: MetadataPairsSchema,

  entitlements: z
    .object({
      attach: z.array(z.string()).default([]),
      create: z
        .array(
          z.object({
            name: z.string().min(1),
            code: z.string().min(1),
            metadata: MetadataPairsSchema.optional(),
          }),
        )
        .default([]),
    })
    .default({ attach: [], create: [] }),
})

export const BaseRules = (schema: PolicySchema): PolicySchema =>
  schema
    .refine(
      (values: BaseValues) =>
        values.duration == null || values.expirationStrategy != null,
      {
        path: ["expirationStrategy"],
        message: "Required when duration is set",
      },
    )
    .refine(
      (values: BaseValues) =>
        values.duration == null || values.expirationBasis != null,
      {
        path: ["expirationBasis"],
        message: "Required when duration is set",
      },
    )
    .refine(
      (values: BaseValues) =>
        values.duration == null || values.renewalBasis != null,
      {
        path: ["renewalBasis"],
        message: "Required when duration is set",
      },
    )
    .refine(
      (values: BaseValues) =>
        values.duration == null || values.transferStrategy != null,
      {
        path: ["transferStrategy"],
        message: "Required when duration is set",
      },
    )
    .refine(
      (values: BaseValues) =>
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
      (values: BaseValues) =>
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
      (values: BaseValues) =>
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
      (values: BaseValues) =>
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
      (values: BaseValues) =>
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
      (values: BaseValues) =>
        !values.requireHeartbeat ||
        (values.heartbeatDuration != null && values.heartbeatDuration >= 60),
      {
        path: ["heartbeatDuration"],
        message: "Must be at least 60 seconds",
      },
    )
    .refine(
      (values: BaseValues) =>
        !values.requireHeartbeat || values.heartbeatBasis != null,
      {
        path: ["heartbeatBasis"],
        message: "Required when heartbeat is enabled",
      },
    )
    .refine(
      (values: BaseValues) =>
        !values.requireHeartbeat || values.heartbeatCullStrategy != null,
      {
        path: ["heartbeatCullStrategy"],
        message: "Required when heartbeat is enabled",
      },
    )
    .refine(
      (values: BaseValues) =>
        !values.requireHeartbeat ||
        values.heartbeatResurrectionStrategy != null,
      {
        path: ["heartbeatResurrectionStrategy"],
        message: "Required when heartbeat is enabled",
      },
    )
    .refine(
      (values: BaseValues) =>
        values.checkInInterval == null ||
        (values.checkInIntervalCount != null &&
          values.checkInIntervalCount >= 1 &&
          values.checkInIntervalCount <= 365),
      {
        path: ["checkInIntervalCount"],
        message: "Must be a number between 1 and 365",
      },
    )

export const ProductShape = z.object({
  product: z.object({
    id: z
      .string({ required_error: "Product is required" })
      .min(1, "Product is required."),
  }),
})

export const BaseSchema: z.ZodType<
  BaseValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape>
> = BaseRules(BaseShape as unknown as PolicySchema)
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> & z.input<typeof ProductShape>
> = BaseRules(
  BaseShape.merge(ProductShape) as unknown as PolicySchema,
) as unknown as z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> & z.input<typeof ProductShape>
>
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  Partial<z.input<typeof BaseShape>>
> = BaseSchema

export type BaseInputValues = z.input<typeof BaseSchema>
export type CreateInputValues = z.input<typeof CreateSchema>
export type UpdateInputValues = z.input<typeof UpdateSchema>
export type AllInputValues = CombineFormValues<
  BaseInputValues,
  CreateInputValues,
  UpdateInputValues
>

export enum TimingTemplates {
  Perpetual = "PERPETUAL",
  Timed = "TIMED",
  PerpetualFallback = "PERPETUAL_FALLBACK",
}
export enum AccessTemplates {
  NodeLocked = "NODE_LOCKED",
  UserLocked = "USER_LOCKED",
}
export enum MeteredTemplates {
  ProcessBased = "PROCESS_BASED",
  LeaseBased = "LEASE_BASED",
  FeatureBased = "FEATURE_BASED",
  UsageBased = "USAGE_BASED",
}

export const TemplateSchema = z.object({
  timing: z.nativeEnum(TimingTemplates).nullable().optional(),
  access: z.array(z.nativeEnum(AccessTemplates)).default([]),
  metered: z.array(z.nativeEnum(MeteredTemplates)).default([]),
  advanced: z.boolean().default(true),
  offline: z.boolean().default(false),
})

export type TemplateValues = z.infer<typeof TemplateSchema>

export const TimedShape = z.object({
  duration: z.coerce.number().int().positive().nullish().default(1209600),
  renewalBasis: z
    .nativeEnum(RenewalBasis)
    .nullish()
    .default(RenewalBasis.FromNowIfExpired),
  transferStrategy: z
    .nativeEnum(TransferStrategy)
    .nullish()
    .default(TransferStrategy.ResetExpiry),
})

export const TimedRules = (schema: PolicySchema): PolicySchema =>
  schema
    .refine(
      (values: BaseValues) => values.duration != null && values.duration > 0,
      {
        path: ["duration"],
        message: "Cannot be empty for Timed policies",
      },
    )
    .refine((values: BaseValues) => values.expirationStrategy != null, {
      path: ["expirationStrategy"],
      message: "Required for Timed policies",
    })
    .refine((values: BaseValues) => values.expirationBasis != null, {
      path: ["expirationBasis"],
      message: "Required for Timed policies",
    })
    .refine((values: BaseValues) => values.renewalBasis != null, {
      path: ["renewalBasis"],
      message: "Required for Timed policies",
    })
    .refine((values: BaseValues) => values.transferStrategy != null, {
      path: ["transferStrategy"],
      message: "Required for Timed policies",
    })

export const PerpetualShape = z.object({
  duration: z.null().default(null),
})

export const PerpetualRules = (schema: PolicySchema): PolicySchema =>
  schema.refine((values: BaseValues) => values.duration == null, {
    path: ["duration"],
    message: "Must be null for Perpetual policies",
  })

export const PerpetualFallbackShape = z.object({
  expirationStrategy: z
    .nativeEnum(ExpirationStrategy)
    .nullish()
    .default(ExpirationStrategy.MaintainAccess),
})

export const NodeLockedShape = z.object({
  requireFingerprintScope: z.boolean().default(true),
  floating: z.boolean().default(true),
  maxMachines: z.coerce.number().int().min(1).optional().default(1),
})

export const NodeLockedRules = (schema: PolicySchema): PolicySchema =>
  schema
    .refine(
      (values: BaseValues) =>
        values.maxMachines == null ||
        values.floating ||
        values.maxMachines === 1,
      {
        path: ["maxMachines"],
        message: "Non‑floating must be 1 or unlimited",
      },
    )
    .refine(
      (values: BaseValues) =>
        !values.floating ||
        values.maxMachines == null ||
        values.maxMachines > 0,
      {
        path: ["maxMachines"],
        message: "Must be greater than 0 when floating",
      },
    )
    .refine(
      (values: BaseValues) =>
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
      (values: BaseValues) =>
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
      (values: BaseValues) =>
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
      (values: BaseValues) =>
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
      (values: BaseValues) =>
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
    .default(MachineLeasingStrategy.PerLicense),
  processLeasingStrategy: z
    .nativeEnum(ProcessLeasingStrategy)
    .nullish()
    .default(ProcessLeasingStrategy.PerMachine),
})

export const ProcessBasedRules = (schema: PolicySchema): PolicySchema =>
  schema
    .refine((values: BaseValues) => values.machineLeasingStrategy != null, {
      path: ["machineLeasingStrategy"],
      message: "Required for Process-based policies",
    })
    .refine((values: BaseValues) => values.processLeasingStrategy != null, {
      path: ["processLeasingStrategy"],
      message: "Required for Process-based policies",
    })

export const LeaseBasedShape = z.object({
  requireHeartbeat: z.boolean().default(true),
  heartbeatDuration: z.coerce
    .number()
    .int()
    .nullish()
    .transform((value) => (value === 0 ? null : value))
    .default(600),
  heartbeatBasis: z
    .nativeEnum(HeartbeatBasis)
    .nullish()
    .default(HeartbeatBasis.FromCreation),
  heartbeatCullStrategy: z
    .nativeEnum(HeartbeatCullStrategy)
    .nullish()
    .default(HeartbeatCullStrategy.DeactivateDead),
  heartbeatResurrectionStrategy: z
    .nativeEnum(HeartbeatResurrectionStrategy)
    .nullish()
    .default(HeartbeatResurrectionStrategy.NoRevive),
})

export const LeaseBasedRules = (schema: PolicySchema): PolicySchema =>
  schema
    .refine((values: BaseValues) => values.requireHeartbeat === true, {
      path: ["requireHeartbeat"],
      message: "Required for Lease‑based policies",
    })
    .refine(
      (values: BaseValues) =>
        values.heartbeatDuration != null && values.heartbeatDuration >= 60,
      {
        path: ["heartbeatDuration"],
        message: "Must be at least 60 seconds",
      },
    )
    .refine((values: BaseValues) => values.heartbeatBasis != null, {
      path: ["heartbeatBasis"],
      message: "Required for Lease‑based policies",
    })
    .refine((values: BaseValues) => values.heartbeatCullStrategy != null, {
      path: ["heartbeatCullStrategy"],
      message: "Required for Lease‑based policies",
    })
    .refine(
      (values: BaseValues) => values.heartbeatResurrectionStrategy != null,
      {
        path: ["heartbeatResurrectionStrategy"],
        message: "Required for Lease‑based policies",
      },
    )

export const OfflineShape = z.object({
  authenticationStrategy: z
    .nativeEnum(AuthenticationStrategy)
    .nullish()
    .default(AuthenticationStrategy.License),
})

export type PolicyTemplateSelection = {
  timing: TimingTemplates | null
  access: AccessTemplates[]
  metered: MeteredTemplates[]
  advanced?: boolean
  offline?: boolean
}

export function composePolicySchema<
  TOut extends BaseValues = BaseValues,
  TIn extends BaseInputValues = BaseInputValues,
>(
  selection: {
    timing?: TimingTemplates | null
    access?: AccessTemplates[]
    metered?: MeteredTemplates[]
    offline?: boolean
  },
  options?: { product?: boolean },
): z.ZodType<TOut, z.ZodTypeDef, TIn> {
  const access = selection.access ?? []
  const metered = selection.metered ?? []
  const requiresNodeLocked =
    access.includes(AccessTemplates.NodeLocked) ||
    metered.includes(MeteredTemplates.ProcessBased) ||
    metered.includes(MeteredTemplates.LeaseBased)

  let shape: z.ZodObject<z.ZodRawShape> = BaseShape

  if (options?.product) {
    shape = shape.merge(ProductShape)
  }

  if (selection.timing === TimingTemplates.Timed) {
    shape = shape.merge(TimedShape)
  } else if (selection.timing === TimingTemplates.Perpetual) {
    shape = shape.merge(PerpetualShape)
  } else if (selection.timing === TimingTemplates.PerpetualFallback) {
    shape = shape.merge(TimedShape).merge(PerpetualFallbackShape)
  }
  if (requiresNodeLocked) shape = shape.merge(NodeLockedShape)
  if (access.includes(AccessTemplates.UserLocked))
    shape = shape.merge(UserLockedShape)
  if (metered.includes(MeteredTemplates.ProcessBased))
    shape = shape.merge(ProcessBasedShape)
  if (metered.includes(MeteredTemplates.LeaseBased))
    shape = shape.merge(LeaseBasedShape)
  if (selection.offline) shape = shape.merge(OfflineShape)

  let schema: PolicySchema = shape as unknown as PolicySchema
  if (selection.timing === TimingTemplates.Timed) {
    schema = TimedRules(schema)
  }
  if (selection.timing === TimingTemplates.Perpetual) {
    schema = PerpetualRules(schema)
  }
  if (selection.timing === TimingTemplates.PerpetualFallback) {
    schema = TimedRules(schema)
  }
  if (requiresNodeLocked) {
    schema = NodeLockedRules(schema)
  }
  if (metered.includes(MeteredTemplates.ProcessBased)) {
    schema = ProcessBasedRules(schema)
  }
  if (metered.includes(MeteredTemplates.LeaseBased)) {
    schema = LeaseBasedRules(schema)
  }

  return schema as unknown as z.ZodType<TOut, z.ZodTypeDef, TIn>
}

export function getCreateSchemaDefaults<T extends CreateInputValues>(
  schema: z.ZodType<unknown, z.ZodTypeDef, T>,
): T {
  // Parse schema with temporary values since schema requires `name` and `product.id`
  const parsed = schema.parse({
    name: "temp",
    product: { id: "temp" },
  }) as T

  // Empty strings so form initializes with empty fields
  parsed.name = ""
  parsed.product.id = ""
  // Reset metadata to the form-input shape i.e. MetadataPair[]
  parsed.metadata = []

  return parsed
}

export function getFormValuesFromPolicy<
  T extends BaseInputValues = BaseInputValues,
>(policy: Policy, options?: { product?: boolean }): T {
  const base: BaseInputValues = {
    name: policy.attributes.name,
    metadata: recordToMetadataPairs(policy.attributes.metadata),

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

  if (options?.product) {
    return {
      ...base,
      product: { id: policy.relationships.product?.data?.id ?? "" },
    } as unknown as T
  }

  return base as T
}
