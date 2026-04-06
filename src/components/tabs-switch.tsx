import React, {
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useImperativeHandle,
} from "react"

import { cn } from "@/lib/utils"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"

type Option = {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface TabsSwitchProps
  extends React.ComponentPropsWithoutRef<typeof TabsList> {
  options: Option[]
  borderless?: boolean
}

const TabsSwitch = React.forwardRef<HTMLDivElement, TabsSwitchProps>(
  ({ options, borderless, className, ...props }, ref) => {
    const wrapRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const barRef = useRef<HTMLSpanElement>(null)

    useImperativeHandle(ref, () => listRef.current as HTMLDivElement, [])

    const placeBar = (element: HTMLElement | null) => {
      if (!element || !barRef.current) return
      barRef.current.style.left = `${element.offsetLeft}px`
      barRef.current.style.width = `${element.offsetWidth}px`
    }

    const moveToActive = useCallback(() => {
      if (!listRef.current) return
      const active = listRef.current.querySelector<HTMLElement>(
        '[data-state="active"]',
      )
      placeBar(active)
    }, [])

    useLayoutEffect(moveToActive, [moveToActive])
    useEffect(moveToActive, [moveToActive])

    useEffect(() => {
      const onResize = () => moveToActive()
      window.addEventListener("resize", onResize)

      const resizeObserver = listRef.current
        ? new ResizeObserver(() => moveToActive())
        : null
      if (listRef.current && resizeObserver)
        resizeObserver.observe(listRef.current)
      return () => {
        window.removeEventListener("resize", onResize)
        resizeObserver?.disconnect()
      }
    }, [moveToActive])

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      placeBar(e.currentTarget as HTMLElement)
    }

    return (
      <div
        ref={wrapRef}
        className={cn("relative w-full", !borderless && "p-4 pb-0")}
      >
        {!borderless && (
          <span className="pointer-events-none absolute inset-x-0 bottom-px h-[0.5px] bg-accent" />
        )}
        <TabsList
          ref={listRef}
          className={cn(
            "relative flex gap-4",
            "justify-start! p-0!",
            className,
          )}
          {...props}
        >
          <span
            ref={barRef}
            className="pointer-events-none absolute bottom-px left-0 h-px bg-primary transition-[left,width] duration-200"
          />

          {options.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              onClick={handleClick}
              className={cn(
                "p-0 hover:text-content-loud",
                !borderless && "pb-4",
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent",
                "[&_svg]:transition-colors [&[data-state=active]_svg]:text-brand-primary",
              )}
            >
              {Icon && <Icon className="h-3 w-3" />}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    )
  },
)

TabsSwitch.displayName = "TabsSwitch"
export default TabsSwitch
