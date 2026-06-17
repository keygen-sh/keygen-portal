import { useNavigate } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

import * as keygen from "@/keygen"
import * as Schemas from "@/schemas"

import Fields from "./fields"
import BackButton from "@/components/back-button"

export default function RecoveryForm() {
  const navigate = useNavigate()

  const form = useForm<Schemas.Auth.RecoveryValues>({
    resolver: zodResolver(Schemas.Auth.RecoverySchema),
    mode: "onChange",
    defaultValues: { username: "" },
  })

  function onSubmit() {
    // TODO(cazden): Handle SMTP
    void navigate({
      to: "/$accountId/auth/sent",
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
          className="my-3 w-full space-y-7"
        >
          <BackButton
            path="/auth/login"
            label="Return to Login"
            className="md:hidden"
          />
          <div className="flex flex-col space-y-4">
            <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
              Recover your password
            </h1>
            <p className="text-[13px] text-content-muted">
              Enter the email address associated with your account, and we'll
              send over a link to set a new one.
            </p>
          </div>

          <Fields include={["username"]} autoFocus="username" />

          <Button type="submit" size="lg" className="w-full">
            Continue
          </Button>
        </form>
      </Form>
    </section>
  )
}
