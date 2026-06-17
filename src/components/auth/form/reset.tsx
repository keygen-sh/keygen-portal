import { useNavigate } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

import * as keygen from "@/keygen"
import * as Schemas from "@/schemas"

import Fields from "./fields"

export default function ResetForm() {
  const navigate = useNavigate()

  const form = useForm<Schemas.Auth.ResetValues>({
    resolver: zodResolver(Schemas.Auth.ResetSchema),
    mode: "onChange",
    defaultValues: { password: "" },
  })

  function onSubmit() {
    // TODO(cazden) Handle previous password case & auth
    void navigate({
      to: "/$accountId/app/dashboard",
      params: { accountId: keygen.config.id },
    })
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit(onSubmit)(e)
          }}
          noValidate
          className="my-3 space-y-7"
        >
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Set a new password
          </h1>

          <Fields include={["newPassword"]} autoFocus="newPassword" />

          <Button type="submit" size="lg" className="w-full">
            Confirm & sign-in
          </Button>
        </form>
      </Form>
    </section>
  )
}
