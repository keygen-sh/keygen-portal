import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

import * as keygen from "@/keygen"

import * as Schemas from "@/schemas"

import { AuthErrorCode, type Auth } from "@/types/auth"

import { useSlide } from "@/hooks/use-slide"
import { useSession } from "@/hooks/use-session"

import { cn } from "@/lib/utils"
import { toast } from "@/lib/toast"
import { truncator } from "@/lib/truncate"
import { getRecentAccounts } from "@/lib/accounts"

import Fields from "./fields"
import * as Forms from "@/components/forms"
import * as Motion from "@/components/motion"
import * as Loading from "@/components/loading"
import BackButton from "@/components/back-button"

type Step = "email" | "password" | "verify" | "sso"

const STEP_ORDER: readonly Step[] = ["email", "password", "verify", "sso"]

export default function LoginForm() {
  const navigate = useNavigate()
  const session = useSession()

  const [step, direction, setStep] = useSlide<Step>(STEP_ORDER, "email")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [ssoRedirectUrl, setSsoRedirectUrl] = useState<string | null>(null)

  function login(data: Auth, remember: boolean) {
    const { id: tokenId, attributes, relationships } = data
    const { token } = attributes
    const userId = relationships.bearer.data.id
    const accountId = relationships.account.data.id

    const storage = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    other.removeItem("tokenId")
    other.removeItem("token")

    storage.setItem("tokenId", tokenId)
    keygen.client.setTokenId(tokenId)

    if (!keygen.config.isCloud) {
      storage.setItem("token", token)
      keygen.client.setRootToken(token)
    }

    keygen.client.setAccount(accountId)
    session.setUser(userId)

    void navigate({
      to: "/$accountId/app/dashboard",
      params: { accountId },
    })
  }

  return (
    <Motion.Slide direction={direction} className="flex w-full justify-center">
      {step === "password" ? (
        <PasswordStep
          key="password"
          email={email}
          onOtpRequired={(value, rememberValue) => {
            setPassword(value)
            setRemember(rememberValue)
            setStep("verify")
          }}
          onAuthenticated={login}
          onBack={() => setStep("email")}
        />
      ) : step === "verify" ? (
        <VerifyStep
          key="verify"
          email={email}
          password={password}
          remember={remember}
          onAuthenticated={login}
          onPasswordInvalid={() => setStep("password")}
          onBack={() => setStep("email")}
        />
      ) : step === "sso" ? (
        <SsoStep
          key="sso"
          redirectUrl={ssoRedirectUrl}
          onCancel={() => {
            setSsoRedirectUrl(null)
            setStep("email")
          }}
        />
      ) : (
        <EmailStep
          key="email"
          onPasswordRequired={(value) => {
            setEmail(value)
            setStep("password")
          }}
          onSsoRequired={(value, url) => {
            setEmail(value)
            setSsoRedirectUrl(url)
            setStep("sso")
          }}
          onBack={() => navigate({ to: "/auth" })}
        />
      )}
    </Motion.Slide>
  )
}

function EmailStep({
  onPasswordRequired,
  onSsoRequired,
  onBack,
}: {
  onPasswordRequired: (email: string) => void
  onSsoRequired: (email: string, redirectUrl: string) => void
  onBack: () => void
}) {
  const accountLabel = useMemo(() => {
    const id = keygen.config.id
    const recent = getRecentAccounts().find(
      (account) => account.id === id || account.slug === id,
    )
    if (recent?.name) return recent.name

    return truncator("middle", { maxLength: 16 })(id)
  }, [])

  const form = useForm<Schemas.Auth.LoginValues>({
    resolver: zodResolver(Schemas.Auth.LoginSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  })

  async function onSubmit({ email }: Schemas.Auth.LoginValues) {
    try {
      const { errors } = await keygen.authenticate({ email })

      if (!errors?.length) {
        throw new Error("Service is unavailable.")
      }

      const err = errors[0] as {
        code: AuthErrorCode
        detail?: string
        links?: { redirect?: string | null }
      }

      switch (err.code) {
        case AuthErrorCode.PasswordRequired:
          onPasswordRequired(email)
          break
        case AuthErrorCode.SsoRequired:
          if (err.links?.redirect) {
            onSsoRequired(email, err.links.redirect)
          } else {
            toast({
              message: "Single sign-on is unavailable.",
              variant: "error",
            })
          }
          break
        case AuthErrorCode.EmailInvalid:
          form.setError("email", {
            type: "manual",
            message: "Invalid email. Please try again.",
          })
          break
        case AuthErrorCode.SsoNotSupported:
        case AuthErrorCode.SsoAccountNotFound:
        case AuthErrorCode.SsoUserNotAllowed:
        case AuthErrorCode.SsoUserNotFound:
        case AuthErrorCode.SsoUserInvalid:
        case AuthErrorCode.SsoEnvironmentNotFound:
        case AuthErrorCode.SsoStateMissing:
        case AuthErrorCode.SsoStateInvalid:
        case AuthErrorCode.SsoSessionInvalid:
          toast({
            message: "Single sign-on is unavailable.",
            variant: "error",
          })
          break
        default:
          throw new Error(err.detail)
      }
    } catch (error) {
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
            <BackButton onClick={onBack} />
            <Forms.Section.Header variant="auth" className="mb-1">
              Sign in to your account
            </Forms.Section.Header>

            {!keygen.config.hasFixedAccount && (
              <div className="space-x-1 text-sm select-none">
                <span className="text-content-subdued">
                  Signing in to {accountLabel}.{" "}
                </span>
                <Button
                  asChild
                  variant="link"
                  size="link"
                  className="text-content-loud"
                >
                  <Link
                    to="/auth"
                    className="text-content-main underline-slide font-bold"
                  >
                    Use a different account
                  </Link>
                </Button>
              </div>
            )}

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

function PasswordStep({
  email,
  onOtpRequired,
  onAuthenticated,
  onBack,
}: {
  email: string
  onOtpRequired: (password: string, remember: boolean) => void
  onAuthenticated: (data: Auth, remember: boolean) => void
  onBack: () => void
}) {
  const form = useForm<Schemas.Auth.PasswordValues>({
    resolver: zodResolver(Schemas.Auth.PasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", remember: false },
  })

  async function onSubmit({ password, remember }: Schemas.Auth.PasswordValues) {
    try {
      const { data, errors } = await keygen.authenticate({ email, password })

      if (errors?.length) {
        const { code } = errors[0] as unknown as { code: AuthErrorCode }

        switch (code) {
          case AuthErrorCode.PasswordInvalid:
            form.setError("password", {
              type: "manual",
              message: "Invalid password. Please try again.",
            })
            break
          case AuthErrorCode.OtpRequired:
            onOtpRequired(password, remember)
            break
          default:
            throw new Error(errors[0]?.detail)
        }

        return
      }

      onAuthenticated(data!, remember)
    } catch (error) {
      console.error(error)
      toast({
        message: "Service is unavailable. Please try again later.",
        variant: "error",
      })
      onBack()
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
            <BackButton onClick={onBack} />
            <Forms.Section.Header variant="auth">
              Enter your password
            </Forms.Section.Header>

            <div className="space-y-2">
              <Fields include={["password"]} autoFocus="password" />
              <Button
                variant="link"
                size="link"
                asChild
                className={cn(
                  isSubmitting
                    ? "pointer-events-none text-content-disabled"
                    : "pointer-events-auto text-secondary",
                  "w-fit",
                )}
              >
                <Link
                  to="/$accountId/auth/recovery"
                  params={{ accountId: keygen.config.id }}
                >
                  Forgot password?
                </Link>
              </Button>
            </div>

            <Fields include={["remember"]} />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </section>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}

function VerifyStep({
  email,
  password,
  remember,
  onAuthenticated,
  onPasswordInvalid,
  onBack,
}: {
  email: string
  password: string
  remember: boolean
  onAuthenticated: (data: Auth, remember: boolean) => void
  onPasswordInvalid: () => void
  onBack: () => void
}) {
  const form = useForm<Schemas.Auth.VerifyValues>({
    resolver: zodResolver(Schemas.Auth.VerifySchema),
    defaultValues: { otp: "" },
  })

  async function onSubmit({ otp }: Schemas.Auth.VerifyValues) {
    try {
      const { data, errors } = await keygen.authenticate({
        email,
        password,
        otp,
      })

      if (errors?.length) {
        const { code } = errors[0] as unknown as { code: AuthErrorCode }

        switch (code) {
          case AuthErrorCode.OtpInvalid:
            form.setError("otp", {
              type: "manual",
              message: "The code you entered is incorrect. Please try again.",
            })
            form.setValue("otp", "")
            break
          case AuthErrorCode.PasswordInvalid:
            toast({
              message: "Invalid password. Please try again.",
              variant: "error",
            })
            onPasswordInvalid()
            break
          default:
            throw new Error(errors[0]?.detail)
        }

        return
      }

      onAuthenticated(data!, remember)
    } catch (error) {
      console.error(error)
      toast({
        message: "Service is unavailable. Please try again later.",
        variant: "error",
      })
      onBack()
    }
  }

  const isSubmitting = form.formState.isSubmitting

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
            <BackButton label="Return to Login" onClick={onBack} />
            <Forms.Section.Header variant="auth">
              Enter your authentication code
            </Forms.Section.Header>
            <p className="text-sm text-content-muted">
              Check your 2FA app and enter the code to log in.
            </p>

            {isSubmitting ? (
              <div className="flex h-15 items-center justify-center">
                <Loading.Dots />
              </div>
            ) : (
              <Fields
                include={["otp"]}
                onOtpComplete={(value) => {
                  form.setValue("otp", value, { shouldValidate: true })
                  void form.handleSubmit(onSubmit)()
                }}
              />
            )}
          </form>
        </section>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}

function SsoStep({
  redirectUrl,
  onCancel,
}: {
  redirectUrl: string | null
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)

  function onContinue() {
    if (!redirectUrl) return

    setLoading(true)
    window.location.href = redirectUrl
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <div className="space-y-4">
        <BackButton onClick={onCancel} />
        <Forms.Section.Header variant="auth">
          Single sign-on required
        </Forms.Section.Header>
        <p className="text-sm text-content-muted">
          <b>Your organization requires single sign-on.</b> You will be
          redirected to your organization's identity provider for
          authentication.
        </p>

        <div className="mt-8 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1"
            autoFocus
            disabled={loading}
            onClick={onContinue}
          >
            {loading ? (
              <Loading.Dots className="bg-background" />
            ) : (
              "Continue to IdP"
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
