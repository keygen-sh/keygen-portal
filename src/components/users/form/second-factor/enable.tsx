import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { QRCodeSVG } from "qrcode.react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { X } from "lucide-react"

import {
  useCreateSecondFactor,
  useEnableSecondFactor,
  useDeleteSecondFactor,
} from "@/queries/second-factors"

import { APIError } from "@/types/api"

import { toast } from "@/lib/toast"
import { handleFormError } from "@/lib/form-errors"

import { type SecondFactor } from "@/types/second-factors"

import * as Forms from "@/components/forms"
import * as Loading from "@/components/loading"
import OtpInput from "@/components/otp-input"

type Step = "password" | "setup"

interface EnableSecondFactorFormProps {
  orphanedFactor?: SecondFactor
  onClose: () => void
}

export default function EnableSecondFactorForm({
  orphanedFactor,
  onClose,
}: EnableSecondFactorFormProps) {
  const [step, setStep] = useState<Step>("password")
  const [pendingFactor, setPendingFactor] = useState<SecondFactor | null>(null)

  return (
    <>
      {step === "setup" && pendingFactor ? (
        <SetupStep
          factor={pendingFactor}
          onEnabled={() => {
            setPendingFactor(null)
            onClose()
            toast({
              message: "Two-factor authentication enabled",
              variant: "success",
            })
          }}
          onClose={() => {
            setPendingFactor(null)
            onClose()
          }}
        />
      ) : (
        <PasswordStep
          orphanedFactor={orphanedFactor}
          onCreated={(factor) => {
            setPendingFactor(factor)
            setStep("setup")
          }}
          onClose={onClose}
        />
      )}
    </>
  )
}

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

type PasswordValues = z.infer<typeof passwordSchema>

function PasswordStep({
  orphanedFactor,
  onCreated,
  onClose,
}: {
  orphanedFactor?: SecondFactor
  onCreated: (factor: SecondFactor) => void
  onClose: () => void
}) {
  const createSecondFactor = useCreateSecondFactor()
  const deleteSecondFactor = useDeleteSecondFactor()

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: { password: "" },
  })

  const isPending = deleteSecondFactor.isPending || createSecondFactor.isPending

  const handleSubmit = useCallback(async () => {
    const valid = await form.trigger()
    if (!valid) return

    const { password } = form.getValues()

    try {
      // If user exits mid-setup, their second factor becomes orphaned,
      // so we need to clean up previous attempt if they try to set up again
      if (orphanedFactor) {
        await deleteSecondFactor.mutateAsync({ id: orphanedFactor.id })
      }

      const factor = await createSecondFactor.mutateAsync({ password })
      onCreated(factor)
    } catch (error) {
      if (error instanceof APIError) {
        await handleFormError({
          form,
          toastMessage: "Failed to verify password",
          apiError: error,
        })
      }
    }
  }, [form, orphanedFactor, createSecondFactor, deleteSecondFactor, onCreated])

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Page>
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-accent p-2">
            <h2 className="ml-2 text-sm text-content-muted">
              Enabling two-factor authentication
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="size-3.5 text-content-muted" />
            </Button>
          </div>
          <div className="w-full p-6">
            <Forms.Section.Stacking>
              <p className="text-sm text-content-muted">
                Enter your current password to set up two-factor authentication.
              </p>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        toggle={true}
                        placeholder="Enter your password..."
                        autoFocus
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Forms.Section.Stacking>
          </div>
          <div className="flex items-center gap-4 border-t border-accent p-3 md:justify-end">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              {isPending ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter a 6-digit code"),
})

type OtpValues = z.infer<typeof otpSchema>

function SetupStep({
  factor,
  onEnabled,
  onClose,
}: {
  factor: SecondFactor
  onEnabled: () => void
  onClose: () => void
}) {
  const enableSecondFactor = useEnableSecondFactor()

  const form = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  })

  const handleSubmit = useCallback(
    async (values: OtpValues) => {
      await enableSecondFactor.mutateAsync({
        id: factor.id,
        otp: values.otp,
      })
      onEnabled()
    },
    [enableSecondFactor, factor.id, onEnabled],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Page>
        <Forms.Layout.Sheet
          title="Enabling two-factor authentication"
          onSubmit={handleSubmit}
          errorMessage="Failed to verify code"
          isPending={enableSecondFactor.isPending}
          submitLabel="Activate"
          onClose={onClose}
          inline
        >
          <div className="space-y-10">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-content-loud">
                Download an authenticator app
              </h3>
              <p className="text-sm text-content-muted">
                Download and install an authenticator app, such as <b>Authy</b>,
                on your phone or tablet.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-content-loud">
                  Scan the QR code
                </h3>
                <p className="text-sm text-content-muted">
                  Open your authenticator app and scan the QR code using your
                  device&apos;s camera.
                </p>
              </div>
              <div className="flex w-fit justify-center rounded bg-white p-2">
                <QRCodeSVG value={factor.attributes.uri!} size={180} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-content-loud">
                  Enter your auth code
                </h3>
                <p className="text-sm text-content-muted">
                  Enter the 6-digit verification code, generated by your
                  authenticator app.
                </p>
              </div>
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <OtpInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Forms.Layout.Sheet>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
