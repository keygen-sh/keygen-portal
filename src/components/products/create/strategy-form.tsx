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

import { Award, Unlock, Lock, Info } from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"
import { DistributionStrategy } from "@/types/products"

import DocumentationLink from "@/components/documentation-link"
import { CardSelector, CardOption } from "@/components/card-selector"

const strategySchema = z.object({
  distributionStrategy: z.enum([
    DistributionStrategy.Licensed,
    DistributionStrategy.Open,
    DistributionStrategy.Closed,
  ]),
})

type StrategyFormValues = z.infer<typeof strategySchema>

interface StrategyFormProps {
  distributionStrategy?: DistributionStrategy
  onStrategyChange?: (strategy: DistributionStrategy) => void
  onSubmit: (strategy: DistributionStrategy) => void
  onCancel: () => void
}

export default function StrategyForm({
  distributionStrategy,
  onStrategyChange,
  onSubmit,
  onCancel,
}: StrategyFormProps) {
  const isMobile = useMobile()

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      distributionStrategy,
    },
  })

  const strategyOptions: CardOption<DistributionStrategy>[] = [
    {
      value: DistributionStrategy.Licensed,
      label: "Licensed",
      icon: <Award className="size-6 text-content-subdued md:size-5" />,
      tooltip:
        "Only licensed users, with a valid license, can access releases and release artifacts. API authentication is required.",
    },
    {
      value: DistributionStrategy.Open,
      label: "Open",
      icon: <Unlock className="size-6 text-content-subdued md:size-5" />,
      tooltip:
        "Anybody can access releases. No API authentication required, so this is a great option for public downloads, open-source projects, or freemium products.",
    },
    {
      value: DistributionStrategy.Closed,
      label: "Closed",
      icon: <Lock className="size-6 text-content-subdued md:size-5" />,
      tooltip:
        "Only admins can access releases. Download links must be generated server-side. API authentication is required.",
    },
  ]

  const handleSubmit = useCallback(
    (values: StrategyFormValues) => {
      onSubmit(values.distributionStrategy)
    },
    [onSubmit],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ScrollArea className="h-[60vh] md:h-[45vh]">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="mb-6 flex items-center gap-2">
              <h2 className="text-xl font-semibold md:text-lg">
                Choose distribution strategy
              </h2>
              {isMobile ? (
                <Popover>
                  <PopoverTrigger>
                    <Info className="size-5 text-content-subdued" />
                  </PopoverTrigger>
                  <PopoverContent className="mr-2 max-w-60 bg-background-4 text-content-muted">
                    The distribution strategy for releases.
                  </PopoverContent>
                </Popover>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-4 pt-0.5 text-content-subdued" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-60 bg-background-4 text-content-muted">
                    The distribution strategy for releases.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <FormField
              control={form.control}
              name="distributionStrategy"
              render={({ field }) => (
                <FormItem>
                  <CardSelector
                    options={strategyOptions}
                    value={field.value}
                    onChange={(value: DistributionStrategy) => {
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

        <DocumentationLink page="products" />

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
