import { useState, useCallback } from "react"
import { useNavigate } from "@tanstack/react-router"

import * as keygen from "@/keygen"

import { AuthErrorCode } from "@/types/auth"

import { useAuth } from "@/hooks/use-auth"
import { useSession } from "@/hooks/use-session"

import { isPortalAllowed } from "@/lib/permissions"

import * as Loading from "@/components/loading"
import { OtpInput } from "@/components/otp-input"
import BackButton from "@/components/back-button"

export default function Verify() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otp, setOtp] = useState("")

  const auth = useAuth()
  const session = useSession()

  const navigate = useNavigate()

  const handleSubmit = useCallback(
    async (code: string) => {
      setLoading(true)
      setError(null)

      try {
        const { data, errors } = await keygen.authenticate({
          email: auth.email!,
          password: auth.password!,
          otp: code,
        })

        if (errors?.length) {
          const { code } = errors[0] as unknown as { code: AuthErrorCode }

          switch (code) {
            case AuthErrorCode.OtpInvalid:
              setError("The code you entered is incorrect. Please try again.")
              setLoading(false)
              setOtp("")
              break
            case AuthErrorCode.PasswordInvalid:
              auth.setError("Invalid password. Please try again.")
              void navigate({
                to: "/$accountId/auth/password",
                params: { accountId: keygen.config.id },
              })
              break
            default:
              throw new Error(errors[0]?.detail)
          }

          return
        }

        const { id: tokenId, attributes, relationships } = data!
        const { token } = attributes
        const userId = relationships.bearer.data.id

        keygen.client.setRootToken(token)
        keygen.client.setTokenId(tokenId)

        const meResponse = await keygen.profiles.me()
        if (
          !meResponse.data ||
          !isPortalAllowed(meResponse.data.attributes.role)
        ) {
          await keygen.logout()
          auth.setError(
            "This account does not have access to the portal. Please contact your administrator.",
          )
          void navigate({
            to: "/$accountId/auth/login",
            params: { accountId: keygen.config.id },
          })
          return
        }

        const storage = auth.remember ? localStorage : sessionStorage
        storage.setItem("tokenId", tokenId)
        keygen.client.setTokenId(tokenId)

        if (!keygen.config.isCloud) {
          storage.setItem("token", token)
          keygen.client.setRootToken(token)
        }

        session.setUser(userId)

        void navigate({ to: "/" })
      } catch (error) {
        console.error(error)
        auth.setError("Service is unavailable. Please try again later.")

        void navigate({
          to: "/$accountId/auth/login",
          params: { accountId: keygen.config.id },
        })
      } finally {
        setLoading(false)
      }
    },
    [auth, session, navigate],
  )

  return (
    <section className="flex w-80 flex-col justify-center">
      <div className="my-3 space-y-7">
        <BackButton
          path="/auth/login"
          label="Return to Login"
          className="md:hidden"
        />
        <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
          Enter your authentication code
        </h1>
        <p className="text-sm text-content-muted">
          Check your 2FA app and enter the code to log in.
        </p>

        {loading ? (
          <div className="flex h-15 items-center justify-center">
            <Loading.Dots />
          </div>
        ) : (
          <OtpInput
            value={otp}
            onChange={(value) => {
              if (error) setError(null)
              setOtp(value)
            }}
            onComplete={handleSubmit}
            error={!!error}
            autoFocus
            size="lg"
          />
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </section>
  )
}
