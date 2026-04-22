import type { FieldValues, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"

// Typed wrapper around zodResolver that preserves the input-vs-output
// distinction required by useForm's 3-generic signature when the schema
// transforms its input (e.g. metadata: Pair[] → Record<string, unknown>).
export function typedZodResolver<
  TInput extends FieldValues,
  TOutput extends FieldValues,
>(
  schema: z.ZodType<TOutput, z.ZodTypeDef, TInput>,
): Resolver<TInput, unknown, TOutput> {
  return zodResolver(
    schema as unknown as z.ZodSchema<TOutput, z.ZodTypeDef, TOutput>,
  ) as unknown as Resolver<TInput, unknown, TOutput>
}
