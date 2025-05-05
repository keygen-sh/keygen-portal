import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@assets/components/ui/form"
import { Input } from "@assets/components/ui/input"

import * as keygen from "@/keygen/index"
import { useAuth } from "@/hooks/useAuth"
import BackButton from "@/components/BackButton"
import * as Loading from "@/components/Loading"

const verificationSchema = z.object({
  digit1: z.string().regex(/^\d$/, "Must be one digit"),
  digit2: z.string().regex(/^\d$/, "Must be one digit"),
  digit3: z.string().regex(/^\d$/, "Must be one digit"),
  digit4: z.string().regex(/^\d$/, "Must be one digit"),
  digit5: z.string().regex(/^\d$/, "Must be one digit"),
  digit6: z.string().regex(/^\d$/, "Must be one digit"),
})

export default function Verify() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const auth = useAuth()

  const navigate = useNavigate()

  const verificatonForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      digit1: "",
      digit2: "",
      digit3: "",
      digit4: "",
      digit5: "",
      digit6: "",
    },
    mode: "onChange",
    reValidateMode: "onSubmit",
  })

  const { handleSubmit, watch, control, setValue, reset } = verificatonForm

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const onSubmitVerification = useCallback(
    async (form: z.infer<typeof verificationSchema>) => {
      setLoading(true)
      setError(null)

      const otp = [
        form.digit1,
        form.digit2,
        form.digit3,
        form.digit4,
        form.digit5,
        form.digit6,
      ].join("")

      try {
        const { data, errors } = await keygen.authenticate({
          email: auth.email!,
          password: auth.password!,
          otp,
        })

        if (errors?.length) {
          const { code } = errors[0] as unknown as { code: keygen.ErrorCode }

          switch (code) {
            case keygen.ErrorCode.OTP_INVALID:
              setError("The code you entered is incorrect. Please try again.")
              setLoading(false)
              reset()
              break
            case keygen.ErrorCode.PASSWORD_INVALID:
              auth.setError("Invalid password. Please try again.")
              void navigate({
                to: "/$id/auth/password",
                params: { id: keygen.config.id },
              })
              break
            default:
              throw new Error(errors[0]?.detail)
          }
        } else {
          const storage = auth.remember ? localStorage : sessionStorage

          storage.setItem(
            "token",
            (data as { attributes: { token: string } }).attributes.token,
          )
          storage.setItem("tokenId", (data as { id: string }).id)

          void navigate({ to: "/" })
        }
      } catch (error) {
        console.error(error)
        auth.setError("Service is unavailable. Please try again later.")

        void navigate({
          to: "/$id/auth/login",
          params: { id: keygen.config.id },
        })
      } finally {
        setLoading(false)
      }
    },
    [auth, reset, navigate],
  )

  // Watcher to submit form when digits are filled
  useEffect(() => {
    const subscription = watch((values) => {
      const allFilled = Object.values(values).every((val) => val.length === 1)

      if (allFilled) {
        void handleSubmit(onSubmitVerification)()
      }
    })
    return () => subscription.unsubscribe()
  }, [handleSubmit, onSubmitVerification, watch])

  // Handle input change and focus next field
  const handleChange = (
    value: string,
    index: number,
    onChange: (val: string) => void,
  ) => {
    if (error) {
      setError(null)
    }
    onChange(value)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle paste to fill all fields
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "")
    if (!pasteData) return

    // Fill from the current field onward
    const digits = pasteData.split("")
    let currentIndex = index

    for (let i = 0; i < digits.length && currentIndex < 6; i++) {
      const fieldKey = (
        ["digit1", "digit2", "digit3", "digit4", "digit5", "digit6"] as const
      )[currentIndex]
      setValue(fieldKey, digits[i], {
        shouldTouch: true,
        shouldValidate: true,
      })
      currentIndex++
    }

    // Focus next unfilled field, if any
    if (currentIndex < 6) {
      inputRefs.current[currentIndex]?.focus()
    }
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...verificatonForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void verificatonForm.handleSubmit(onSubmitVerification)(e)
          }}
          noValidate
          className="my-3 space-y-7"
        >
          <BackButton
            path="/auth/login"
            label="Return to Login"
            className="md:hidden"
          />
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Enter your authentication code
          </h1>
          <FormLabel>
            Check your 2FA app and enter the code to log in.
          </FormLabel>

          {loading ? (
            <div className="flex h-15 items-center justify-center">
              <Loading.Dots />
            </div>
          ) : (
            <div className="flex items-center justify-between md:space-x-2">
              {(
                [
                  "digit1",
                  "digit2",
                  "digit3",
                  "digit4",
                  "digit5",
                  "digit6",
                ] as const
              ).map((fieldName, i) => {
                return (
                  <FormField
                    key={fieldName}
                    control={control}
                    name={fieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            ref={(el) => {
                              inputRefs.current[i] = el
                            }}
                            aria-invalid={error ? "true" : "false"}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            autoFocus={i === 0}
                            variant={error ? "destructive" : "default"}
                            fieldSize="xl"
                            maxLength={1}
                            className="h-15 w-12 text-center md:h-16 md:w-13"
                            value={field.value}
                            onChange={(e) => {
                              const val = e.target.value

                              if (/^\d?$/.test(val)) {
                                handleChange(val, i, field.onChange)
                              }
                            }}
                            onPaste={(e) => handlePaste(e, i)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Backspace" &&
                                !field.value &&
                                i > 0
                              ) {
                                inputRefs.current[i - 1]?.focus()
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )
              })}
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </Form>
    </section>
  )
}
