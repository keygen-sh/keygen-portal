import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { GlobeLock, Globe, Info } from "lucide-react"

import { STRATEGIES, DESCRIPTIONS } from "@/constants/environments"

const strategySchema = z.object({
  isolationStrategy: z.enum([STRATEGIES.ISOLATED, STRATEGIES.SHARED]),
})

type StrategyValues = z.infer<typeof strategySchema>

interface StrategyFormProps {
  isolationStrategy?: STRATEGIES
  onStrategyChange?: (strategy: STRATEGIES) => void
  onDescriptionChange?: (desc: DESCRIPTIONS) => void
  onSubmit: (strategy: STRATEGIES) => void
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
        <div className="flex h-full flex-col justify-between p-4 pt-0">
          <div className="mb-6 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Choose isolation strategy</h2>
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
                <div className="flex gap-4">
                  <Card
                    className={cn(
                      "w-60 cursor-pointer rounded-xl bg-background p-px transition-colors duration-200",
                      field.value === STRATEGIES.ISOLATED
                        ? "bg-gradient-to-r from-primary to-secondary"
                        : "",
                    )}
                    onClick={() => {
                      field.onChange(STRATEGIES.ISOLATED)
                      onStrategyChange?.(STRATEGIES.ISOLATED)
                      onDescriptionChange?.(DESCRIPTIONS.ISOLATED)
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
                            resources in other environments. This is effectively
                            a separate Keygen account.
                          </TooltipContent>
                        </Tooltip>
                      </CardContent>
                    </div>
                  </Card>

                  <Card
                    className={cn(
                      "w-60 cursor-pointer rounded-xl bg-background p-px transition-colors duration-200",
                      field.value === STRATEGIES.SHARED
                        ? "bg-gradient-to-r from-primary to-secondary"
                        : "",
                    )}
                    onClick={() => {
                      field.onChange(STRATEGIES.SHARED)
                      onStrategyChange?.(STRATEGIES.SHARED)
                      onDescriptionChange?.(DESCRIPTIONS.SHARED)
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

          <div className="mt-8 flex items-center text-sm text-content-subdued">
            For more information on isolation strategies and their effects,
            please see
            <Button variant="link" size="link" className="ml-1">
              <a
                href="https://keygen.sh/docs/api/environments/#notes-on-isolation"
                target="_blank"
                rel="noreferrer"
              >
                Notes on Isolation
              </a>
            </Button>
            .
          </div>
        </div>

        <DialogFooter className="border-t border-accent p-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="w-48"
          >
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
