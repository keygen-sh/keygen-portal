import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

import { APIError } from "@/types/api"

import { toast } from "@/lib/toast"
import { capitalize } from "@/lib/utils"

export type FormStep<TFieldValues extends FieldValues> = {
  key: string
  fields?: FieldPath<TFieldValues>[]
}

export type HandleFormErrorOptions<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  error: APIError
  steps?: FormStep<TFieldValues>[]
  goToStep?: (index: number) => void
  toastMessage: string
  showToast?: boolean
}

function extractFieldFromPointer(pointer: string | undefined): string | null {
  if (!pointer) return null

  const attributesMatch = pointer.match(/\/data\/attributes\/(\w+)/)
  if (attributesMatch) return attributesMatch[1]

  const relationshipsMatch = pointer.match(/\/data\/relationships\/(\w+)/)
  if (relationshipsMatch) {
    return `${relationshipsMatch[1]}Id`
  }

  return null
}

function findStepForField<TFieldValues extends FieldValues>(
  field: FieldPath<TFieldValues>,
  steps: FormStep<TFieldValues>[],
): number {
  const fieldString = String(field)

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (!step.fields) continue

    for (const stepField of step.fields) {
      if (stepField === field) return i
      if (fieldString.startsWith(String(stepField))) return i
    }
  }

  return -1
}

export function handleFormError<TFieldValues extends FieldValues>(
  options: HandleFormErrorOptions<TFieldValues>,
): void {
  const {
    form,
    error,
    steps = [],
    goToStep,
    toastMessage,
    showToast = true,
  } = options

  const extractedField = extractFieldFromPointer(error.source?.pointer)
  if (extractedField) {
    const isKnownField = steps.some((s) =>
      s.fields?.some((f) => String(f) === extractedField),
    )

    if (isKnownField) {
      const targetField = extractedField as FieldPath<TFieldValues>

      form.setError(targetField, {
        type: "manual",
        message: error.detail ?? "Field is invalid",
      })

      if (goToStep && steps.length > 0) {
        const stepIndex = findStepForField(targetField, steps)
        if (stepIndex >= 0) {
          goToStep(stepIndex)
        }
      }

      if (showToast) {
        toast({
          message: toastMessage,
          variant: "error",
        })
      }

      return
    }
  }

  if (showToast) {
    toast({
      message: toastMessage,
      description: capitalize(error.detail ?? error.message),
      variant: "error",
    })
  }
}

export function createFormErrorHandler<TFieldValues extends FieldValues>(
  baseOptions: Omit<HandleFormErrorOptions<TFieldValues>, "error">,
) {
  return (error: APIError) => handleFormError({ ...baseOptions, error })
}
