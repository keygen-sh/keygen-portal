import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"

import * as keygen from "@/keygen"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"

import { parseResetToken } from "@/lib/auth"
import { useResetPassword } from "@/queries/users"

import { toast } from "@/lib/toast"

import * as Auth from "@/components/auth"
import * as Forms from "@/components/forms"
import * as Loading from "@/components/loading"

const INVALID_LINK_MESSAGE =
  "Your reset link is invalid or has expired. Please request a new one."

export default function ResetPasswordForm() {
  const navigate = useNavigate()
  const { token } = useSearch({ from: "/$accountId/auth/reset" })
  const resetPassword = useResetPassword()

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
      })

      toast({
        message: "Your password has been reset. Please sign in.",
        variant: "success",
      })

      void navigate({
        to: "/$accountId/auth/login",
        params: { accountId: keygen.config.id },
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
            <Forms.Section.Header variant="auth">
              Set a new password
            </Forms.Section.Header>

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
        </section>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
