import { useNavigate } from "@tanstack/react-router"
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

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
})

export default function Reset() {
  const navigate = useNavigate()

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  })

  function onSubmitResetPassword() {
    // TODO(cazden) Handle previous password case & auth
    void navigate({
      to: "/$id/app/dashboard",
      params: { id: keygen.config.id },
    })
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...resetPasswordForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void resetPasswordForm.handleSubmit(onSubmitResetPassword)(e)
          }}
          className="my-3 space-y-7"
        >
          <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
            Set a new password
          </h1>
          <FormField
            control={resetPasswordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-content-muted">
                  New Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    toggle={true}
                    autoComplete="new-password"
                    autoFocus
                    placeholder="Enter your password..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full">
            Confirm & sign-in
          </Button>
        </form>
      </Form>
    </section>
  )
}
