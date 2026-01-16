import { z } from "zod"

import { Writable, OptionalExcept } from "@/types/api"
import { ComponentAttributes } from "@/types/components"

export type BaseValues = Writable<OptionalExcept<ComponentAttributes, "name">>
export type CreateValues = BaseValues & {
  fingerprint: string
  machineId: string
}
export type UpdateValues = Partial<BaseValues>

const BaseShape = z.object({
  name: z.string().trim().min(1, "Name is required"),
  metadata: z.record(z.unknown()).default({}),
})

const FingerprintShape = z.object({
  fingerprint: z.string().trim().min(1, "Fingerprint is required"),
})

const MachineRelationshipShape = z.object({
  machineId: z.string().min(1, "Machine is required"),
})

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<CreateValues> = BaseRules(
  BaseShape.merge(FingerprintShape).merge(MachineRelationshipShape),
) as z.ZodType<CreateValues>
export const UpdateSchema: z.ZodType<UpdateValues> = BaseSchema
