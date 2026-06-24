import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, Link } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { handleFormError } from "@/lib/form-errors"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { useCreateAccount } from "@/queries/accounts"

import { useSession } from "@/hooks/use-session"

import * as keygen from "@/keygen"

import * as Auth from "@/components/auth"
import * as Forms from "@/components/forms"
import * as Motion from "@/components/motion"
import * as Loading from "@/components/loading"

const REDIRECT_DELAY_MS = 5_000

const TERMS_URL = "https://keygen.sh/terms"
const PRIVACY_URL = "https://keygen.sh/privacy"

export default function RegisterForm() {
  const navigate = useNavigate()
  const session = useSession()

  const form = useForm<Schemas.Auth.RegisterValues>({
    resolver: zodResolver(Schemas.Auth.RegisterSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  })

  const createAccount = useCreateAccount()
  const [isRegistered, setIsRegistered] = useState(false)

  async function onSubmit(values: Schemas.Auth.RegisterValues) {
    try {
      const account = await createAccount.mutateAsync(values)

      const { data, errors } = await keygen.authenticate({
        email: values.email,
        password: values.password,
        account: account.id,
      })

      if (errors?.length || !data) {
        throw new APIError(
          errors?.[0] ?? {
            title: "We couldn't sign you in. Please try logging in.",
          },
        )
      }

      const { id: tokenId, attributes, relationships } = data
      const { token } = attributes
      const userId = relationships.bearer.data.id
      const accountId = relationships.account.data.id

      sessionStorage.removeItem("tokenId")
      sessionStorage.removeItem("token")

      localStorage.setItem("tokenId", tokenId)
      keygen.client.setTokenId(tokenId)

      if (!keygen.config.isCloud) {
        localStorage.setItem("token", token)
        keygen.client.setRootToken(token)
      }

      keygen.client.setAccount(accountId)

      // *keygen music intensifies*
      setIsRegistered(true)
      await new Promise((resolve) => setTimeout(resolve, REDIRECT_DELAY_MS))

      session.setUser(userId)

      void navigate({
        to: "/$accountId/app/dashboard",
        params: { accountId },
      })
    } catch (error) {
      setIsRegistered(false)
      await handleFormError({
        form,
        toastMessage: "We couldn't create your account",
        apiError: error instanceof APIError ? error : undefined,
      })
    }
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
                    {isSubmitting ? (
                      <Loading.Dots className="bg-background" />
                    ) : (
                      "Sign up"
                    )}
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
