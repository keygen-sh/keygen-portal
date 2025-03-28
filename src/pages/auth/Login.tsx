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

const emailSchema = z.object({
  username: z.string().email("Please enter a valid email."),
})

export default function Login() {
  const navigate = useNavigate()

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { username: "" },
  })

  function onSubmitEmail() {
    void navigate({ to: "/auth/password" })
  }

  function onSubmitSSO() {
    // TODO: Handle SSO login
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
            to="/auth/register"
            className="text-content-main underline-slide py-0.5 font-bold"
          >
            Create one
          </Link>
        </Button>
      </div>

      <div className="mt-2 flex w-full justify-center select-none">
        <Button variant="link" size="link" onClick={onSubmitSSO}>
          Sign in with SSO
        </Button>
      </div>
    </section>
  )
}
