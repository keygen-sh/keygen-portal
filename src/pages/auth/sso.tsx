import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

import * as keygen from "@/keygen"

import { useAuth } from "@/hooks/use-auth"

import { AuthErrorCode } from "@/types/auth"

import * as Loading from "@/components/loading"
import BackButton from "@/components/back-button"

export default function Sso() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const auth = useAuth()
  const navigate = useNavigate()

  async function onContinue() {
    setLoading(true)
    setError(null)

    try {
      const { errors } = await keygen.authenticate({ email: auth.email! })

      if (!errors?.length) {
        throw new Error("Service is unavailable.")
      }

      const err = errors[0] as {
        code: AuthErrorCode
        detail?: string
        links?: { redirect?: string | null }
      }

      if (err.code === AuthErrorCode.SsoRequired && err.links?.redirect) {
        window.location.href = err.links.redirect
        return
      }

      throw new Error(err.detail ?? "Single sign-on is unavailable.")
    } catch (e) {
      console.error(e)
      setError("Service is unavailable. Please try again later.")
      setLoading(false)
    }
  }

  function onCancel() {
    void navigate({
      to: "/$accountId/auth/login",
      params: { accountId: keygen.config.id },
    })
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <div className="my-3 space-y-7">
        <BackButton path="/auth/login" className="md:hidden" />
        <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
          Single sign-on required
        </h1>
        <p className="text-sm text-content-muted">
          <b>Your organization requires single sign-on.</b> You will be
          redirected to your organization's identity provider for
          authentication.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1"
            autoFocus
            disabled={loading}
            onClick={onContinue}
          >
            {loading ? (
              <Loading.Dots className="bg-background" />
            ) : (
              "Continue to IdP"
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
