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
}

export default function AttributesForm({
  name,
  code,
  onNameChange,
  onCodeChange,
  onSubmit,
  onCancel,
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
                    variant="title"
                    placeholder="Enter environment name..."
                    className="border-none text-2xl placeholder:text-content-subdued!"
                    autoComplete="off"
                    {...field}
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
                      placeholder="e.g. sandbox"
                      {...field}
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
            Create
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
