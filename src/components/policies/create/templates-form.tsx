import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"
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
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { CardSelector, CardOption } from "@/components/card-selector"

import {
  Clock,
  ClockFading,
  Infinity,
  Hexagon,
  User,
  Cpu,
  Activity,
  Binary,
  Hash,
  Info,
} from "lucide-react"

import {
  TimingTemplates,
  AccessTemplates,
  MeteredTemplates,
  PolicyTemplateSelection,
} from "@/types/policies"

import { useMobile } from "@/hooks/use-mobile"

const schema = z.object({
  timing: z.nativeEnum(TimingTemplates).nullable().optional(),
  access: z.array(z.nativeEnum(AccessTemplates)).default([]),
  metered: z.array(z.nativeEnum(MeteredTemplates)).default([]),
  advanced: z.boolean().default(true),
  offline: z.boolean().default(false),
})

export type TemplatesValues = z.infer<typeof schema>

type TemplatesFormProps = {
  initial?: Partial<PolicyTemplateSelection>
  onSubmit: (values: TemplatesValues) => void
  onStartScratch?: () => void
}

export default function TemplatesForm({
  initial,
  onSubmit,
  onStartScratch,
}: TemplatesFormProps) {
  const isMobile = useMobile()

  const form = useForm<TemplatesValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      timing: initial?.timing ?? null,
      access: initial?.access ?? [],
      metered: initial?.metered ?? [],
      advanced: initial?.advanced ?? true,
      offline: initial?.offline ?? true,
    },
  })

  // TODO(cazden) Add parameter tooltip descriptions
  const timingOptions: CardOption<TimingTemplates>[] = [
    {
      value: TimingTemplates.Perpetual,
      label: "Perpetual",
      icon: <Infinity className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: TimingTemplates.Timed,
      label: "Timed",
      icon: <Clock className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: TimingTemplates.PerpetualFallback,
      label: "Perpetual‑fallback",
      icon: <ClockFading className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
  ]

  const accessOptions: CardOption<AccessTemplates>[] = [
    {
      value: AccessTemplates.NodeLocked,
      label: "Node‑locked",
      icon: <Hexagon className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: AccessTemplates.UserLocked,
      label: "User‑locked",
      icon: <User className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
  ]

  const meteredOptions: CardOption<MeteredTemplates>[] = [
    {
      value: MeteredTemplates.ProcessBased,
      label: "Process‑based",
      icon: <Cpu className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: MeteredTemplates.LeaseBased,
      label: "Lease‑based",
      icon: <Activity className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: MeteredTemplates.FeatureBased,
      label: "Feature‑based",
      icon: <Binary className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: MeteredTemplates.UsageBased,
      label: "Usage‑based",
      icon: <Hash className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
  ]

  const submit = useCallback((v: TemplatesValues) => onSubmit(v), [onSubmit])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <ScrollArea className="h-[calc(100vh-15rem)] md:w-3xl">
          <div className="space-y-8 p-4">
            <div className="space-y-3">
              <h2 className="font-owners-wide text-sm font-medium tracking-wider text-content-normal uppercase">
                Timing
              </h2>
              <FormField
                control={form.control}
                name="timing"
                render={({ field }) => (
                  <FormItem>
                    <CardSelector
                      options={timingOptions}
                      value={field.value}
                      onChange={(value) =>
                        field.onChange(
                          field.value === value ? undefined : value,
                        )
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <h2 className="font-owners-wide text-sm font-medium tracking-wider text-content-normal uppercase">
                  Access
                </h2>
                <span className="ml-4 font-owners-text text-xs font-normal tracking-wider text-content-subdued uppercase">
                  Select all that apply
                </span>
              </div>
              <FormField
                control={form.control}
                name="access"
                render={({ field }) => (
                  <FormItem>
                    <CardSelector
                      options={accessOptions}
                      multiple
                      value={field.value ?? []}
                      onChange={(value) => field.onChange(value)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <h2 className="font-owners-wide text-sm font-medium tracking-wider text-content-normal uppercase">
                  Metered
                </h2>
                <span className="ml-4 font-owners-text text-xs font-normal tracking-wider text-content-subdued uppercase">
                  Select all that apply
                </span>
              </div>
              <FormField
                control={form.control}
                name="metered"
                render={({ field }) => (
                  <FormItem>
                    <CardSelector
                      options={meteredOptions}
                      multiple
                      value={field.value ?? []}
                      onChange={(value) => field.onChange(value)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex flex-col sm:flex-col">
          <div className="flex items-center gap-8 border-t border-accent p-4">
            <FormField
              control={form.control}
              name="offline"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormControl>
                    <Checkbox
                      id="offline"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                  <Label htmlFor="offline">Offline</Label>
                  {isMobile ? (
                    <Popover>
                      <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                        <Info className="size-5 text-content-subdued" />
                      </PopoverTrigger>
                      <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                        TODO
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-4 text-content-subdued" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64 bg-background-4 text-content-muted">
                        TODO
                      </TooltipContent>
                    </Tooltip>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="advanced"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormControl>
                    <Checkbox
                      id="advanced"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                  <Label htmlFor="advanced">
                    Include advanced configuration
                  </Label>
                  {isMobile ? (
                    <Popover>
                      <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                        <Info className="size-5 text-content-subdued" />
                      </PopoverTrigger>
                      <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                        TODO
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-4 text-content-subdued" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64 bg-background-4 text-content-muted">
                        TODO
                      </TooltipContent>
                    </Tooltip>
                  )}
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-between gap-4 border-t border-accent p-4">
            <Button
              variant="outline"
              type="button"
              onClick={onStartScratch}
              className="max-w-[12rem] flex-1 basis-1/2"
            >
              Start from scratch
            </Button>
            <Button type="submit" className="max-w-[12rem] flex-1 basis-1/2">
              Continue
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Form>
  )
}
