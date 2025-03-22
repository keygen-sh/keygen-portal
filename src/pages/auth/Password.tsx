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
import { Checkbox } from "@/assets/components/ui/checkbox"

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  remember: z.boolean().optional(),
})

export default function Password() {
  const navigate = useNavigate()

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      remember: false,
    },
  })

  function onReturnToLogin() {
    void navigate({ to: "/auth/login" })
  }

  function onSubmitPassword() {
    // TODO: Handle auth
    void navigate({ to: "/app/home" })
  }

  const renderPasswordForm = () => (
    <section className="flex w-80 flex-col justify-center">
      <h1 className="mb-8 bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
        Enter your password
      </h1>

      <Form {...passwordForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void passwordForm.handleSubmit(onSubmitPassword)(e)
          }}
          className="relative my-3 w-full space-y-7"
        >
          <FormField
            control={passwordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-content-muted">Password</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    type="password"
                    toggle={true}
                    autoComplete="current-password"
                    placeholder="Enter your password..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />

                <Link
                  to="/auth/recovery"
                  className="underline-slide w-fit pb-0.75 text-sm font-semibold text-secondary select-none"
                >
                  Forgot password?
                </Link>
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
                  />
                </FormControl>
                <FormLabel className="text-content-muted">
                  Remember me on this device
                </FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full">
            Sign in
          </Button>
        </form>
      </Form>
      <div className="flex w-full justify-center">
        <Button
          variant="link"
          size="link"
          className="w-fit text-content-subdued"
          onClick={() => {
            onReturnToLogin()
          }}
        >
          Use a different email
        </Button>
      </div>
    </section>
  )

  return (
    <div className="flex w-full flex-col items-center justify-center">
      {renderPasswordForm()}
    </div>
  )
}
