import { useForm } from "react-hook-form"
import { useNavigate } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"

import * as Schemas from "@/schemas"
import * as Forms from "@/components/forms"

import Fields from "./fields"
import * as Loading from "@/components/loading"

export default function AccountForm() {
  const navigate = useNavigate()

  const form = useForm<Schemas.Auth.AccountValues>({
    resolver: zodResolver(Schemas.Auth.AccountSchema),
    mode: "onChange",
    defaultValues: { slug: "" },
  })

  function onSubmit({ slug }: Schemas.Auth.AccountValues) {
    void navigate({
      to: "/$accountId/auth/login",
      params: { accountId: slug.trim() },
    })
  }

  const { isSubmitting } = form.formState

  return (
    <Forms.Provider form={form} guard={false}>
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
            <Forms.Section.Header variant="auth">
              Sign in to your account
            </Forms.Section.Header>

            <Fields include={["slug"]} autoFocus="slug" />

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
