import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { Info } from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"
import SectionCard from "@/components/section-card"
import * as Loading from "@/components/loading"

const attributesSchema = z.object({
  name: z.string().min(1, "Environment name is required"),
  code: z.string().min(1, "Environment code is required"),
})

export type AttributesFormValues = z.infer<typeof attributesSchema>

interface AttributesFormProps {
  loading?: boolean
  error?: string | null
  onSubmit: (values: { name: string; code: string }) => void
  onCancel: () => void
}

export default function AttributesForm({
  loading,
  error,
  onSubmit,
  onCancel,
}: AttributesFormProps) {
  const isMobile = useMobile()

  const form = useForm<AttributesFormValues>({
    resolver: zodResolver(attributesSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
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
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ScrollArea className="h-[60vh] md:h-[30vh]">
          <div className="flex h-full flex-col justify-between p-4">
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
                      className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                      autoFocus
                      autoComplete="off"
                      disabled={loading}
                      onChange={(e) => {
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SectionCard title="Environment attributes" className="mt-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Code</FormLabel>
                      {isMobile ? (
                        <Popover>
                          <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                            <Info className="size-5 text-content-subdued" />
                          </PopoverTrigger>
                          <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                            The unique code for the environment. The code cannot
                            collide with any environments that already exist.
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="size-4 pt-0.5 text-content-subdued" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-80 bg-background-4 text-content-muted">
                            The unique code for the environment. The code cannot
                            collide with any environments that already exist.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
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
                    <FormMessage>{error || ""}</FormMessage>
                  </FormItem>
                )}
              />
            </SectionCard>
          </div>
        </ScrollArea>

        <p className="hidden flex-wrap items-center gap-1 p-4 text-sm text-content-subdued md:flex">
          To learn more about environments, see the{" "}
          <Button asChild variant="link" size="link">
            <a
              href="https://keygen.sh/docs/api/environments/"
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
            disabled={loading}
            className="max-w-[12rem] flex-1 basis-1/2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="max-w-[12rem] flex-1 basis-1/2"
            disabled={loading}
          >
            {loading ? <Loading.Dots className="bg-background" /> : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
