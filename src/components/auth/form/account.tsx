import { useForm } from "react-hook-form"
import { useNavigate } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"

import * as Schemas from "@/schemas"
import * as Forms from "@/components/forms"

import { addRecentAccount } from "@/lib/accounts"

import Fields from "./fields"
import * as Loading from "@/components/loading"

export default function AccountForm() {
  const navigate = useNavigate()

  const form = useForm<Schemas.Auth.AccountValues>({
    resolver: zodResolver(Schemas.Auth.AccountSchema),
    mode: "onChange",
    defaultValues: { account: "" },
  })

  function onSubmit({ account }: Schemas.Auth.AccountValues) {
    const id = account.trim()

    addRecentAccount({ id })

    void navigate({
      to: "/$accountId/auth/login",
      params: { accountId: id },
    })
  }

  const isSubmitting = form.formState.isSubmitting

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
            className="my-3 w-full space-y-7"
          >
            <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
              Sign in to your account
            </h1>

            <Fields include={["account"]} autoFocus="account" />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </section>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
