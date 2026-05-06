import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

import * as keygen from "@/keygen"

import { useAuth } from "@/hooks/use-auth"

import * as Loading from "@/components/loading"
import BackButton from "@/components/back-button"

export default function Sso() {
  const [loading, setLoading] = useState(false)

  const auth = useAuth()
  const navigate = useNavigate()

  function onContinue() {
    if (!auth.ssoRedirectUrl) return

    setLoading(true)
    window.location.href = auth.ssoRedirectUrl
  }

  function onCancel() {
    auth.setSsoRedirectUrl(null)
    void navigate({
      to: "/$accountId/auth/login",
      params: { accountId: keygen.config.id },
    })
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <div className="space-y-4">
        <BackButton path="/auth/login" className="md:hidden" />
        <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
          Single sign-on required
        </h1>
        <p className="text-sm text-content-muted">
          <b>Your organization requires single sign-on.</b> You will be
          redirected to your organization's identity provider for
          authentication.
        </p>

        <div className="mt-8 flex gap-2">
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
