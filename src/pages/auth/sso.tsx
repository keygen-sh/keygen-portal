import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
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

import { useAuth } from "@/hooks/use-auth"

import * as keygen from "@/keygen"

import { AuthErrorCode } from "@/types/auth"

import * as Loading from "@/components/loading"
import ConfirmationModal from "@/components/confirmation-modal"

const ssoSchema = z.object({
  username: z.string().email("Please enter a valid email."),
})

export default function SSO() {
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [ssoRedirectUrl, setSsoRedirectUrl] = useState<string | null>(null)

  const auth = useAuth()
  const error = localError || auth.error

  const ssoForm = useForm<z.infer<typeof ssoSchema>>({
    resolver: zodResolver(ssoSchema),
    defaultValues: { username: auth.email ?? undefined },
  })

  async function fetchSsoRedirect(email: string) {
    setLoading(true)
    setLocalError(null)
    auth.setError(null)
    auth.setEmail(email)

    try {
      const response = await keygen.authenticate({ email })
      const { errors } = response || {}

      if (!errors?.length) {
        throw new Error("Service is unavailable.")
      }

      const err = errors[0] as {
        code?: AuthErrorCode
        detail?: string
        links?: { redirect?: string | null }
      }

      if (err.code === AuthErrorCode.SsoRequired && err.links?.redirect) {
        setSsoRedirectUrl(err.links.redirect)
        return
      }

      if (err.code === AuthErrorCode.SsoNotSupported) {
        setLocalError("Single sign-on is not enabled for this account.")
        return
      }

      setLocalError(err.detail ?? "Single sign-on is unavailable.")
    } catch (error) {
      console.error(error)
      setLocalError("Service is unavailable. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  function onSubmitSSO() {
    void fetchSsoRedirect(ssoForm.getValues().username)
  }

  useEffect(() => {
    if (auth.email) {
      void fetchSsoRedirect(auth.email)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...ssoForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void ssoForm.handleSubmit(onSubmitSSO)(e)
          }}
          noValidate
          className="my-3 w-full space-y-7"
        >
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Sign in with SSO
          </h1>
          <FormField
            control={ssoForm.control}
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
            params={{ accountId: keygen.config.id }}
            className="text-content-main underline-slide py-0.5 font-bold"
          >
            Create one
          </Link>
        </Button>
      </div>

      <div className="mt-2 flex w-full justify-center select-none">
        <Button variant="link" size="link" asChild>
          <Link
            to="/$accountId/auth/login"
            params={{ accountId: keygen.config.id }}
          >
            Use password instead
          </Link>
        </Button>
      </div>

      <ConfirmationModal
        open={ssoRedirectUrl !== null}
        title="Single Sign-On"
        label="Continue to IdP"
        onClose={() => setSsoRedirectUrl(null)}
        onConfirm={() => {
          if (ssoRedirectUrl) window.location.href = ssoRedirectUrl
        }}
      >
        <p className="text-sm text-content-subdued">
          <b>Your organization requires single sign-on</b>. You will be
          redirected to your organization's identity provider for
          authentication.
        </p>
      </ConfirmationModal>
    </section>
  )
}
