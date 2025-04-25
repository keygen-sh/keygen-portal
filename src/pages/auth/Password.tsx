import { useState, useEffect } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { cn } from "@/assets/lib/utils"
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
import { Checkbox } from "@/assets/components/ui/checkbox"

import * as keygen from "@keygen/index"
import { useAuth } from "@hooks/useAuth"
import BackButton from "@components/BackButton"
import * as Loading from "@components/Loading"

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  remember: z.boolean().optional(),
})

/**
 * Password component that validates user email and password to authenticate user.
 * Routes users to either OTP verification or application based on account settings.
 */
export default function Password() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { email } = useAuth()

  const navigate = useNavigate()

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      remember: false,
    },
  })

  // Redirect to login if no email is present
  useEffect(() => {
    if (!email) {
      console.error("No email in context. Redirecting to login.")

      void navigate({ to: "/$id/auth/login", params: { id: keygen.config.id } })

      return
    }
  }, [email, navigate])

  async function onSubmitPassword() {
    setLoading(true)
    setServerError(null)

    const password = passwordForm.getValues().password

    if (!email) {
      console.error("No email in context. Redirecting to login.")
      void navigate({ to: "/$id/auth/login", params: { id: keygen.config.id } })

      return
    }

    try {
      const { data, errors } = await keygen.authenticate({
        email,
        password,
      })

      if (errors?.length) {
        const { code } = errors[0]

        /**
         * Return if password is invalid
         * Additionally, if email is invalid, handle the same to deter malicious attempts
         */
        if (code === "PASSWORD_INVALID" || code === "EMAIL_INVALID") {
          setServerError("Invalid password. Please try again.")

          return
        } else if (code === "OTP_REQUIRED") {
          void navigate({ to: `/${keygen.config.id}/auth/verify` })

          return
        } else {
          throw new Error(errors[0]?.detail)
        }
      } else {
        // Successfully authenticated
        localStorage.setItem(
          "token",
          (data as { attributes: { token: string } }).attributes.token,
        )

        void navigate({ to: "/$id/app/home", params: { id: keygen.config.id } })
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
      <Form {...passwordForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void passwordForm.handleSubmit(onSubmitPassword)(e)
          }}
          className="my-3 space-y-7"
        >
          <BackButton path="/auth/login" className="md:hidden" />
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Enter your password
          </h1>
          <FormField
            control={passwordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-content-muted">Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    variant="default"
                    type="password"
                    toggle={true}
                    autoComplete="current-password"
                    autoFocus
                    placeholder="Enter your password..."
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(e)
                      setServerError(null)
                    }}
                  />
                </FormControl>
                <FormMessage>{serverError}</FormMessage>

                <Button
                  variant="link"
                  size="link"
                  asChild
                  className={cn(
                    `${
                      loading
                        ? "pointer-events-none text-content-disabled"
                        : "pointer-events-auto text-secondary"
                    }`,
                    "w-fit",
                  )}
                >
                  <Link
                    to="/$id/auth/recovery"
                    params={{ id: keygen.config.id }}
                  >
                    Forgot password?
                  </Link>
                </Button>
              </FormItem>
            )}
          />

          <FormField
            control={passwordForm.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <FormLabel>Remember me on this device</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loading.Dots color="bg-background" /> : "Sign in"}
          </Button>
        </form>
      </Form>
    </section>
  )
}
