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
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { Info } from "lucide-react"

import SectionCard from "@/components/section-card"
import * as Loading from "@/components/loading"

const attributesSchema = z.object({
  name: z.string().min(1, "Environment name is required"),
  code: z.string().min(1, "Environment code is required"),
})

type AttributesFormValues = z.infer<typeof attributesSchema>

interface AttributesFormProps {
  name?: string | null
  code?: string | null
  onNameChange?: (name: string) => void
  onCodeChange?: (code: string) => void
  onSubmit: (values: { name: string; code: string }) => void
  onCancel: () => void
  loading?: boolean
}

export default function AttributesForm({
  name,
  code,
  onNameChange,
  onCodeChange,
  onSubmit,
  onCancel,
  loading,
}: AttributesFormProps) {
  const form = useForm<AttributesFormValues>({
    resolver: zodResolver(attributesSchema),
    defaultValues: {
      name: name ?? "",
      code: code ?? "",
    },
  })

  const handleSubmit = useCallback(
    (values: AttributesFormValues) => {
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
        <div className="flex h-full flex-col justify-between p-4 pt-0">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mx-0 mt-0 mb-5">
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
                <FormMessage className="ml-3" />
              </FormItem>
            )}
          />

          <SectionCard title="Environment attributes">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Code</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-4 pt-0.5 text-content-subdued" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-80 bg-background-4 text-content-muted">
                        The unique code for the environment. The code cannot
                        collide with any environments that already exist.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. sandbox"
                      disabled={loading}
                      onChange={(e) => {
                        field.onChange(e)
                        onCodeChange?.(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SectionCard>

          <p className="mt-8 flex flex-wrap items-center text-sm text-content-subdued">
            To learn more about environments, see the&nbsp;
            <Button asChild variant="link" size="link">
              <a
                href="https://keygen.sh/docs/api/environments/"
                target="_blank"
                rel="noreferrer"
              >
                documentation
              </a>
            </Button>
            &nbsp;for more information.
          </p>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-4 border-t border-accent p-4 md:flex-row">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full md:w-48"
          >
            Cancel
          </Button>
          <Button type="submit" className="w-full md:w-48" disabled={loading}>
            {loading ? <Loading.Dots className="bg-background" /> : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
