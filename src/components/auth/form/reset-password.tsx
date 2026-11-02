import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"

import { Globe, GlobeLock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import * as keygen from "@/keygen"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { AuthErrorCode } from "@/types/auth"

import { parseResetToken } from "@/lib/auth"
import { useResetPassword } from "@/queries/users"

import { cn } from "@/lib/utils"
import { toast } from "@/lib/toast"
import { truncator } from "@/lib/truncate"
import { getRecentAccounts } from "@/lib/accounts"

import * as Auth from "@/components/auth"
import * as Forms from "@/components/forms"
import * as Loading from "@/components/loading"

const INVALID_LINK_MESSAGE =
  "Your reset link is invalid or has expired. Please request a new one."

const truncate = truncator("middle", { maxLength: 24 })

export default function ResetPasswordForm() {
  const navigate = useNavigate()
  const { token, env } = useSearch({ from: "/$accountId/auth/reset" })
  const resetPassword = useResetPassword()
  const [environmentOpen, setEnvironmentOpen] = useState(false)
  const accountLabel = useMemo(() => {
    const id = keygen.config.id
    const recent = getRecentAccounts().find(
      (account) => account.id === id || account.slug === id,
    )
    if (recent?.name) return recent.name

    return truncate(id)
  }, [])

  const reset = useMemo(() => parseResetToken(token), [token])

  const form = useForm<Schemas.Auth.ResetValues>({
    resolver: zodResolver(Schemas.Auth.ResetSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit({ password }: Schemas.Auth.ResetValues) {
    if (!reset) {
      toast({ message: INVALID_LINK_MESSAGE, variant: "error" })
      return
    }

    try {
      await resetPassword.mutateAsync({
        userId: reset.userId,
        token: reset.token,
        newPassword: password,
        environment: env,
      })

      toast({
        message: "Your password has been reset. Please sign in.",
        variant: "success",
      })

      void navigate({
        to: "/$accountId/auth/login",
        params: { accountId: keygen.config.id },
        search: { env },
      })
    } catch (error) {
      const apiError = error instanceof APIError ? error : null
      const pointer = apiError?.source?.pointer ?? ""

      if (
        pointer === "/meta/passwordResetToken" ||
        apiError?.code === "NOT_FOUND"
      ) {
        toast({ message: INVALID_LINK_MESSAGE, variant: "error" })
      } else if (pointer.toLowerCase().includes("password")) {
        form.setError("password", {
          type: "manual",
          message: apiError?.detail || "Please choose a different password.",
        })
      } else if (apiError?.code === AuthErrorCode.EnvironmentInvalid) {
        toast({ message: "Environment not found.", variant: "error" })
      } else if (apiError?.code === AuthErrorCode.EnvironmentNotSupported) {
        toast({ message: "Environments are unavailable.", variant: "error" })
      } else {
        console.error(error)
        toast({
          message: "Something went wrong. Please try again.",
          variant: "error",
        })
      }
    }
  }

  const { isSubmitting } = form.formState

  return (
    <Forms.Provider form={form} guard={false}>
      <Forms.Container.Page>
        <section className="flex w-80 flex-col justify-center">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void form.handleSubmit(onSubmit)(e)
            }}
            noValidate
            className="my-3 space-y-7"
          >
            <Forms.Section.Header variant="auth" className="mb-1">
              Set a new password
            </Forms.Section.Header>

            {(!keygen.config.hasFixedAccount || !keygen.config.isCE) && (
              <div className="space-x-1 text-sm text-content-subdued select-none">
                {!keygen.config.hasFixedAccount && (
                  <>
                    Resetting password for{" "}
                    <span className="inline-flex items-center rounded-sm bg-content-subdued/30 px-1 py-0.5 font-mono text-content-muted">
                      {accountLabel}
                    </span>
                  </>
                )}
                {!keygen.config.isCE && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Switch environment"
                        onClick={() => setEnvironmentOpen(true)}
                        className={cn(
                          "inline-flex h-6 cursor-pointer items-center rounded-sm px-1.5 py-0.5 align-bottom",
                          env
                            ? "bg-warning/30 text-warning"
                            : "bg-content-subdued/30 text-content-subdued",
                        )}
                      >
                        {env ? (
                          <GlobeLock className="size-3" />
                        ) : (
                          <Globe className="size-3" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="start"
                      sideOffset={4}
                      className="max-w-56 bg-background-4 text-wrap text-content-muted"
                    >
                      <strong>Environment:</strong>{" "}
                      {env ? (
                        <span className="font-mono">{truncate(env)}</span>
                      ) : (
                        "Global"
                      )}
                      <br />
                      <strong>Not the right environment?</strong> Switch to a
                      different one.
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}

            <Auth.Form.Fields
              include={["newPassword", "confirmPassword"]}
              autoFocus="newPassword"
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

          {!keygen.config.isCE && (
            <Auth.Dialog.Environment
              open={environmentOpen}
              onOpenChange={setEnvironmentOpen}
            />
          )}
        </section>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
