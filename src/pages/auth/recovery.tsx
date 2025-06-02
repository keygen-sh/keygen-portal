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

import * as keygen from "@/keygen"
import BackButton from "@/components/back-button"

const recoverySchema = z.object({
  username: z.string().email("Please enter a valid email."),
})

export default function Recovery() {
  const navigate = useNavigate()

  const recoveryForm = useForm<z.infer<typeof recoverySchema>>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { username: "" },
  })

  function onSubmitRecovery() {
    // TODO(cazden): Handle SMTP
    void navigate({ to: "/$id/auth/sent", params: { id: keygen.config.id } })
  }

  return (
    <section className="flex w-80 flex-col justify-center">
      <Form {...recoveryForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void recoveryForm.handleSubmit(onSubmitRecovery)(e)
          }}
          noValidate
          className="my-3 w-full space-y-7"
        >
          <BackButton
            path="/auth/login"
            label="Return to Login"
            className="md:hidden"
          />
          <div className="flex flex-col space-y-4">
            <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
              Recover your password
            </h1>
            <p className="text-[13px] text-content-muted">
              Enter the email address associated with your account, and we'll
              send over a link to set a new one.
            </p>
          </div>
          <FormField
            control={recoveryForm.control}
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
    </section>
  )
}
