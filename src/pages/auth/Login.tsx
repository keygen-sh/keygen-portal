import { useState, useContext } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/assets/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/assets/components/ui/form"
import { Input } from "@/assets/components/ui/input"

import * as keygen from "@keygen/index"
import { AuthContext } from "@contexts/AuthContext"
import * as Loading from "@components/Loading"

const emailSchema = z.object({
  username: z.string().email("Please enter a valid email."),
})

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { setEmail, setSlug } = useContext(AuthContext)
  const navigate = useNavigate()

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { username: "" },
  })

  async function onSubmitEmail() {
    setLoading(true)

    const email = emailForm.getValues().username
    const { errors } = await keygen.authenticate({ email })

    if (errors?.length) {
      const { code } = errors[0]

      const parts = email.split("@")
      const segments = parts[1].split(".")
      const slug = `${segments[0]}-${segments[1]}`.toLowerCase()

      setSlug(slug)
      setEmail(email)

      if (code === "PASSWORD_REQUIRED") {
        void navigate({ to: `/auth/${slug}/password` })

        return
      } else if (code === "OTP_REQUIRED") {
        void navigate({ to: `/auth/${slug}/verify` })

        return
      } else {
        console.error(errors[0]?.detail)

        return
      }
    } else {
      console.error("An unknown error occurred during authentication.")
    }

    setLoading(false)
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...emailForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void emailForm.handleSubmit(onSubmitEmail)(e)
          }}
          noValidate
          className="my-3 w-full space-y-7"
        >
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Sign in to your account
          </h1>
          <FormField
            control={emailForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-content-muted">
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="username"
                    autoFocus
                    placeholder="Enter email..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loading.Dots color="bg-background" /> : "Continue"}
          </Button>
        </form>
      </Form>

      <div className="space-x-2 rounded border border-content-subdued p-2 text-center text-sm select-none">
        <span className="text-content-subdued">No account yet?</span>
        <Button
          asChild
          variant="link"
          size="link"
          className="text-content-loud"
        >
          <Link
            to="/auth/register"
            className="text-content-main underline-slide py-0.5 font-bold"
          >
            Create one
          </Link>
        </Button>
      </div>

      <div className="mt-2 flex w-full justify-center select-none">
        <Button
          variant="link"
          size="link"
          asChild
          className={`${
            loading
              ? "pointer-events-none text-content-disabled"
              : "pointer-events-auto text-content-loud"
          }`}
        >
          <Link to="/auth/sso">Sign in with SSO</Link>
        </Button>
      </div>
    </section>
  )
}
