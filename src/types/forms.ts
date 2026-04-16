import { FieldPath, FieldValues } from "react-hook-form"

export type FormFieldError<TFieldValues extends FieldValues = FieldValues> = {
  path: FieldPath<TFieldValues>
  message: string
}

export type CombineFormValues<
  Base,
  Create = Base,
  Update = Partial<Base>,
> = Base & Create & Update

export type FormSize = "default" | "compact" | "fullscreen"
