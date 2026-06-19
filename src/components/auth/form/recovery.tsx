import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"

import * as Schemas from "@/schemas"
import * as Forms from "@/components/forms"
import * as Motion from "@/components/motion"
import * as Loading from "@/components/loading"

import { useSlide } from "@/hooks/use-slide"

import Fields from "./fields"
import BackButton from "@/components/back-button"

type Step = "email" | "sent"

const STEP_ORDER: readonly Step[] = ["email", "sent"]

export default function RecoveryForm() {
  const [step, direction, setStep] = useSlide<Step>(STEP_ORDER, "email")

  return (
    <Motion.Slide direction={direction} className="flex w-full justify-center">
      {step === "sent" ? (
        <SentStep key="sent" />
      ) : (
        <EmailStep key="email" onSent={() => setStep("sent")} />
      )}
    </Motion.Slide>
  )
}

function EmailStep({ onSent }: { onSent: () => void }) {
  const form = useForm<Schemas.Auth.RecoveryValues>({
    resolver: zodResolver(Schemas.Auth.RecoverySchema),
    mode: "onChange",
    defaultValues: { email: "" },
  })

  function onSubmit() {
    // TODO(cazden) Handle SMTP
    onSent()
  }

  const { isSubmitting } = form.formState

  return (
    <Forms.Provider form={form}>
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
            <BackButton label="Return to Login" className="md:hidden" />
            <div className="flex flex-col space-y-4">
              <Forms.Section.Header variant="auth">
                Recover your password
              </Forms.Section.Header>
              <p className="text-[13px] text-content-muted">
                Enter the email address associated with your account, and we'll
                send over a link to set a new one.
              </p>
            </div>

            <Fields include={["email"]} autoFocus="email" />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </section>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}

function SentStep() {
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
        <p className="text-sm text-content-muted">
          We sent you a link to set a new password.
        </p>
      </div>
    </section>
  )
}
