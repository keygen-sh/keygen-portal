import type { FieldValues, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"

// Wrapper around zodResolver for "transforming" schemas whose input (form state)
// differs from their output (serialized payload), e.g.:
//
//   metadata: MetadataPair[] -> Record<string, unknown>
//
// Preserves the input-vs-output distinction required by useForm's signature.
export function transformingZodResolver<
  TInput extends FieldValues,
  TOutput extends FieldValues,
>(
  schema: z.ZodType<TOutput, z.ZodTypeDef, TInput>,
): Resolver<TInput, unknown, TOutput> {
  return zodResolver(
    schema as unknown as z.ZodSchema<TOutput, z.ZodTypeDef, TOutput>,
  ) as unknown as Resolver<TInput, unknown, TOutput>
}
