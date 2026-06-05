import { useState } from "react"

let lastSidebarTab = "overview"

// Persist the last selected sidebar tab, so e.g. when a user navs from events tab to view details,
// they return to the events tab instead of the overview tab when they nav back.
export function useSidebarTab() {
  const [tab, setTabState] = useState(lastSidebarTab)

  const setTab = (next: string) => {
    lastSidebarTab = next
    setTabState(next)
  }

  return [tab, setTab] as const
}
