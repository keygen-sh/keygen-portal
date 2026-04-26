import { useEffect, useState } from "react"

const CURRENT_VERSION = __APP_VERSION__
const POLL_INTERVAL_MS = 60 * 60 * 1000

export function useAppVersion(): {
  hasUpdate: boolean
  reload: () => void
} {
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    if (!import.meta.env.PROD || hasUpdate) return

    let cancelled = false

    async function check() {
      try {
        const response = await fetch("/version.json", { cache: "no-store" })
        if (!response.ok) return
        const { version } = (await response.json()) as { version?: string }
        if (!cancelled && version && version !== CURRENT_VERSION) {
          setHasUpdate(true)
        }
      } catch (error) {
        console.warn("Version check failed:", error)
      }
    }

    const onVisibility = async () => {
      if (document.visibilityState === "visible") await check()
    }

    ;(async () => await check())()
    const id = setInterval(check, POLL_INTERVAL_MS)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [hasUpdate])

  return { hasUpdate, reload: () => window.location.reload() }
}
