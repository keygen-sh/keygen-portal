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

const registerSchema = z.object({
  username: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

export default function Register() {
  const navigate = useNavigate()

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "" },
  })

  function onSubmitRegister() {
    // TODO: Handle account creation
    void navigate({ to: "/app/home" })
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
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Create an account
          </h1>
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        <span className="text-content-subdued">Already got an account?</span>
        <Button
          asChild
          variant="link"
          size="link"
          className="text-content-loud"
        >
          <Link
            to="/auth/login"
            className="text-content-main underline-slide py-0.5 font-bold"
          >
            Log in
          </Link>
        </Button>
      </div>
    </section>
  )
}
