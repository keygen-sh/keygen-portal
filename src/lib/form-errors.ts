import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

import { APIError } from "@/types/api"

import { toast } from "@/lib/toast"
import { capitalize } from "@/lib/utils"

export type FormStep<TFieldValues extends FieldValues> = {
  key: string
  fields?: FieldPath<TFieldValues>[]
}

// Extracts the related form field from an API error pointer
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

// Iterates through all form steps for the step that contains the specified field
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

// Sequentially triggers validation for all form steps until a step fails then returns its index
async function findStepWithError<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  steps: FormStep<TFieldValues>[],
): Promise<number> {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (step.fields && step.fields.length > 0) {
      const valid = await form.trigger(step.fields)
      if (!valid) return i
    }
  }
  return -1
}

export type HandleFormErrorOptions<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  steps?: FormStep<TFieldValues>[]
  goToStep?: (index: number) => void
  apiError?: APIError
  showToast?: boolean
  toastMessage?: string
}

// Handles API and schema validation errors by setting field-level errors, navigating to the relevant step, and/or toasting
export async function handleFormError<TFieldValues extends FieldValues>(
  options: HandleFormErrorOptions<TFieldValues>,
): Promise<void> {
  const {
    form,
    steps = [],
    goToStep,
    apiError,
    showToast = true,
    toastMessage = "Failed to submit",
  } = options

  if (apiError) {
    const extractedField = extractFieldFromPointer(apiError.source?.pointer)
    const targetField = extractedField as FieldPath<TFieldValues>
    const isRegistered =
      extractedField != null && targetField in form.getValues()

    if (isRegistered) {
      form.setError(targetField, {
        type: "manual",
        message: capitalize(apiError.detail ?? "Field is invalid"),
      })

      // Navigate to form step that contains field pointer from API error
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

    // Fallback to detailed toast if pointer didn't resolve to a form field
    if (showToast) {
      toast({
        message: toastMessage,
        description: capitalize(apiError.detail ?? apiError.message),
        variant: "error",
      })
    }

    return
  }

  // Navigate to form step that contains error from failed schema validation
  if (goToStep && steps.length > 0) {
    const stepIndex = await findStepWithError(form, steps)
    if (stepIndex >= 0) {
      goToStep(stepIndex)
    }
  }

  // Generic error toast
  if (showToast) {
    toast({
      message: toastMessage,
      variant: "error",
    })
  }
}
