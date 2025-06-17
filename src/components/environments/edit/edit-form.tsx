import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
  FormLabel,
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

import { useMobile } from "@/hooks/use-mobile"

import { Info, TriangleAlert } from "lucide-react"

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
  error: string | null
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
  error,
  onNameChange,
  onCodeChange,
  onSubmit,
  onCancel,
  loading,
}: EnvironmentEditProps) {
  const isMobile = useMobile()

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
                        onNameChange?.(e.target.value)
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
                      <div className="flex items-center gap-2">
                        <FormLabel className="">Code</FormLabel>
                        {isMobile ? (
                          <Popover>
                            <PopoverTrigger
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Info className="size-5 text-content-subdued" />
                            </PopoverTrigger>
                            <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                              The unique code for the environment. The code
                              cannot collide with any environments that already
                              exist.
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="size-4 text-content-subdued" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-80 bg-background-4 text-content-muted">
                              The unique code for the environment. The code
                              cannot collide with any environments that already
                              exist.
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
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
                      <FormMessage>{error || ""}</FormMessage>
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
                              Renaming an environment code that is already in
                              use may cause requests using the old environment
                              code to fail.
                            </span>
                            <Separator className="my-2 bg-content-subdued" />
                            <span>
                              We suggest making sure the existing code is no
                              longer in use before changing it, to prevent
                              unintended request failures.
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
                              Renaming an environment code that is already in
                              use may cause requests using the old environment
                              code to fail.
                            </p>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-88 bg-background-4 text-content-muted">
                            We suggest making sure the existing code is no
                            longer in use before changing it, to prevent
                            unintended request failures.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <p className="hidden flex-wrap items-center gap-1 p-4 text-sm text-content-subdued md:flex">
          To learn more about environments, see the{" "}
          <Button asChild variant="link" size="link">
            <a
              href="https://keygen.sh/docs/api/environments"
              target="_blank"
              rel="noreferrer"
            >
              documentation
            </a>
          </Button>{" "}
          for more information.
        </p>

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
            disabled={loading}
          >
            {loading ? <Loading.Dots className="bg-background" /> : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
