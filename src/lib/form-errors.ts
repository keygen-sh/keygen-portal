import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

import { APIError } from "@/types/api"

import { toast } from "@/lib/toast"

export type ErrorFieldMapping<TFieldValues extends FieldValues> = {
  code: string
  field: FieldPath<TFieldValues>
  message?: string
}

export type FormStep<TFieldValues extends FieldValues> = {
  key: string
  fields?: FieldPath<TFieldValues>[]
}

export type HandleFormErrorOptions<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  error: APIError
  fieldMappings?: ErrorFieldMapping<TFieldValues>[]
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
): boolean {
  const {
    form,
    error,
    fieldMappings = [],
    steps = [],
    goToStep,
    toastMessage,
    showToast = true,
  } = options

  let fieldSet = false
  let targetField: FieldPath<TFieldValues> | null = null
  let errorMessage: string | null = null

  if (error.code) {
    const mapping = fieldMappings.find((mapping) => mapping.code === error.code)
    if (mapping) {
      targetField = mapping.field
      errorMessage = mapping.message ?? error.detail ?? "Field is invalid"
    }
  }

  if (!targetField && error.source?.pointer) {
    const extractedField = extractFieldFromPointer(error.source.pointer)
    if (extractedField) {
      const isKnownField =
        fieldMappings.some((m) => String(m.field) === extractedField) ||
        steps.some((s) => s.fields?.some((f) => String(f) === extractedField))

      if (isKnownField) {
        targetField = extractedField as FieldPath<TFieldValues>
        errorMessage = error.detail ?? "Field is invalid"
      }
    }
  }

  if (targetField) {
    form.setError(targetField, {
      type: "manual",
      message: errorMessage ?? "Field is invalid",
    })
    fieldSet = true

    if (goToStep && steps.length > 0) {
      const stepIndex = findStepForField(targetField, steps)
      if (stepIndex >= 0) {
        goToStep(stepIndex)
      }
    }
  }

  if (showToast) {
    toast({
      message: toastMessage,
      description: error.detail ?? error.message,
      variant: "error",
    })
  }

  return fieldSet
}

export function createFormErrorHandler<TFieldValues extends FieldValues>(
  baseOptions: Omit<HandleFormErrorOptions<TFieldValues>, "error">,
) {
  return (error: APIError) => handleFormError({ ...baseOptions, error })
}
