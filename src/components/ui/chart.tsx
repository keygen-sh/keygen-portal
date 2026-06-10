"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video min-h-0 min-w-0 justify-center overflow-hidden text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-content-subdued",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-accent",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-accent",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-accent",
          "[&_.recharts-radial-bar-background-sector]:fill-background-2",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-background-2",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-accent",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          debounce={500}
          initialDimension={{ width: 1, height: 1 }}
          minWidth={0}
          minHeight={0}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  )

  if (!colorConfig.length) {
    return null
  }

  const css = Object.entries(THEMES)
    .map(
      ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`,
    )
    .join("\n")

  return <style>{css}</style>
}

const ChartLegend = RechartsPrimitive.Legend

function ChartTooltip({
  wrapperStyle,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return (
    <RechartsPrimitive.Tooltip
      wrapperStyle={{ zIndex: 10, ...wrapperStyle }}
      {...props}
    />
  )
}

type ChartTooltipPayloadItem = {
  color?: string
  dataKey?: string | number
  fill?: string
  name?: string | number
  payload: Record<string, unknown>
  type?: string
  value?: number | string
}

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean
  color?: string
  formatter?: (
    value: ChartTooltipPayloadItem["value"],
    name: ChartTooltipPayloadItem["name"],
    item: ChartTooltipPayloadItem,
    index: number,
    payload: readonly ChartTooltipPayloadItem[],
  ) => React.ReactNode
  hideIndicator?: boolean
  hideLabel?: boolean
  indicator?: "line" | "dot" | "dashed"
  label?: React.ReactNode
  labelClassName?: string
  labelFormatter?: (
    label: React.ReactNode,
    payload: readonly ChartTooltipPayloadItem[],
  ) => React.ReactNode
  labelKey?: string
  nameKey?: string
  payload?: readonly ChartTooltipPayloadItem[]
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium text-content-muted", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return (
      <div className={cn("font-medium text-content-muted", labelClassName)}>
        {value}
      </div>
    )
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "grid max-w-[calc(100vw-2rem)] min-w-52 items-start gap-2 rounded-md border border-accent bg-background-2 p-3 text-xs shadow-lg duration-150 animate-in fade-in-0 zoom-in-95",
        className,
      )}
    >
      {tooltipLabel}
      {tooltipLabel && <div className="h-px bg-accent" />}
      <div className="grid gap-2">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor =
              color || (item.payload.fill as string | undefined) || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-content-subdued",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "size-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                            },
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between gap-4 leading-none",
                        "items-center",
                      )}
                    >
                      <div className="grid min-w-0 gap-1.5">
                        <span className="break-words text-content-subdued">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value != null && (
                        <span className="shrink-0 font-mono font-medium text-content-loud tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

type ChartLegendPayloadItem = {
  color?: string
  dataKey?: string | number
  type?: string
  value?: string | number
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  hideIcon?: boolean
  nameKey?: string
  payload?: readonly ChartLegendPayloadItem[]
  verticalAlign?: "top" | "middle" | "bottom"
}) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-start gap-4 overflow-x-auto overflow-y-hidden whitespace-nowrap text-content-normal [scrollbar-gutter:stable]",
        verticalAlign === "top" ? "pb-3" : "pt-3 pb-2",
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className="flex shrink-0 items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-content-subdued"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
    </div>
  )
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key]
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
}
