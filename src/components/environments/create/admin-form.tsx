import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { Info } from "lucide-react"

const adminSchema = z.object({
  adminEmail: z.string().email("Must be a valid email"),
})

type AdminFormValues = z.infer<typeof adminSchema>

interface AdminFormProps {
  adminEmail?: string | null
  onAdminChange?: (email: string) => void
  onSubmit: (adminEmail: string) => void
  onCancel: () => void
}

export default function AdminForm({
  adminEmail,
  onAdminChange,
  onSubmit,
  onCancel,
}: AdminFormProps) {
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      adminEmail: adminEmail ?? "",
    },
  })

  const handleSubmit = useCallback(
    (values: AdminFormValues) => {
      onSubmit(values.adminEmail)
    },
    [onSubmit],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex h-full flex-col justify-between p-4 pt-0">
          <div className="mb-6 flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              Create administrator account
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 pt-0.5 text-content-subdued" />
              </TooltipTrigger>
              <TooltipContent className="max-w-72 bg-background-4 text-content-muted">
                Admins from the global environment are not able to authenticate
                in an isolated environment. Without at least 1 admin, an
                isolated environment would be innaccessible.
              </TooltipContent>
            </Tooltip>
          </div>

          <FormField
            control={form.control}
            name="adminEmail"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Email</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-4 pt-0.5 text-content-subdued" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-56 bg-background-4 text-content-muted">
                      The email address of the administrator for this
                      environment.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Input
                    placeholder="Enter an email..."
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      onAdminChange?.(e.target.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-8 flex items-center space-x-1 text-sm">
            <p className="text-content-subdued">
              If you want to learn more about environments, view the
            </p>
            <Button variant="link" size="link">
              <a
                href="https://keygen.sh/docs/api/environments/"
                target="_blank"
                rel="noreferrer"
              >
                documentation
              </a>
            </Button>
            <p className="text-content-subdued">for more information.</p>
          </div>
        </div>

        <DialogFooter className="border-t border-accent p-4">
          <Button variant="outline" onClick={onCancel} className="w-48">
            Cancel
          </Button>
          <Button type="submit" className="w-48">
            Continue
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
