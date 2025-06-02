import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { TriangleAlert } from "lucide-react"

import { Environment } from "@/types/environments"
import * as Loading from "@/components/loading"

const editEnvironmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
})

type EditEnvironmentFormValues = z.infer<typeof editEnvironmentSchema>

interface EnvironmentEditProps {
  name: string | null
  code: string | null
  onNameChange: (name: string) => void
  onCodeChange: (code: string) => void
  environment: Environment
  onSubmit: () => void
  onCancel: () => void
  loading: boolean
}

export default function EnvironmentEditForm({
  name,
  code,
  onNameChange,
  onCodeChange,
  onSubmit,
  onCancel,
  loading,
}: EnvironmentEditProps) {
  const form = useForm<EditEnvironmentFormValues>({
    resolver: zodResolver(editEnvironmentSchema),
    defaultValues: {
      name: name || "",
      code: code || "",
    },
  })

  const handleSubmit = useCallback(() => {
    onSubmit()
  }, [onSubmit])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex h-full flex-col"
      >
        <div className="flex h-full flex-col justify-between p-4 pt-0">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    variant="title"
                    placeholder="Enter environment name..."
                    className="border-none text-2xl placeholder:text-content-subdued!"
                    autoComplete="off"
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(e)
                      onNameChange?.(e.target.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card className="my-4 rounded-sm bg-background p-0">
            <CardHeader className="h-9 rounded-t-sm border-b border-accent bg-background-1 px-4 py-2">
              <CardTitle className="text-sm text-content-loud">
                Environment Attributes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. qa"
                        disabled={loading}
                        onChange={(e) => {
                          field.onChange(e)
                          onCodeChange?.(e.target.value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 text-xs text-brand-amber">
                        <TriangleAlert className="size-3" />
                        <p>
                          Renaming an environment code that is already in use
                          may cause requests using the old environment code to
                          fail.
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-88 bg-background-4 text-content-muted">
                        We suggest making sure the existing code is no longer in
                        use before changing it, to prevent unintended request
                        failures.
                      </TooltipContent>
                    </Tooltip>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center space-x-1 text-sm">
            <p className="text-content-subdued">
              If you want to learn more about environments, view the
            </p>
            <Button variant="link" size="link">
              <a
                href="https://keygen.sh/docs/api/environments/"
                target="_blank"
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
          <Button type="submit" className="w-48" disabled={loading}>
            {loading ? <Loading.Dots className="bg-background" /> : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
