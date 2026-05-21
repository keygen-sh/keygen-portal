import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CommandValueContextValue = (value: string) => void

const CommandValueContext =
  React.createContext<CommandValueContextValue | null>(null)

function Command({
  className,
  onValueChange,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  const selectValue = React.useCallback<CommandValueContextValue>(
    (value) => onValueChange?.(value),
    [onValueChange],
  )

  return (
    <CommandValueContext.Provider value={selectValue}>
      <CommandPrimitive
        data-slot="command"
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          className,
        )}
        onValueChange={onValueChange}
        {...props}
      />
    </CommandValueContext.Provider>
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  shouldFilter,
  filter,
  value,
  onValueChange,
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  shouldFilter?: boolean
  filter?: React.ComponentProps<typeof CommandPrimitive>["filter"]
  value?: React.ComponentProps<typeof CommandPrimitive>["value"]
  onValueChange?: React.ComponentProps<typeof CommandPrimitive>["onValueChange"]
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command
          shouldFilter={shouldFilter}
          filter={filter}
          value={value}
          onValueChange={onValueChange}
          className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  tabbable = false,
  value,
  onFocus,
  onKeyDown,
  onSelect,
  disabled,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> & {
  tabbable?: boolean
}) {
  const selectValue = React.useContext(CommandValueContext)

  function itemValue(element: HTMLElement) {
    return value ?? element.getAttribute("data-value") ?? ""
  }

  function paletteTabbableItems(element: HTMLElement) {
    const root = element.closest("[cmdk-root]") ?? element.ownerDocument
    return Array.from(
      root.querySelectorAll<HTMLElement>(
        '[data-palette-tabbable="true"]:not([aria-disabled="true"])',
      ),
    ).filter((item) => !item.closest("[hidden]"))
  }

  function focusRelativeItem(element: HTMLElement, offset: 1 | -1) {
    const items = paletteTabbableItems(element)
    const current = items.indexOf(element)
    const next = items[current + offset]

    next?.focus()
  }

  function focusEdgeItem(element: HTMLElement, edge: "first" | "last") {
    const items = paletteTabbableItems(element)
    const next = edge === "first" ? items[0] : items.at(-1)

    next?.focus()
  }

  function handleFocus(event: React.FocusEvent<HTMLDivElement>) {
    onFocus?.(event)

    if (!tabbable || disabled || event.defaultPrevented) return

    const nextValue = itemValue(event.currentTarget)
    if (nextValue) selectValue?.(nextValue)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (!tabbable || disabled || event.defaultPrevented) return

    switch (event.key) {
      case "Enter":
      case " ": {
        const nextValue = itemValue(event.currentTarget)

        event.preventDefault()
        event.stopPropagation()
        if (nextValue) selectValue?.(nextValue)
        onSelect?.(nextValue)
        return
      }
      case "ArrowDown": {
        event.preventDefault()
        event.stopPropagation()
        focusRelativeItem(event.currentTarget, 1)
        return
      }
      case "ArrowUp": {
        event.preventDefault()
        event.stopPropagation()
        focusRelativeItem(event.currentTarget, -1)
        return
      }
      case "Home": {
        event.preventDefault()
        event.stopPropagation()
        focusEdgeItem(event.currentTarget, "first")
        return
      }
      case "End": {
        event.preventDefault()
        event.stopPropagation()
        focusEdgeItem(event.currentTarget, "last")
        return
      }
    }
  }

  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      data-palette-tabbable={tabbable ? "true" : undefined}
      tabIndex={tabbable && !disabled ? 0 : undefined}
      value={value}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus-visible:bg-accent focus-visible:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
