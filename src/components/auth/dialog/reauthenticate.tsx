import { useState } from "react"
import { useLocation, useParams } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import * as keygen from "@/keygen"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { AuthErrorCode } from "@/types/auth"

import { useSession } from "@/hooks/use-session"
import { useGetCurrentUser } from "@/queries/users"
import { useGetReauthenticationMethod } from "@/queries/auth"

import { toast } from "@/lib/toast"
import { setPendingRedirect } from "@/lib/auth"

import * as Auth from "@/components/auth"
import * as Forms from "@/components/forms"
import * as Loading from "@/components/loading"
import { Notice } from "@/components/notice"

interface ReauthenticateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  environment?: string | null
  notice: React.ReactNode
  submitLabel?: string
  onAuthenticated: () => Promise<void>
}

export default function ReauthenticateDialog({
  open,
  onOpenChange,
  title,
  description,
  environment,
  notice,
  submitLabel,
  onAuthenticated,
}: ReauthenticateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader className="border-b border-accent p-4 text-start">
          <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
            {description}
          </DialogDescription>
          <DialogTitle className="text-sm font-medium">
            {title || "Sign in again to continue"}
          </DialogTitle>
        </DialogHeader>
        <ReauthenticateForm
          environment={environment}
          notice={notice}
          submitLabel={submitLabel}
          onAuthenticated={onAuthenticated}
        />
      </DialogContent>
    </Dialog>
  )
}

function ReauthenticateForm({
  environment,
  notice,
  submitLabel = "Sign in",
  onAuthenticated,
}: {
  environment?: string | null
  notice: React.ReactNode
  submitLabel?: string
  onAuthenticated: () => Promise<void>
}) {
  const session = useSession()
  const location = useLocation()
  const { accountId } = useParams({ strict: false })
  const { data: me } = useGetCurrentUser()

  const email = me?.attributes.email ?? ""
  const method = useGetReauthenticationMethod(email)

  const [otpRequired, setOtpRequired] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const form = useForm<Schemas.Auth.ReauthenticateValues>({
    resolver: zodResolver(Schemas.Auth.ReauthenticateSchema),
    mode: "onChange",
    defaultValues: { password: "", otp: "" },
  })

  async function onSubmit({
    password,
    otp,
  }: Schemas.Auth.ReauthenticateValues) {
    try {
      const { data, errors } = await keygen.reauthenticate({
        email,
        password,
        otp: otp || undefined,
      })

      if (errors?.length) {
        const { code } = errors[0] as unknown as { code: AuthErrorCode }

        switch (code) {
          case AuthErrorCode.PasswordInvalid:
            form.setError("password", {
              type: "manual",
              message: "Invalid password. Please try again.",
            })
            form.setValue("otp", "")
            break
          case AuthErrorCode.OtpRequired:
            if (otpRequired) {
              form.setError("otp", {
                type: "manual",
                message: "Enter the 6-digit code.",
              })
            }
            setOtpRequired(true)
            break
          case AuthErrorCode.OtpInvalid:
            form.setError("otp", {
              type: "manual",
              message: "The code you entered is incorrect. Please try again.",
            })
            form.setValue("otp", "")
            break
          default:
            throw new Error(errors[0]?.detail)
        }

        return
      }

      const { userId } = await keygen.relogin(data!)

      session.setUser(userId)

      await onAuthenticated()
    } catch (error) {
      console.error(error)
      toast({
        message: "Service is unavailable. Please try again later.",
        variant: "error",
      })
    }
  }

  async function onContinueToSso() {
    setRedirecting(true)

    try {
      const { errors } = await keygen.reauthenticate({ email, environment })
      const error = errors?.[0] as
        | (APIError & { links?: { redirect?: string | null } })
        | undefined
      const redirectUrl =
        error?.code === AuthErrorCode.SsoRequired ? error.links?.redirect : null

      if (!redirectUrl) {
        toast({ message: "Single sign-on is unavailable.", variant: "error" })
        setRedirecting(false)
        return
      }

      if (environment == null) {
        keygen.rootEnvironment.clear()
      }

      const href = location.href.replace(`/${accountId}/app`, "/goto")
      if (!/^\/goto\/?$/.test(href)) {
        setPendingRedirect(href)
      }

      window.location.href = redirectUrl
    } catch (error) {
      console.error(error)
      toast({
        message: "Service is unavailable. Please try again later.",
        variant: "error",
      })
      setRedirecting(false)
    }
  }

  const { isSubmitting } = form.formState
  const pending = isSubmitting || redirecting

  const ssoRequired = method.data?.method === "sso"
  const ssoUnavailable =
    (ssoRequired && keygen.config.isTokenAuthenticated) ||
    (method.error instanceof APIError && method.error.code?.startsWith("SSO_"))

  return (
    <Forms.Provider form={form} guard={false}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit(onSubmit)(e)
        }}
        noValidate
      >
        {method.isPending ? (
          <div className="flex h-50 flex-col gap-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="mt-3 h-5 w-24 rounded-sm" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="flex h-50 flex-col gap-2 p-4">
            {method.isError || ssoUnavailable ? (
              <Notice variant="destructive">
                <p>
                  {ssoUnavailable
                    ? "Single sign-on is unavailable."
                    : "Service is unavailable. Please try again later."}
                </p>
              </Notice>
            ) : ssoRequired ? (
              <Notice>
                <strong>Your organization requires single sign-on.</strong> You
                will be redirected to your organization's identity provider for
                authentication.
              </Notice>
            ) : (
              <>
                {notice}
                <Auth.Form.Fields include={["password"]} autoFocus="password" />
                {otpRequired && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-content-muted">
                      Check your 2FA app and enter the code to sign in.
                    </p>
                    <Auth.Form.Fields
                      include={["otp"]}
                      onOtpComplete={(value) => {
                        form.setValue("otp", value, { shouldValidate: true })
                        void form.handleSubmit(onSubmit)()
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
        <DialogFooter className="gap-4 border-t border-accent p-4">
          {ssoRequired && !ssoUnavailable ? (
            <Button
              type="button"
              autoFocus
              disabled={pending}
              onClick={() => void onContinueToSso()}
            >
              {pending ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Continue to IdP"
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={pending || method.data?.method !== "password"}
            >
              {pending ? (
                <Loading.Dots className="bg-background" />
              ) : (
                submitLabel
              )}
            </Button>
          )}
        </DialogFooter>
      </form>
    </Forms.Provider>
  )
}
