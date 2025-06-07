import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { GlobeLock, Globe, Info } from "lucide-react"

import { IsolationStrategy, EnvironmentDescription } from "@/types/environments"

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
  onDescriptionChange?: (desc: EnvironmentDescription) => void
  onSubmit: (strategy: IsolationStrategy) => void
  onCancel: () => void
}

export default function StrategyForm({
  isolationStrategy,
  onStrategyChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
}: StrategyFormProps) {
  const form = useForm<StrategyValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      isolationStrategy,
    },
  })

  const handleSubmit = useCallback(
    (values: StrategyValues) => {
      onSubmit(values.isolationStrategy)
    },
    [onSubmit],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ScrollArea className="h-[60vh] md:h-[20vh]">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="mb-6 flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                Choose isolation strategy
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 pt-0.5 text-content-subdued" />
                </TooltipTrigger>
                <TooltipContent className="max-w-60 bg-background-4 text-content-muted">
                  The strategy used for isolating the environment from other
                  environments.
                </TooltipContent>
              </Tooltip>
            </div>

            <FormField
              control={form.control}
              name="isolationStrategy"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col gap-4 md:flex-row">
                    <Card
                      className={cn(
                        "w-60 cursor-pointer rounded-lg bg-background p-0.5 transition-colors duration-200",
                        field.value === IsolationStrategy.ISOLATED
                          ? "bg-gradient-to-r from-primary to-secondary"
                          : "",
                      )}
                      onClick={() => {
                        field.onChange(IsolationStrategy.ISOLATED)
                        onStrategyChange?.(IsolationStrategy.ISOLATED)
                        onDescriptionChange?.(EnvironmentDescription.ISOLATED)
                      }}
                    >
                      <div className="space-y-4 rounded-[inherit] bg-background p-4">
                        <CardHeader className="p-0">
                          <CardTitle>
                            <GlobeLock className="size-5 text-content-subdued" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-2 p-0">
                          <p className="text-base font-medium text-content-loud">
                            Isolated
                          </p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="size-4 pt-0.5 text-content-subdued" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-64 bg-background-4 text-content-muted">
                              The environment will be isolated from all other
                              resources in other environments. This is
                              effectively a separate Keygen account.
                            </TooltipContent>
                          </Tooltip>
                        </CardContent>
                      </div>
                    </Card>

                    <Card
                      className={cn(
                        "w-60 cursor-pointer rounded-lg bg-background p-0.5 transition-colors duration-200",
                        field.value === IsolationStrategy.SHARED
                          ? "bg-gradient-to-r from-primary to-secondary"
                          : "",
                      )}
                      onClick={() => {
                        field.onChange(IsolationStrategy.SHARED)
                        onStrategyChange?.(IsolationStrategy.SHARED)
                        onDescriptionChange?.(EnvironmentDescription.SHARED)
                      }}
                    >
                      <div className="space-y-4 rounded-[inherit] bg-background p-4">
                        <CardHeader className="p-0">
                          <CardTitle>
                            <Globe className="size-5 text-content-subdued" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-2 p-0">
                          <p className="text-base font-medium text-content-loud">
                            Shared
                          </p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="size-4 pt-0.5 text-content-subdued" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-60 bg-background-4 text-content-muted">
                              The environment will be shared with the global
                              environment. Resources in the global environment
                              will be available as read-only resources.
                            </TooltipContent>
                          </Tooltip>
                        </CardContent>
                      </div>
                    </Card>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

        <p className="hidden flex-wrap items-center p-4 text-sm text-content-subdued md:flex">
          For more information
          <span className="hidden md:inline">
            &nbsp;on isolation strategies and their effects
          </span>
          , see&nbsp;
          <Button asChild variant="link" size="link">
            <a
              href="https://keygen.sh/docs/api/environments/#notes-on-isolation"
              target="_blank"
              rel="noreferrer"
            >
              Notes&nbsp;on&nbsp;Isolation
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
