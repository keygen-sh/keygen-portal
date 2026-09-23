import * as Sentry from "@sentry/react"

import config from "@/keygen/config"

import { addRecentAccount } from "@/lib/accounts"

import { handleMockRequest } from "./server/app"
import * as persistence from "./server/persistence"
import { mockStore } from "./server/store"
import { buildMockData, seedMockData, type SeedProfile } from "./seeds"
import { MOCK_ACCOUNT, MOCK_ADMIN, MOCK_PORTAL_TOKEN } from "./seeds/universe"
import { installMockUploadShim } from "./xhr"

import "./handlers"
import "./demo.css"

export const isDemo = config.isDemo
export const fetchMock = handleMockRequest
export { mockStore }
export type { SeedProfile } from "./seeds"

export const MOCK_CREDENTIALS = {
  account: MOCK_ACCOUNT.slug,
  email: MOCK_ADMIN.email,
  password: MOCK_ADMIN.password,
} as const

export const MOCK_ENTRY_PATH = `/${MOCK_ACCOUNT.slug}/app`

const PROFILES: readonly SeedProfile[] = ["established", "fresh"]

declare global {
  interface Window {
    demo?: {
      resetMock: (profile?: SeedProfile) => void
      resetMockData: () => void
      mockStore: typeof mockStore
      MOCK_CREDENTIALS: typeof MOCK_CREDENTIALS
    }
  }
}

let booted = false

export function boot(): void {
  if (booted) return
  booted = true

  installMockUploadShim()

  Sentry.setTag("demo", "true")

  const requested = requestedProfile()
  const snapshot = requested ? null : persistence.loadMockSnapshot()

  if (snapshot) {
    mockStore.load(snapshot)
  } else {
    persistence.clearMockStore()
    reseed(requested ?? "established")
    establishMockSession()
  }

  mockStore.subscribe(persistence.scheduleMockSave)

  window.demo = {
    resetMock,
    resetMockData,
    mockStore,
    MOCK_CREDENTIALS,
  }

  if (window.location.pathname === "/") {
    window.history.replaceState(null, "", MOCK_ENTRY_PATH)
  }
}

function requestedProfile(): SeedProfile | null {
  const params = new URLSearchParams(window.location.search)
  if (!params.has("reset")) return null

  const requested = params.get("reset")
  const profile = PROFILES.find((candidate) => candidate === requested)

  params.delete("reset")
  const query = params.toString()
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}`,
  )

  return profile ?? "established"
}

function reseed(profile: SeedProfile): void {
  persistence.markMockSeeded(profile)
  seedMockData(profile)
  persistence.saveMockSnapshot()
}

export function establishMockSession(): void {
  for (const key of ["token", "tokenId", "keygen.environment.active"]) {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  }

  localStorage.setItem("token", MOCK_PORTAL_TOKEN.secret)
  localStorage.setItem("tokenId", MOCK_PORTAL_TOKEN.id)

  addRecentAccount({
    id: MOCK_ACCOUNT.id,
    slug: MOCK_ACCOUNT.slug,
    name: MOCK_ACCOUNT.name,
  })
}

export function resetMockData(): void {
  const { profile, seededAt } = persistence.describeMockStore()
  const pristine = buildMockData(
    profile as SeedProfile,
    Date.parse(seededAt) || Date.now(),
  )

  mockStore.quietly(() => {
    mockStore.clear()

    for (const type of pristine.types()) {
      const table = mockStore.table(type)

      for (const row of pristine.table(type).all()) {
        table.insert(row)
      }
    }
  })

  persistence.saveMockSnapshot()
}

export function resetMock(profile: SeedProfile = "established"): void {
  persistence.clearMockStore()
  reseed(profile)
  establishMockSession()
  window.location.assign(MOCK_ENTRY_PATH)
}
