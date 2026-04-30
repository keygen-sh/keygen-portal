import { useSyncExternalStore } from "react"

let url: string | null = null
const listeners = new Set<() => void>()

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function getSsoRedirect(): string | null {
  return url
}

export function setSsoRedirect(next: string | null): void {
  if (next === url) return
  url = next
  listeners.forEach((fn) => fn())
}

export function useSsoRedirect(): string | null {
  return useSyncExternalStore(subscribe, getSsoRedirect)
}
