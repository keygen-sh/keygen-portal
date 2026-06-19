import { useForm } from "react-hook-form"
import { useNavigate } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"

import * as keygen from "@/keygen"
import * as Schemas from "@/schemas"
import * as Forms from "@/components/forms"

import Fields from "./fields"
import * as Loading from "@/components/loading"

export default function ResetForm() {
  const navigate = useNavigate()

  const form = useForm<Schemas.Auth.ResetValues>({
    resolver: zodResolver(Schemas.Auth.ResetSchema),
    mode: "onChange",
    defaultValues: { password: "" },
  })

  function onSubmit() {
    // TODO(cazden) Handle password reset
    void navigate({
      to: "/$accountId/app/dashboard",
      params: { accountId: keygen.config.id },
    })
  }

  const { isSubmitting } = form.formState

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Page>
        <section className="flex w-80 flex-col justify-center">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void form.handleSubmit(onSubmit)(e)
            }}
            noValidate
            className="my-3 space-y-7"
          >
            <Forms.Section.Header variant="auth">
              Set a new password
            </Forms.Section.Header>

            <Fields include={["newPassword"]} autoFocus="newPassword" />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </section>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
