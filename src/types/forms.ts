import { FieldPath, FieldValues } from "react-hook-form"

export type FormFieldError<TFieldValues extends FieldValues = FieldValues> = {
  path: FieldPath<TFieldValues>
  message: string
}
