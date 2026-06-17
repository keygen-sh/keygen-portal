import { useState } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

import * as keygen from "@/keygen"
import * as Schemas from "@/schemas"

import Fields from "./fields"
import * as Loading from "@/components/loading"

export default function RegisterForm() {
  const navigate = useNavigate()
  const [showIdField, setShowIdField] = useState(false)

  const form = useForm<Schemas.Auth.RegisterValues>({
    resolver: zodResolver(Schemas.Auth.RegisterSchema),
    mode: "onChange",
    defaultValues: { username: "", password: "", companyId: "" },
  })

  // TODO(cazden) API call to check if email is available
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function checkEmailAvailability(_email: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Dummy API call

    return false
  }

  async function onSubmit(values: Schemas.Auth.RegisterValues) {
    const isAvailable = await checkEmailAvailability(values.username)

    if (!isAvailable) {
      form.setError("username", {
        type: "manual",
        message: "This email is already registered.",
      })
      return
    }

    // Extract domain and slug from email
    const parts = values.username.split("@")
    const segments = parts[1].split(".")
    const domain = segments.slice(0, 2).join("-").toLowerCase()
    const slug = segments[0].toLowerCase()

    // Dummy domain check
    if (domain === "umbral-tech" && !values.companyId) {
      setShowIdField(true)
      form.setError("companyId", {
        type: "manual",
        message: "Company ID already exists for this domain",
      })
      return
    }

    // TODO(cazden) Handle account creation
    console.log(
      `Creating account for ${values.username} with slug: ${slug}${
        values.companyId ? ` and companyId: ${values.companyId}` : ""
      }`,
    )

    void navigate({
      to: "/$accountId/app/dashboard",
      params: { accountId: keygen.config.id },
    })
  }

  const isSubmitting = form.formState.isSubmitting

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
          <div className="flex flex-col space-y-4">
            <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
              Create an account
            </h1>
            <h2 className="text-sm text-content-muted">
              You're one step away from joining Keygen.
            </h2>
          </div>

          <Fields include={["username"]} autoFocus="username" />
          {showIdField && <Fields include={["companyId"]} />}
          <Fields include={["password"]} />

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
      </Form>

      <div className="space-x-2 rounded border border-content-subdued p-2 text-center text-sm select-none">
        <span className="text-content-subdued">Already got an account?</span>
        <Button
          asChild
          variant="link"
          size="link"
          className={
            isSubmitting
              ? "pointer-events-none text-content-disabled"
              : "pointer-events-auto text-content-loud"
          }
        >
          <Link
            to="/$accountId/auth/login"
            params={{ accountId: keygen.config.id }}
            className="py-0.5 font-bold"
          >
            Log in
          </Link>
        </Button>
      </div>
    </section>
  )
}
