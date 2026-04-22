import { z } from "zod"

// Values supported by the Keygen API for metadata. The API accepts any valid
// JSON, so we allow scalars (string, number, boolean, null) as well as
// arbitrarily nested objects and arrays.
export const MetadataValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(MetadataValueSchema),
    z.record(MetadataValueSchema),
  ]),
)

export type MetadataValue = z.infer<typeof MetadataValueSchema>

export const MetadataSchema = z.record(MetadataValueSchema).default({})
