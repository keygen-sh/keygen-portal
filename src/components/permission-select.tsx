import {
  type ComponentProps,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useCommandState } from "cmdk"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { ArrowDown, Info, SlidersHorizontal, TriangleAlert } from "lucide-react"

import {
  type Permission,
  WildcardPermission,
  PermissionGroupLabels,
  PermissionDescriptions,
} from "@/types/users"

import { cn } from "@/lib/utils"

import { useMobile } from "@/hooks/use-mobile"
import { useDeferredMount } from "@/hooks/use-deferred-mount"

import { Notice } from "@/components/notice"
import * as Skeletons from "@/components/skeletons"
import TooltipBadge from "@/components/tooltip-badge"

const MOUNT_DELAY = 250

interface Option {
  label: string
  value: string
}

interface RequiredOption extends Option {
  tooltip: string
}

interface PermissionSelectProps {
  value: string[] | null | undefined
  onChange: (value: string[] | null) => void
  options: Option[]
  defaults?: readonly string[]
  grantable?: ReadonlySet<string>
  includeNone?: boolean
  includeWildcard?: boolean
  requiredOptions?: RequiredOption[]
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  disabledTooltip?: string
  className?: string
}

interface PermissionGroup {
  key: string
  label: string
  options: Option[]
}

function KeyboardSelectionCommand(props: ComponentProps<typeof Command>) {
  const [keyboardNav, setKeyboardNav] = useState(false)

  return (
    <Command
      {...props}
      data-keyboard-nav={keyboardNav || undefined}
      onPointerDownCapture={() => setKeyboardNav(false)}
      onPointerMoveCapture={() => setKeyboardNav(false)}
      onKeyDownCapture={(event) => {
        if (event.key === "Tab") {
          setKeyboardNav(false)
          return
        }

        const target = event.target instanceof Element ? event.target : null

        if (target?.closest("[cmdk-input]") == null) {
          if (
            event.key === "ArrowDown" ||
            event.key === "ArrowUp" ||
            event.key === "Home" ||
            event.key === "End"
          ) {
            event.currentTarget
              .querySelector<HTMLElement>("[cmdk-input]")
              ?.focus()
            setKeyboardNav(true)
          }
          return
        }

        setKeyboardNav(true)
      }}
      disablePointerSelection
    />
  )
}

function permissionFilter(
  value: string,
  search: string,
  keywords?: string[],
): number {
  return `${value} ${(keywords ?? []).join(" ")}`
    .toLowerCase()
    .includes(search.toLowerCase())
    ? 1
    : 0
}

function groupOptions(options: Option[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>()

  for (const option of options) {
    const key = option.value.split(".")[0]

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: PermissionGroupLabels[key] ?? key,
        options: [],
      })
    }

    groups.get(key)!.options.push(option)
  }

  return Array.from(groups.values())
}

export default function PermissionSelect({
  value,
  onChange,
  options,
  defaults = [],
  grantable,
  includeNone,
  includeWildcard,
  requiredOptions = [],
  placeholder = "Leave blank to use defaults",
  disabled,
  autoFocus,
  disabledTooltip,
  className,
}: PermissionSelectProps) {
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const items = value ?? []
  const isNoneSelected = !!includeNone && value != null && value.length === 0
  const isWildcardSelected =
    !!includeWildcard && items.includes(WildcardPermission)

  const defaultSet = useMemo(() => new Set(defaults), [defaults])
  const requiredTooltipMap = useMemo(
    () => new Map(requiredOptions.map((o) => [o.value, o.tooltip])),
    [requiredOptions],
  )
  const groups = useMemo(
    () => groupOptions(options.filter((o) => o.value !== WildcardPermission)),
    [options],
  )
  const optionValues = useMemo(
    () => groups.flatMap((group) => group.options.map((o) => o.value)),
    [groups],
  )

  const isGrantable = (v: string) => grantable?.has(v) ?? true

  const toggle = (next: string) => {
    if (!isGrantable(next) && !items.includes(next) && !isWildcardSelected) {
      return
    }

    const selected = isWildcardSelected
      ? optionValues.filter((v) => isGrantable(v) && v !== next)
      : items.includes(next)
        ? items.filter((v) => v !== next)
        : [...items, next]

    onChange(selected.length === 0 ? null : selected)
  }

  const toggleRef = useRef(toggle)
  useEffect(() => {
    toggleRef.current = toggle
  })
  const onToggle = useCallback((next: string) => toggleRef.current(next), [])

  const toggleGroup = (values: string[]) => {
    const base = isWildcardSelected ? optionValues.filter(isGrantable) : items
    const checkable = values.filter((v) => isGrantable(v) || base.includes(v))
    if (checkable.length === 0) {
      return
    }

    const covered = checkable.every((v) => base.includes(v))
    const selected = covered
      ? base.filter((v) => !values.includes(v))
      : [...new Set([...base, ...checkable])]

    onChange(selected.length === 0 ? null : selected)
  }

  const summary = isNoneSelected ? (
    <Badge className="h-5 text-content-muted">None</Badge>
  ) : isWildcardSelected ? (
    <Badge className="h-5 text-content-muted">All permissions</Badge>
  ) : items.length > 0 ? (
    <span className="flex items-center gap-2 text-content-muted">
      <Badge className="h-5 text-content-muted">{items.length}</Badge>
      of {options.length} permissions
    </span>
  ) : (
    <span className="text-content-subdued">{placeholder}</span>
  )

  const trigger = (
    <DialogTrigger asChild>
      <button
        type="button"
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-accent p-2 text-left text-sm transition-colors duration-300",
          "focus-visible:border-content-subdued focus-visible:outline-none",
          "data-[state=open]:border-content-subdued",
          !disabled && "cursor-pointer hover:border-content-subdued",
          className,
        )}
      >
        {summary}
        <SlidersHorizontal className="size-3.5 shrink-0 text-content-subdued" />
      </button>
    </DialogTrigger>
  )

  const content = (
    <Dialog open={!disabled && open} onOpenChange={setOpen}>
      {trigger}

      <DialogContent className="flex h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden p-0 md:min-w-4xl">
        <DialogHeader className="flex items-start border-b border-accent p-4 pt-3">
          <DialogTitle className="text-base">Permissions</DialogTitle>
          <DialogDescription className="text-sm text-content-subdued">
            {isNoneSelected
              ? "No permissions"
              : isWildcardSelected
                ? "All permissions"
                : items.length > 0
                  ? `${items.length} of ${options.length} permissions`
                  : "Using defaults"}
          </DialogDescription>
        </DialogHeader>

        <KeyboardSelectionCommand
          className="flex min-h-0 flex-1 flex-col bg-transparent"
          filter={permissionFilter}
        >
          <CommandInput placeholder="Search permissions..." />

          <div ref={listRef} className="relative min-h-0 flex-1">
            <CommandList className="h-full max-h-none overflow-hidden [&_[cmdk-list-sizer]]:h-full">
              <ScrollArea className="h-full">
                <PermissionSelectList
                  groups={groups}
                  items={items}
                  isWildcardSelected={isWildcardSelected}
                  grantable={grantable}
                  defaultSet={defaultSet}
                  requiredTooltipMap={requiredTooltipMap}
                  onToggle={onToggle}
                  onToggleGroup={toggleGroup}
                />
              </ScrollArea>
            </CommandList>

            <RequiredScrollHint listRef={listRef} />
          </div>
        </KeyboardSelectionCommand>

        <div className="flex items-center gap-4 border-t border-accent p-3">
          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-auto max-w-48 flex-1 basis-1/3"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (disabled && disabledTooltip) {
    return (
      <DisabledTooltip tooltip={disabledTooltip}>{content}</DisabledTooltip>
    )
  }

  return content
}

interface PermissionSelectListProps {
  groups: PermissionGroup[]
  items: string[]
  isWildcardSelected: boolean
  grantable?: ReadonlySet<string>
  defaultSet: ReadonlySet<string>
  requiredTooltipMap: ReadonlyMap<string, string>
  onToggle: (value: string) => void
  onToggleGroup: (values: string[]) => void
}

function PermissionSelectList({
  groups,
  items,
  isWildcardSelected,
  grantable,
  defaultSet,
  requiredTooltipMap,
  onToggle,
  onToggleGroup,
}: PermissionSelectListProps) {
  const shouldMount = useDeferredMount({ delay: MOUNT_DELAY })
  const search = useCommandState((state) => state.search)
  const isGrantable = (v: string) => grantable?.has(v) ?? true

  if (!shouldMount) {
    return <Skeletons.PermissionSelect />
  }

  return (
    <>
      <CommandEmpty className="p-4 text-sm text-content-normal">
        No permissions found
      </CommandEmpty>

      {groups.map((group) => {
        const visibleOptions = search
          ? group.options.filter(({ value: permission }) => {
              const description =
                PermissionDescriptions[permission as Permission]

              return (
                permissionFilter(
                  permission,
                  search,
                  description ? [description] : undefined,
                ) > 0
              )
            })
          : group.options
        const groupValues = visibleOptions.map((o) => o.value)
        const checkable = groupValues.filter(
          (v) => isGrantable(v) || isWildcardSelected || items.includes(v),
        )
        const covered = isWildcardSelected
          ? checkable.length
          : checkable.filter((v) => items.includes(v)).length
        const groupLocked = checkable.length === 0

        return (
          <CommandGroup key={group.key}>
            <div
              onClick={
                groupLocked ? undefined : () => onToggleGroup(groupValues)
              }
              className={cn(
                "flex min-h-9 items-center gap-3 rounded-sm py-2 pr-2 pl-3 text-xs font-medium text-muted-foreground select-none has-[:focus-visible]:bg-accent has-[:focus-visible]:text-accent-foreground",
                !groupLocked &&
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Checkbox
                disabled={groupLocked}
                checked={
                  covered > 0 && covered === checkable.length
                    ? true
                    : covered > 0
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={() => onToggleGroup(groupValues)}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    event.stopPropagation()
                    onToggleGroup(groupValues)
                  }
                }}
                className="pointer-events-none focus-visible:border-input focus-visible:ring-0"
              />
              {group.label}
            </div>
            {group.options.map(({ label, value: permission }) => {
              const tooltip = requiredTooltipMap.get(permission)
              const isCovered = items.includes(permission) || isWildcardSelected
              const showWarning = tooltip != null && !isCovered

              return (
                <PermissionRow
                  key={permission}
                  label={label}
                  value={permission}
                  description={PermissionDescriptions[permission as Permission]}
                  checked={isCovered}
                  locked={!isGrantable(permission) && !isCovered}
                  isDefault={defaultSet.has(permission)}
                  requiredTooltip={tooltip}
                  showWarning={showWarning}
                  onToggle={onToggle}
                />
              )
            })}
          </CommandGroup>
        )
      })}
    </>
  )
}

interface PermissionRowProps {
  label: string
  value: string
  description?: string
  checked: boolean
  locked?: boolean
  isDefault?: boolean
  requiredTooltip?: string
  showWarning?: boolean
  onToggle: (value: string) => void
}

const PermissionRow = memo(function PermissionRow({
  label,
  value,
  description,
  checked,
  locked = false,
  isDefault = false,
  requiredTooltip,
  showWarning = false,
  onToggle,
}: PermissionRowProps) {
  return (
    <CommandItem
      value={value}
      keywords={description ? [description] : undefined}
      onSelect={() => onToggle(value)}
      disabled={locked}
      data-missing-required={showWarning || undefined}
      className={cn(
        "items-start gap-3 py-2 pr-3 pl-10 md:items-center",
        "data-[selected=true]:bg-transparent data-[selected=true]:text-current",
        "[[data-keyboard-nav]_&]:data-[selected=true]:bg-accent [[data-keyboard-nav]_&]:data-[selected=true]:text-accent-foreground",
        "has-[:focus-visible]:bg-accent has-[:focus-visible]:text-accent-foreground",
        locked
          ? "data-[disabled=true]:pointer-events-auto"
          : "cursor-pointer hover:bg-accent hover:text-accent-foreground hover:data-[selected=true]:bg-accent hover:data-[selected=true]:text-accent-foreground",
      )}
    >
      <Checkbox
        checked={checked}
        disabled={locked}
        onCheckedChange={() => onToggle(value)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            event.stopPropagation()
            onToggle(value)
          }
        }}
        className="pointer-events-none mt-0.5 focus-visible:border-input focus-visible:ring-0 md:mt-0"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:flex-row md:items-center md:gap-3">
        <div className="flex items-center gap-2 md:w-72 md:shrink-0">
          <span className="font-mono text-sm text-content-loud">{label}</span>

          {locked ? (
            <TooltipBadge
              value="Locked"
              tooltip="You cannot grant this permission."
              className="px-1 pr-0.5 text-xs text-content-subdued"
              contentClassName="text-nowrap bg-background-4"
            />
          ) : (
            isDefault && (
              <TooltipBadge
                value="Default"
                tooltip="This permission is included by default for this role."
                className="px-1 pr-0.5 text-xs text-content-subdued"
                contentClassName="text-nowrap bg-background-4"
              />
            )
          )}
        </div>

        {description && (
          <span className="min-w-0 text-xs text-pretty text-content-subdued md:flex-1">
            {description}
          </span>
        )}
      </div>

      {requiredTooltip != null && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="mt-0.5 ml-auto flex items-center md:mt-0"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {showWarning ? (
                <TriangleAlert className="size-3.5 text-warning" />
              ) : (
                <Info className="size-3.5 text-muted-foreground" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            sideOffset={8}
            className="pointer-events-none max-w-56 bg-background-4 text-pretty text-content-muted"
          >
            {requiredTooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </CommandItem>
  )
})

function RequiredScrollHint({
  listRef,
}: {
  listRef: React.RefObject<HTMLDivElement | null>
}) {
  const [hasMoreBelow, setHasMoreBelow] = useState(false)

  useEffect(() => {
    const viewport = listRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    if (!viewport) {
      return
    }

    const measure = () => {
      const bottom = viewport.getBoundingClientRect().bottom

      setHasMoreBelow(
        Array.from(
          viewport.querySelectorAll<HTMLElement>("[data-missing-required]"),
        ).some((row) => row.getBoundingClientRect().top >= bottom),
      )
    }

    measure()
    viewport.addEventListener("scroll", measure, { passive: true })

    const observer = new MutationObserver(measure)
    observer.observe(viewport, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-missing-required"],
    })

    return () => {
      viewport.removeEventListener("scroll", measure)
      observer.disconnect()
    }
  }, [listRef])

  const scrollToNext = () => {
    const viewport = listRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    if (!viewport) {
      return
    }

    const bottom = viewport.getBoundingClientRect().bottom
    const next = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-missing-required]"),
    ).find((row) => row.getBoundingClientRect().top >= bottom)

    next?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  if (!hasMoreBelow) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-black to-transparent pt-6 pb-3">
      <Button
        size="sm"
        type="button"
        variant="ghost"
        onClick={scrollToNext}
        className="pointer-events-auto h-fit w-fit px-0"
      >
        <Notice variant="warning">
          <Notice.Description className="flex items-center gap-2 text-nowrap">
            Missing required permissions for Portal access
            <ArrowDown className="size-4" />
          </Notice.Description>
        </Notice>
      </Button>
    </div>
  )
}

function DisabledTooltip({
  tooltip,
  children,
}: {
  tooltip: string
  children: React.ReactNode
}) {
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)

  const trigger = (
    <span
      tabIndex={0}
      className={cn(
        "block rounded-md transition-colors",
        open ? "bg-background-1" : "hover:bg-background-1",
      )}
    >
      {children}
    </span>
  )

  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
          {tooltip}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
