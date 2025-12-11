import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { TriangleAlert } from "lucide-react"

import * as Forms from "@/forms"
import {
  Environment,
  EnvironmentAttributeDescriptions,
} from "@/types/environments"

import { useMobile } from "@/hooks/use-mobile"

import * as Field from "@/components/field"
import * as Loading from "@/components/loading"
import DocumentationLink from "@/components/documentation-link"

interface EnvironmentEditProps {
  environment: Environment
  onSubmit: (values: Forms.Environments.UpdateValues) => void
  onCancel: () => void
  loading: boolean
  error: string | null
}

export default function EnvironmentEditForm({
  environment,
  onSubmit,
  onCancel,
  loading,
  error,
}: EnvironmentEditProps) {
  const isMobile = useMobile()

  const form = useForm<Forms.Environments.UpdateValues>({
    resolver: zodResolver(Forms.Environments.UpdateSchema),
    defaultValues: {
      name: environment.attributes.name || "",
      code: environment.attributes.code || "",
    },
  })

  const handleSubmit = useCallback(
    (values: Forms.Environments.UpdateValues) => {
      onSubmit(values)
    },
    [onSubmit],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex h-full flex-col"
      >
        <ScrollArea className="h-[60vh] md:h-[30vh]">
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
                      className="mt-4 border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                      autoComplete="off"
                      disabled={loading}
                      onChange={(e) => {
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormMessage className="ml-3" />
                </FormItem>
              )}
            />

            <Card className="mt-4 rounded-sm bg-background p-0">
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
                      <Field.Header
                        label="Code"
                        tooltip={EnvironmentAttributeDescriptions.code}
                        variant="stacking"
                      >
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. sandbox"
                            disabled={loading}
                            onChange={(e) => {
                              field.onChange(e)
                            }}
                          />
                        </FormControl>
                      </Field.Header>
                      <FormMessage>{error || ""}</FormMessage>
                    </FormItem>
                  )}
                />

                {isMobile ? (
                  <Popover>
                    <PopoverTrigger
                      type="button"
                      className="flex items-center gap-1 text-sm text-brand-amber"
                    >
                      <TriangleAlert className="size-5 flex-none pt-0.5" />

                      <span className="text-brand-amber underline">
                        Note on updating environment codes
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-88 bg-background-4 text-content-muted">
                      <span>
                        Renaming an environment code that is already in use may
                        cause requests using the old environment code to fail.
                      </span>
                      <Separator className="my-2 bg-content-subdued" />
                      <span>
                        We suggest making sure the existing code is no longer in
                        use before changing it, to prevent unintended request
                        failures.
                      </span>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className="flex items-center gap-1 text-xs text-brand-amber"
                    >
                      <TriangleAlert className="size-3 flex-none" />
                      <p>
                        Renaming an environment code that is already in use may
                        cause requests using the old environment code to fail.
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-88 bg-background-4 text-content-muted">
                      We suggest making sure the existing code is no longer in
                      use before changing it, to prevent unintended request
                      failures.
                    </TooltipContent>
                  </Tooltip>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DocumentationLink page="environments" />

        <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="max-w-[12rem] flex-1 basis-1/2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="max-w-[12rem] flex-1 basis-1/2"
            disabled={!form.formState.isValid || loading}
          >
            {loading ? <Loading.Dots className="bg-background" /> : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
