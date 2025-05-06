import { useState, useEffect } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import * as keygen from "@/keygen/index"
import { useAuth } from "@/hooks/use-auth"
import * as Loading from "@/components/loading"

const emailSchema = z.object({
  username: z.string().email("Please enter a valid email."),
})

/**
 * Login component that validates user email and determines next authentication step.
 * Routes users to either password or OTP verification based on account settings.
 */
export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const auth = useAuth()

  const navigate = useNavigate()

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { username: "" },
  })

  // Unify global error state with local error state
  useEffect(() => {
    if (auth.error) {
      setError(auth.error)
    }
  }, [auth.error])

  async function onSubmitEmail() {
    setLoading(true)
    setError(null)
    auth.setError(null)

    const email = emailForm.getValues().username

    try {
      const { errors } = await keygen.authenticate({ email })
      const { code } = errors[0] as unknown as { code: keygen.ErrorCode }

      auth.setEmail(email)

      switch (code) {
        case keygen.ErrorCode.PASSWORD_REQUIRED:
          void navigate({ to: `/${keygen.config.id}/auth/password` })
          break
        case keygen.ErrorCode.OTP_REQUIRED:
          setError("Invalid email. Please try again.")
          break
        default:
          throw new Error(errors[0]?.detail)
      }
    } catch (error) {
      console.error(error)
      setError("Service is unavailable. Please try again later.")
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
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(e)
                      setError(null)
                    }}
                  />
                </FormControl>
                <FormMessage>{error}</FormMessage>
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
