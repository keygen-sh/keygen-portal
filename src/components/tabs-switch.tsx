import React, {
  useRef,
  useEffect,
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
}

const TabsSwitch = React.forwardRef<HTMLDivElement, TabsSwitchProps>(
  ({ options, className, ...props }, ref) => {
    const listRef = useRef<HTMLDivElement>(null)
    const barRef = useRef<HTMLSpanElement>(null)

    useImperativeHandle(ref, () => listRef.current as HTMLDivElement, [])

    const placeBar = (el: HTMLElement | null) => {
      if (!el || !barRef.current) return
      barRef.current.style.left = `${el.offsetLeft}px`
      barRef.current.style.width = `${el.offsetWidth}px`
    }

    useLayoutEffect(() => {
      if (listRef.current) {
        const firstTrigger =
          listRef.current.querySelector<HTMLElement>('[role="tab"]')
        placeBar(firstTrigger)
      }
    }, [])

    useEffect(() => {
      const handleResize = () => {
        if (!listRef.current) return
        const active = listRef.current.querySelector<HTMLElement>(
          '[data-state="active"]',
        )
        placeBar(active)
      }
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }, [])

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      placeBar(e.currentTarget as HTMLElement)
    }

    return (
      <TabsList
        ref={listRef}
        className={cn("relative flex gap-4", className)}
        {...props}
      >
        <span
          ref={barRef}
          className="pointer-events-none absolute bottom-0 left-0 h-px bg-primary transition-[left,width] duration-200"
        />

        {options.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            onClick={handleClick}
            className="flex items-center gap-1.5 p-0 pb-8"
          >
            {Icon && <Icon className="h-3 w-3" />}
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    )
  },
)

TabsSwitch.displayName = "TabsSwitch"
export default TabsSwitch
