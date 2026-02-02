import { useState } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

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

import * as keygen from "@/keygen"
import * as Loading from "@/components/loading"

const registerSchema = z.object({
  username: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  companyId: z.string().optional(),
})

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showIdField, setShowIdField] = useState(false)

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", companyId: "" },
  })

  // TODO(cazden) API call to check if email is available
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function checkEmailAvailability(_email: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Dummy API call

    return false
  }

  async function onSubmitRegister(values: z.infer<typeof registerSchema>) {
    setLoading(true)
    try {
      const isAvailable = await checkEmailAvailability(values.username)

      if (!isAvailable) {
        registerForm.setError("username", {
          type: "manual",
          message: "This email is already registered.",
        })
        return
      }

      // Extract domain and slug from email
      const parts = values.username.split("@")
      const segments = parts[1].split(".")
      const domain = segments.slice(0, 2).join("-").toLowerCase()
      const slug = segments[0].toLowerCase()

      // Dummy domain check
      if (domain === "umbral-tech" && !values.companyId) {
        setShowIdField(true)
        registerForm.setError("companyId", {
          type: "manual",
          message: "Company ID already exists for this domain",
        })
        return
      }

      // TODO(cazden) Handle account creation
      console.log(
        `Creating account for ${values.username} with slug: ${slug}${
          values.companyId ? ` and companyId: ${values.companyId}` : ""
        }`,
      )

      void navigate({
        to: "/$accountId/app/dashboard",
        params: { accountId: keygen.config.id },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...registerForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void registerForm.handleSubmit(onSubmitRegister)(e)
          }}
          noValidate
          className="my-3 w-full space-y-7"
        >
          <div className="flex flex-col space-y-4">
            <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
              Create an account
            </h1>
            <h2 className="text-sm text-content-muted">
              You're one step away from joining Keygen.
            </h2>
          </div>
          <FormField
            control={registerForm.control}
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
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {showIdField && (
            <FormField
              control={registerForm.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-content-muted">
                    Company ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter company ID..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={registerForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-content-muted">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    toggle={true}
                    autoComplete="current-password"
                    placeholder="Enter your password..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loading.Dots className="bg-background" /> : "Continue"}
          </Button>
        </form>
      </Form>

      <div className="space-x-2 rounded border border-content-subdued p-2 text-center text-sm select-none">
        <span className="text-content-subdued">Already got an account?</span>
        <Button
          asChild
          variant="link"
          size="link"
          className={`${
            loading
              ? "pointer-events-none text-content-disabled"
              : "pointer-events-auto text-content-loud"
          }`}
        >
          <Link
            to="/$accountId/auth/login"
            params={{ accountId: keygen.config.id }}
            className="py-0.5 font-bold"
          >
            Log in
          </Link>
        </Button>
      </div>
    </section>
  )
}
