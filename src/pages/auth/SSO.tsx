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

import * as keygen from "@/keygen/index"

const ssoSchema = z.object({
  username: z.string().email("Please enter a valid email."),
})

export default function SSO() {
  const navigate = useNavigate()

  const ssoForm = useForm<z.infer<typeof ssoSchema>>({
    resolver: zodResolver(ssoSchema),
    defaultValues: { username: "" },
  })

  function onSubmitSSO() {
    // TODO: Handle SSO
    void navigate({
      to: "/$id/app/dashboard",
      params: { id: keygen.config.id },
    })
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...ssoForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void ssoForm.handleSubmit(onSubmitSSO)(e)
          }}
          noValidate
          className="my-3 w-full space-y-7"
        >
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Sign in with SSO
          </h1>
          <FormField
            control={ssoForm.control}
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
                    placeholder="Enter email..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="w-full">
            Continue
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
            to="/$id/auth/register"
            params={{ id: keygen.config.id }}
            className="text-content-main underline-slide py-0.5 font-bold"
          >
            Create one
          </Link>
        </Button>
      </div>

      <div className="mt-2 flex w-full justify-center select-none">
        <Button variant="link" size="link" asChild>
          <Link to="/$id/auth/login" params={{ id: keygen.config.id }}>
            Use password instead
          </Link>
        </Button>
      </div>
    </section>
  )
}
