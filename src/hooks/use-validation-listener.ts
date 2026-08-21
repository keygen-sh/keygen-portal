import { useEffect, useRef, useState } from "react"

import { useQueryClient } from "@tanstack/react-query"

import { useEdition } from "@/hooks/use-edition"
import { usePermissions } from "@/hooks/use-permissions"

import { useListEventLogs } from "@/queries/event-logs"

const VALIDATION_EVENTS = [
  "license.validation.succeeded",
  "license.validation.failed",
]
const LISTEN_WINDOW_MS = 1000 * 60 * 5
const POLL_INTERVAL_MS = 1000 * 10

export function useValidationListener({
  enabled,
  licenseId,
}: {
  enabled: boolean
  licenseId?: string
}) {
  const queryClient = useQueryClient()
  const { isEE } = useEdition()
  const { can } = usePermissions()

  const [armedAt, setArmedAt] = useState<number | null>(null)
  const [expired, setExpired] = useState(false)
  const [detected, setDetected] = useState<"succeeded" | "failed" | null>(null)

  const baselineRef = useRef<string | null | undefined>(undefined)

  const canDetect = isEE && can("event-log.read")
  const listening =
    enabled && canDetect && licenseId != null && armedAt != null && !expired

  useEffect(() => {
    if (armedAt == null) {
      return
    }

    const timeout = setTimeout(() => setExpired(true), LISTEN_WINDOW_MS)

    return () => clearTimeout(timeout)
  }, [armedAt])

  useEffect(() => {
    baselineRef.current = undefined
  }, [licenseId])

  const events = useListEventLogs(
    {
      pageSize: 1,
      filters: {
        events: VALIDATION_EVENTS,
        resource: { type: "license", id: licenseId ?? "" },
      },
    },
    {
      enabled: listening,
      staleTime: 0,
      refetchInterval: POLL_INTERVAL_MS,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
    },
  )

  const latest = events.data[0]
  const { isSuccess, dataUpdatedAt } = events

  useEffect(() => {
    if (!listening || !isSuccess) {
      return
    }

    if (baselineRef.current === undefined) {
      baselineRef.current = latest?.id ?? null
      return
    }

    if (latest == null || latest.id === baselineRef.current) {
      return
    }

    setDetected(
      latest.attributes.event === "license.validation.succeeded"
        ? "succeeded"
        : "failed",
    )

    void queryClient.invalidateQueries({ queryKey: ["licenses"] })
  }, [listening, isSuccess, dataUpdatedAt, latest, queryClient])

  const arm = () => {
    setArmedAt(Date.now())
    setExpired(false)
    setDetected(null)
    baselineRef.current = undefined
  }

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["licenses"] })
  }

  const refreshable = enabled && armedAt != null && (expired || !canDetect)

  return { listening, refreshable, detected, arm, refresh }
}
