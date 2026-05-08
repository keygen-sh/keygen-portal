import { useState } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

import * as keygen from "@/keygen"

import { AuthErrorCode } from "@/types/auth"

import { useAuth } from "@/hooks/use-auth"
import { useSession } from "@/hooks/use-session"

import * as Loading from "@/components/loading"
import BackButton from "@/components/back-button"

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  remember: z.boolean().optional(),
})

/**
 * Password component that validates user email and password to authenticate user.
 * Routes users to either OTP verification or application based on account settings.
 */
export default function Password() {
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const auth = useAuth()
  const session = useSession()
  const error = localError || auth.error

  const navigate = useNavigate()

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      remember: false,
    },
  })

  async function onSubmitPassword() {
    setLoading(true)
    setLocalError(null)
    auth.setError(null)

    const { password, remember } = passwordForm.getValues()

    try {
      const { data, errors } = await keygen.authenticate({
        email: auth.email!,
        password,
      })

      if (errors?.length) {
        const { code } = errors[0] as unknown as { code: AuthErrorCode }

        switch (code) {
          case AuthErrorCode.PasswordInvalid:
            setLocalError("Invalid password. Please try again.")
            break
          case AuthErrorCode.OtpRequired:
            auth.setPassword(password)
            auth.setRemember(remember || false)
            void navigate({ to: `/${keygen.config.id}/auth/verify` })
            break
          default:
            throw new Error(errors[0]?.detail)
        }

        return
      }

      const { id: tokenId, attributes, relationships } = data!
      const { token } = attributes
      const userId = relationships.bearer.data.id

      const storage = remember ? localStorage : sessionStorage
      storage.setItem("tokenId", tokenId)
      keygen.client.setTokenId(tokenId)

      if (!keygen.config.isCloud) {
        storage.setItem("token", token)
        keygen.client.setRootToken(token)
      }

      session.setUser(userId)

      void navigate({ to: "/" })
    } catch (error) {
      console.error(error)
      auth.setError("Service is unavailable. Please try again later.")

      void navigate({
        to: "/$accountId/auth/login",
        params: { accountId: keygen.config.id },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...passwordForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void passwordForm.handleSubmit(onSubmitPassword)(e)
          }}
          className="my-3 space-y-7"
        >
          <BackButton path="/auth/login" className="md:hidden" />
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Enter your password
          </h1>
          <FormField
            control={passwordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-content-muted">Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    variant="default"
                    type="password"
                    toggle={true}
                    autoComplete="current-password"
                    autoFocus
                    placeholder="Enter your password..."
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(e)
                      setLocalError(null)
                      auth.setError(null)
                    }}
                  />
                </FormControl>
                <FormMessage>{error}</FormMessage>

                <Button
                  variant="link"
                  size="link"
                  asChild
                  className={cn(
                    `${
                      loading
                        ? "pointer-events-none text-content-disabled"
                        : "pointer-events-auto text-secondary"
                    }`,
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
              </FormItem>
            )}
          />

          <FormField
            control={passwordForm.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <FormLabel>Remember me on this device</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loading.Dots className="bg-background" /> : "Sign in"}
          </Button>
        </form>
      </Form>
    </section>
  )
}
