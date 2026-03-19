import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Scroll, Settings } from "lucide-react"

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandEmpty,
} from "@/components/ui/command"

enum Mode {
  Action = "action",
  Search = "search",
}

interface Route {
  to: string
  label: string
  params?: Record<string, unknown>
}

interface CommandMenuProps {
  routes: ReadonlyArray<Route>
}

/**
 * Renders a command menu that allows users to search for pages or perform quick actions.
 */
export default function SidebarCommand({
  routes,
}: CommandMenuProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>(Mode.Action)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setMode(Mode.Action)
        setOpen((prev) => !prev)
      }

      if (
        e.key === "/" &&
        !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault()
        setMode(Mode.Search)
        setOpen(true)
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        autoFocus
        placeholder={
          mode === Mode.Action ? "Type a command..." : "Search application..."
        }
      />

      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        {mode === Mode.Action && (
          <>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Scroll />
                <span>Manage Policies</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Settings">
              <CommandItem>
                <Settings />
                <span>Account settings</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {mode === Mode.Search && (
          <CommandGroup heading="Pages">
            {routes.map((r) => (
              <CommandItem
                key={r.to}
                onSelect={() => {
                  void navigate({ to: r.to, params: r.params })
                  setOpen(false)
                }}
              >
                <span>{r.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
