import { z } from "zod"

export const NumberSchema = z.number({ invalid_type_error: "Must be a number" })
export const CoercedNumberSchema = z.coerce.number({
  invalid_type_error: "Must be a number",
})
