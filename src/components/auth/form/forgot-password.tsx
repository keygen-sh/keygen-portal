import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSearch } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { Undo2 } from "lucide-react"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"

import { useForgotPassword } from "@/queries/users"

import { toast } from "@/lib/toast"

import { useSlide } from "@/hooks/use-slide"
import { useMobile } from "@/hooks/use-mobile"

import * as Auth from "@/components/auth"
import * as Forms from "@/components/forms"
import * as Motion from "@/components/motion"
import * as Loading from "@/components/loading"
import BackButton from "@/components/back-button"

type Step = "confirm" | "sent"

const STEP_ORDER: readonly Step[] = ["confirm", "sent"]

export default function ForgotPasswordForm() {
  const { email: emailFromParams } = useSearch({
    from: "/$accountId/auth/forgot",
  })

  const [step, direction, setStep] = useSlide<Step>(STEP_ORDER, "confirm")
  const [email, setEmail] = useState(emailFromParams ?? "")

  return (
    <Motion.Slide direction={direction} className="flex w-full justify-center">
      {step === "sent" ? (
        <SentStep key="sent" email={email} onEdit={() => setStep("confirm")} />
      ) : (
        <ConfirmStep
          key="confirm"
          email={email}
          onSent={(submittedEmail) => {
            setEmail(submittedEmail)
            setStep("sent")
          }}
        />
      )}
    </Motion.Slide>
  )
}

function ConfirmStep({
  email,
  onSent,
}: {
  email: string
  onSent: (email: string) => void
}) {
  const forgotPassword = useForgotPassword()

  const form = useForm<Schemas.Auth.ForgotPasswordValues>({
    resolver: zodResolver(Schemas.Auth.ForgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email },
  })

  async function onSubmit({ email }: Schemas.Auth.ForgotPasswordValues) {
    try {
      await forgotPassword.mutateAsync({ email })

      onSent(email)
    } catch (error) {
      if (error instanceof APIError && error.code === "TOO_MANY_REQUESTS") {
        toast({
          message:
            "You've requested too many reset links. Please wait a while before trying again.",
          variant: "error",
        })
        return
      }

      console.error(error)
      toast({
        message: "Service is unavailable. Please try again later.",
        variant: "error",
      })
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
            className="my-3 w-full space-y-7"
          >
            <div className="flex flex-col space-y-4">
              <Forms.Section.Header variant="auth">
                Reset your password
              </Forms.Section.Header>
              <p className="text-[13px] text-content-muted">
                Enter the email address associated with your account, and we'll
                send over a link to set a new one.
              </p>
              <Auth.Form.Fields include={["email"]} autoFocus="email" />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loading.Dots className="bg-background" />
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        </section>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}

function SentStep({ email, onEdit }: { email: string; onEdit: () => void }) {
  const forgotPassword = useForgotPassword()
  const isMobile = useMobile()

  async function onResend() {
    try {
      await forgotPassword.mutateAsync({ email })

      toast({ message: "We've resent the link.", variant: "success" })
    } catch (error) {
      if (error instanceof APIError && error.code === "TOO_MANY_REQUESTS") {
        toast({
          message:
            "You've requested too many reset links. Please wait a while before trying again.",
          variant: "error",
        })
        return
      }

      console.error(error)
      toast({
        message: "Service is unavailable. Please try again later.",
        variant: "error",
      })
    }
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <div className="flex flex-col space-y-4">
        <BackButton
          label="Return to Login"
          className="justify-start md:hidden"
        />
        <Forms.Section.Header variant="auth">
          Check your inbox
        </Forms.Section.Header>
        <div className="space-x-1 text-sm text-content-muted select-none">
          <span>We sent a password reset link to</span>
          {isMobile ? (
            <Popover>
              <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                <span className="inline-flex cursor-pointer items-center rounded-sm bg-content-subdued/30 px-1 py-0.5 font-mono text-content-muted">
                  {email}
                  <Undo2 className="text-content ml-1 inline size-3" />
                </span>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={4}
                className="max-w-56 bg-background-4 text-content-muted"
              >
                <strong>Not the right email?</strong>
                <br />
                <button
                  type="button"
                  onClick={onEdit}
                  className="cursor-pointer text-primary"
                >
                  Go back to enter a different one.
                </button>
              </PopoverContent>
            </Popover>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex cursor-pointer items-center rounded-sm bg-content-subdued/30 px-1 py-0.5 font-mono text-content-muted"
                >
                  {email}
                  <Undo2 className="text-content ml-1 inline size-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="start"
                sideOffset={4}
                className="max-w-56 bg-background-4 text-wrap text-content-muted"
              >
                <strong>Not the right email?</strong> Go back to enter a
                different one.
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <p className="text-sm text-content-normal">
          Didn't get anything?{" "}
          <Button
            type="button"
            variant="link"
            size="link"
            className="text-secondary"
            disabled={forgotPassword.isPending}
            onClick={onResend}
          >
            Send it again
          </Button>
          .
        </p>
      </div>
    </section>
  )
}
