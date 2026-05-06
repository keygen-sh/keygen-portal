import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, Link } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import * as keygen from "@/keygen"

import { useAuth } from "@/hooks/use-auth"

import { AuthErrorCode } from "@/types/auth"

import * as Loading from "@/components/loading"

const emailSchema = z.object({
  username: z.string().email("Please enter a valid email."),
})

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const auth = useAuth()
  const error = localError || auth.error

  const navigate = useNavigate()

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { username: "" },
  })

  async function onSubmitEmail() {
    setLoading(true)
    setLocalError(null)
    auth.setError(null)

    const email = emailForm.getValues().username

    try {
      const response = await keygen.authenticate({ email })
      const { errors } = response || {}

      if (!errors?.length) {
        throw new Error("Service is unavailable.")
      }

      const err = errors[0] as {
        code: AuthErrorCode
        detail?: string
        links?: { redirect?: string | null }
      }

      auth.setEmail(email)

      switch (err.code) {
        case AuthErrorCode.PasswordRequired:
          void navigate({ to: `/${keygen.config.id}/auth/password` })
          break
        case AuthErrorCode.SsoRequired:
          if (err.links?.redirect) {
            auth.setSsoRedirectUrl(err.links.redirect)
            void navigate({ to: `/${keygen.config.id}/auth/sso` })
          } else {
            setLocalError("Single sign-on is unavailable.")
          }
          break
        case AuthErrorCode.OtpRequired:
          setLocalError("Invalid email. Please try again.")
          break
        default:
          throw new Error(err.detail)
      }
    } catch (error) {
      console.error(error)
      setLocalError("Service is unavailable. Please try again later.")
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
                      setLocalError(null)
                      auth.setError(null)
                    }}
                  />
                </FormControl>
                <FormMessage>{error}</FormMessage>
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loading.Dots className="bg-background" /> : "Continue"}
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
            to="/$accountId/auth/register"
            className="text-content-main underline-slide py-0.5 font-bold"
            params={{ accountId: keygen.config.id }}
          >
            Create one
          </Link>
        </Button>
      </div>
    </section>
  )
}
