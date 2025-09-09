import { useEffect } from "react"
import { useFormContext } from "react-hook-form"

import { ExpirationStrategy } from "@/types/policies"

import type { CreatePolicyFormValues } from "./modal"
import TimedForm from "./timed-form"

export default function PerpetualFallbackForm() {
  const { setValue } = useFormContext<CreatePolicyFormValues>()

  useEffect(() => {
    setValue("expirationStrategy", ExpirationStrategy.MAINTAIN_ACCESS, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }, [setValue])

  return <TimedForm />
}
