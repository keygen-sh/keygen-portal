import { useState } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/assets/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/assets/components/ui/form"
import { Input } from "@/assets/components/ui/input"

import * as keygen from "@keygen/index"
import { useAuth } from "@hooks/useAuth"
import * as Loading from "@components/Loading"

const emailSchema = z.object({
  username: z.string().email("Please enter a valid email."),
})

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { setEmail } = useAuth()

  const navigate = useNavigate()

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { username: "" },
  })

  async function onSubmitEmail() {
    setLoading(true)
    setServerError(null)

    const email = emailForm.getValues().username

    try {
      const { errors } = await keygen.authenticate({ email })
      const { code } = errors[0]

      setEmail(email)

      if (code === "PASSWORD_REQUIRED" || code === "EMAIL_INVALID") {
        void navigate({ to: `/${keygen.config.id}/auth/password` })

        return
      } else if (code === "OTP_REQUIRED") {
        void navigate({ to: `/${keygen.config.id}/auth/verify` })

        return
      } else {
        throw new Error(errors[0]?.detail)
      }
    } catch (error) {
      console.error(error)
      setServerError("Service is unavailable. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...emailForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void emailForm.handleSubmit(onSubmitEmail)(e)
          }}
          noValidate
          className="my-3 w-full space-y-7"
        >
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Sign in to your account
          </h1>

          <FormField
            control={emailForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-content-muted">
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="username"
                    autoFocus
                    placeholder="Enter email..."
                    onChange={(e) => {
                      field.onChange(e)
                      setServerError(null)
                    }}
                  />
                </FormControl>
                <FormMessage>{serverError}</FormMessage>
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loading.Dots color="bg-background" /> : "Continue"}
          </Button>
        </form>
      </Form>

      <div className="space-x-2 rounded border border-content-subdued p-2 text-center text-sm select-none">
        <span className="text-content-subdued">No account yet?</span>
        <Button
          asChild
          variant="link"
          size="link"
          className="text-content-loud"
        >
          <Link
            to="/$id/auth/register"
            className="text-content-main underline-slide py-0.5 font-bold"
            params={{ id: keygen.config.id }}
          >
            Create one
          </Link>
        </Button>
      </div>

      <div className="mt-2 flex w-full justify-center select-none">
        <Button
          variant="link"
          size="link"
          asChild
          className={`${
            loading
              ? "pointer-events-none text-content-disabled"
              : "pointer-events-auto text-content-loud"
          }`}
        >
          <Link to="/$id/auth/sso" params={{ id: keygen.config.id }}>
            Sign in with SSO
          </Link>
        </Button>
      </div>
    </section>
  )
}
