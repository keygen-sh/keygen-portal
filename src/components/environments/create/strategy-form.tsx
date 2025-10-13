import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
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

import { GlobeLock, Globe, Info } from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"
import { IsolationStrategy } from "@/types/environments"

import { CardSelector, CardOption } from "@/components/card-selector"

const strategySchema = z.object({
  isolationStrategy: z.enum([
    IsolationStrategy.ISOLATED,
    IsolationStrategy.SHARED,
  ]),
})

type StrategyValues = z.infer<typeof strategySchema>

interface StrategyFormProps {
  isolationStrategy?: IsolationStrategy
  onStrategyChange?: (strategy: IsolationStrategy) => void
  onSubmit: (strategy: IsolationStrategy) => void
  onCancel: () => void
}

export default function StrategyForm({
  isolationStrategy,
  onStrategyChange,
  onSubmit,
  onCancel,
}: StrategyFormProps) {
  const isMobile = useMobile()

  const form = useForm<StrategyValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      isolationStrategy,
    },
  })

  const strategyOptions: CardOption<IsolationStrategy>[] = [
    {
      value: IsolationStrategy.ISOLATED,
      label: "Isolated",
      icon: <GlobeLock className="size-6 text-content-subdued md:size-5" />,
      tooltip:
        "The environment will be isolated from all other resources in other environments.",
    },
    {
      value: IsolationStrategy.SHARED,
      label: "Shared",
      icon: <Globe className="size-6 text-content-subdued md:size-5" />,
      tooltip:
        "The environment will be shared with the global environment. Resources in the global environment will be available as read-only resources.",
    },
  ]

  const handleSubmit = useCallback(
    (values: StrategyValues) => {
      onSubmit(values.isolationStrategy)
    },
    [onSubmit],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ScrollArea className="h-[60vh] md:h-[30vh]">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="mb-6 flex items-center gap-2">
              <h2 className="text-xl font-semibold md:text-lg">
                Choose isolation strategy
              </h2>
              {isMobile ? (
                <Popover>
                  <PopoverTrigger>
                    <Info className="size-5 text-content-subdued" />
                  </PopoverTrigger>
                  <PopoverContent className="mr-2 max-w-60 bg-background-4 text-content-muted">
                    The strategy used for isolating the environment from other
                    environments.
                  </PopoverContent>
                </Popover>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-4 pt-0.5 text-content-subdued" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-60 bg-background-4 text-content-muted">
                    The strategy used for isolating the environment from other
                    environments.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <FormField
              control={form.control}
              name="isolationStrategy"
              render={({ field }) => (
                <FormItem>
                  <CardSelector
                    options={strategyOptions}
                    value={field.value}
                    onChange={(value: IsolationStrategy) => {
                      field.onChange(value)
                      onStrategyChange?.(value)
                    }}
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

        <p className="hidden flex-wrap items-center gap-1 p-4 text-sm text-content-subdued md:flex">
          For more information on isolation strategies and their effects, see{" "}
          <Button asChild variant="link" size="link">
            <a
              href="https://keygen.sh/docs/api/environments/#notes-on-isolation"
              target="_blank"
              rel="noreferrer"
            >
              Notes on Isolation
            </a>
          </Button>
          .
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
          <Button type="submit" className="max-w-[12rem] flex-1 basis-1/2">
            Continue
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
