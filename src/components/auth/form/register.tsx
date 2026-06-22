import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import * as Schemas from "@/schemas"

import * as Auth from "@/components/auth"
import * as Forms from "@/components/forms"
import * as Motion from "@/components/motion"

const TERMS_URL = "https://keygen.sh/terms"
const PRIVACY_URL = "https://keygen.sh/privacy"

export default function RegisterForm() {
  const form = useForm<Schemas.Auth.RegisterValues>({
    resolver: zodResolver(Schemas.Auth.RegisterSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  })

  const [isRegistered, setIsRegistered] = useState(false)

  // TODO(cazden) Handle registration & auth
  function onSubmit() {
    setIsRegistered(true)
  }

  const { isSubmitting } = form.formState

  return (
    <div className="relative">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 ease-in-out",
          isRegistered && "pointer-events-auto opacity-100",
        )}
      >
        <Motion.Terminal
          text="*keygen music intensifies*"
          active={isRegistered}
        />

        {/* TODO(cazden) remove this div after registration is implemented */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <p className="text-xs text-content-disabled">// pardon our dust</p>
          <Button
            size="link"
            variant="link"
            onClick={() => setIsRegistered(false)}
            className="w-fit text-content-disabled"
          >
            back
          </Button>
        </div>
      </div>
      <div
        className={cn(
          "opacity-100 transition-opacity duration-300 ease-in-out",
          isRegistered && "pointer-events-none opacity-0",
        )}
      >
        <Forms.Provider form={form} guard={false}>
          <Forms.Container.Page>
            <section className="flex w-80 flex-col justify-center">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void form.handleSubmit(onSubmit)(e)
                }}
                noValidate
                className="my-3 w-full space-y-8"
              >
                <div className="flex flex-col space-y-4">
                  <Forms.Section.Header variant="auth" className="mb-1">
                    Create an account
                  </Forms.Section.Header>
                  <h2 className="text-sm text-content-subdued">
                    You're one step away from joining Keygen.
                  </h2>
                </div>

                <div className="space-y-4">
                  <Auth.Form.Fields
                    include={["email", "password"]}
                    autoFocus="email"
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Sign up
                  </Button>
                  <p className="text-xs text-content-subdued select-none">
                    By clicking the above <strong>Sign Up</strong> button, you
                    agree to our{" "}
                    <a
                      href={TERMS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="underline transition-colors duration-150 hover:text-content-loud"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href={PRIVACY_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="underline transition-colors duration-150 hover:text-content-loud"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>

                <div className="space-x-2 rounded border border-accent p-2 text-center text-sm select-none">
                  <span className="text-content-subdued">
                    Already have an account?
                  </span>
                  <Button
                    asChild
                    variant="link"
                    size="link"
                    className="text-content-loud"
                  >
                    <Link to="/auth" className="py-0.5 font-bold">
                      Log in
                    </Link>
                  </Button>
                </div>
              </form>
            </section>
          </Forms.Container.Page>
        </Forms.Provider>
      </div>
    </div>
  )
}
