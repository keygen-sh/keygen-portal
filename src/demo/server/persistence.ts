import type { MockSnapshot } from "./store"
import { mockStore } from "./store"

const STORAGE_KEY = "keygen.demo.store"
const SAVE_DELAY = 250

const persists = !import.meta.env.DEV

let profile = "established"
let seededAt = new Date().toISOString()
let timer: number | null = null

export function describeMockStore(): {
  profile: string
  seededAt: string
  persists: boolean
} {
  return { profile, seededAt, persists }
}

export function markMockSeeded(nextProfile: string): void {
  profile = nextProfile
  seededAt = new Date().toISOString()
}

export function loadMockSnapshot(): MockSnapshot | null {
  if (!persists) return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const snapshot = JSON.parse(raw) as MockSnapshot
    if (snapshot.version !== __APP_VERSION__) return null

    profile = snapshot.profile
    seededAt = snapshot.seededAt
    return snapshot
  } catch {
    return null
  }
}

export function saveMockSnapshot(): void {
  if (!persists) return

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(mockStore.snapshot(profile, seededAt, __APP_VERSION__)),
    )
  } catch (error) {
    console.warn("Demo store could not be persisted", error)
  }
}

export function scheduleMockSave(): void {
  if (!persists) return

  if (timer != null) window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    timer = null
    saveMockSnapshot()
  }, SAVE_DELAY)
}

export function clearMockStore(): void {
  if (timer != null) {
    window.clearTimeout(timer)
    timer = null
  }
  localStorage.removeItem(STORAGE_KEY)
}
