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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { Award, Unlock, Lock, Info } from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"
import { DistributionStrategy, ProductDescription } from "@/types/products"

const strategySchema = z.object({
  distributionStrategy: z.enum([
    DistributionStrategy.LICENSED,
    DistributionStrategy.OPEN,
    DistributionStrategy.CLOSED,
  ]),
})

type StrategyFormValues = z.infer<typeof strategySchema>

interface StrategyFormProps {
  distributionStrategy?: DistributionStrategy
  onStrategyChange?: (strategy: DistributionStrategy) => void
  onDescriptionChange?: (desc: ProductDescription) => void
  onSubmit: (strategy: DistributionStrategy) => void
  onCancel: () => void
}

export default function StrategyForm({
  distributionStrategy,
  onStrategyChange,
  onDescriptionChange,
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
                  <div className="flex flex-col gap-4 md:flex-row">
                    <Card
                      className={cn(
                        "w-full cursor-pointer rounded-lg bg-background p-0.5 transition-colors duration-200 md:w-60",
                        field.value === DistributionStrategy.LICENSED
                          ? "bg-gradient-to-r from-primary to-secondary"
                          : "",
                      )}
                      onClick={() => {
                        field.onChange(DistributionStrategy.LICENSED)
                        onStrategyChange?.(DistributionStrategy.LICENSED)
                        onDescriptionChange?.(ProductDescription.LICENSED)
                      }}
                    >
                      <div className="space-y-4 rounded-[inherit] bg-background p-4">
                        <CardHeader className="p-0">
                          <CardTitle>
                            <Award className="size-6 text-content-subdued md:size-5" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-2 p-0">
                          <p className="text-lg font-medium text-content-loud md:text-base">
                            Licensed
                          </p>
                          {isMobile ? (
                            <Popover>
                              <PopoverTrigger
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="size-5 text-content-subdued" />
                              </PopoverTrigger>
                              <PopoverContent className="ml-2 max-w-60 bg-background-4 text-content-muted">
                                Only licensed users, with a valid license, can
                                access releases and release artifacts. API
                                authentication is required.
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-4 pt-0.5 text-content-subdued" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-60 bg-background-4 text-content-muted">
                                Only licensed users, with a valid license, can
                                access releases and release artifacts. API
                                authentication is required.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </CardContent>
                      </div>
                    </Card>

                    <Card
                      className={cn(
                        "w-full cursor-pointer rounded-lg bg-background p-0.5 transition-colors duration-200 md:w-60",
                        field.value === DistributionStrategy.OPEN
                          ? "bg-gradient-to-r from-primary to-secondary"
                          : "",
                      )}
                      onClick={() => {
                        field.onChange(DistributionStrategy.OPEN)
                        onStrategyChange?.(DistributionStrategy.OPEN)
                        onDescriptionChange?.(ProductDescription.OPEN)
                      }}
                    >
                      <div className="space-y-4 rounded-[inherit] bg-background p-4">
                        <CardHeader className="p-0">
                          <CardTitle>
                            <Unlock className="size-6 text-content-subdued md:size-5" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-2 p-0">
                          <p className="text-lg font-medium text-content-loud md:text-base">
                            Open
                          </p>
                          {isMobile ? (
                            <Popover>
                              <PopoverTrigger
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="size-5 text-content-subdued" />
                              </PopoverTrigger>
                              <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                                Anybody can access releases. No API
                                authentication required, so this is a great
                                option for rendering releases on a public
                                downloads page, open source projects, or
                                freemium products.
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-4 pt-0.5 text-content-subdued" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-64 bg-background-4 text-content-muted">
                                Anybody can access releases. No API
                                authentication required, so this is a great
                                option for rendering releases on a public
                                downloads page, open source projects, or
                                freemium products.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </CardContent>
                      </div>
                    </Card>

                    <Card
                      className={cn(
                        "w-full cursor-pointer rounded-lg bg-background p-0.5 transition-colors duration-200 md:w-60",
                        field.value === DistributionStrategy.CLOSED
                          ? "bg-gradient-to-r from-primary to-secondary"
                          : "",
                      )}
                      onClick={() => {
                        field.onChange(DistributionStrategy.CLOSED)
                        onStrategyChange?.(DistributionStrategy.CLOSED)
                        onDescriptionChange?.(ProductDescription.CLOSED)
                      }}
                    >
                      <div className="space-y-4 rounded-[inherit] bg-background p-4">
                        <CardHeader className="p-0">
                          <CardTitle>
                            <Lock className="size-6 text-content-subdued md:size-5" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-2 p-0">
                          <p className="text-lg font-medium text-content-loud md:text-base">
                            Closed
                          </p>
                          {isMobile ? (
                            <Popover>
                              <PopoverTrigger
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="size-5 text-content-subdued" />
                              </PopoverTrigger>
                              <PopoverContent className="ml-2 max-w-60 bg-background-4 text-content-muted">
                                Only admins can access releases. Download links
                                will need to be generated server-side. API
                                authentication is required.
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-4 pt-0.5 text-content-subdued" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-60 bg-background-4 text-content-muted">
                                Only admins can access releases. Download links
                                will need to be generated server-side. API
                                authentication is required.
                              </TooltipContent>
                            </Tooltip>
                          )}
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

        <p className="hidden flex-wrap items-center gap-1 p-4 text-sm text-content-subdued md:flex">
          To learn more about products, see the{" "}
          <Button asChild variant="link" size="link">
            <a
              href="https://keygen.sh/docs/api/products/"
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
          <Button type="submit" className="max-w-[12rem] flex-1 basis-1/2">
            Continue
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
