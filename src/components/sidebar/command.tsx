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

enum MODES {
  ACTION = "action",
  SEARCH = "search",
}

interface Route {
  label: string
  to: string
  params?: { id: string }
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
  const [mode, setMode] = useState<MODES>(MODES.ACTION)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setMode(MODES.ACTION)
        setOpen((prev) => !prev)
      }

      if (
        e.key === "/" &&
        !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault()
        setMode(MODES.SEARCH)
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
          mode === MODES.ACTION ? "Type a command..." : "Search application..."
        }
      />

      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        {mode === MODES.ACTION && (
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

        {mode === MODES.SEARCH && (
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
