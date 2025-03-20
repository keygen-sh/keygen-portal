import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/assets/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/assets/components/ui/form";
import { Input } from "@/assets/components/ui/input";
import { Checkbox } from "@/assets/components/ui/checkbox";

const emailSchema = z.object({
  username: z.string().email("Please enter a valid email."),
});

export default function Login() {
  const [step, setStep] = useState(1);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { username: "" },
  });

  function onSubmitEmail() {
    setStep(2);
  }

  const renderEmailForm = () => (
    <section className="flex w-80 flex-col justify-center">
      <h1 className="mb-8 bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent">
        Sign in to your account
      </h1>

      <Form {...emailForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void emailForm.handleSubmit(onSubmitEmail)(e);
          }}
          className="my-3 w-full space-y-7"
        >
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

      <div className="space-x-2 rounded border border-content-subdued p-3 text-center text-sm">
        <span className="text-content-subdued">No account yet?</span>
        <Link
          to="/auth/register"
          className="text-content-main underline-slide py-0.5 font-bold"
        >
          Create one
        </Link>
      </div>

      <div className="mt-2 flex w-full justify-center">
        <Button variant="link" size="link" onClick={() => {}}>
          Sign in with SSO
        </Button>
      </div>
    </section>
  );

  return (
    <div className="flex w-full flex-col items-center justify-center">
      {step === 1 ? renderEmailForm() : null}
    </div>
  );
}
