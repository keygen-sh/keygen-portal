import client from "@/keygen/client"
import config from "@/keygen/config"
import * as environments from "@/keygen/environments"

const STORAGE_KEY = "keygen.environment.session"
const ENVIRONMENT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface SessionEnvironment {
  id: string | null
  code: string | null
  name: string | null
}

export interface StoredSessionEnvironment extends SessionEnvironment {
  accountId: string
  tokenId: string | null
}

let current: SessionEnvironment | null = null
let pending: string | null = null

export function isEnvironmentId(value: string): boolean {
  return ENVIRONMENT_ID_RE.test(value)
}

function credentialStorage(): Storage {
  return sessionStorage.getItem("tokenId") != null
    ? sessionStorage
    : localStorage
}

function read(): StoredSessionEnvironment | null {
  const raw =
    localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const stored = JSON.parse(raw) as StoredSessionEnvironment
    if (!stored?.accountId || (!stored.id && !stored.code)) return null

    return stored
  } catch {
    return null
  }
}

function apply(environment: SessionEnvironment | null): void {
  current = environment
  client.setSessionEnvironment(
    environment ? (environment.id ?? environment.code) : null,
  )
}

export function get(): SessionEnvironment | null {
  return current
}

export function restore(tokenId: string | null): void {
  if (pending != null) return

  const stored = read()
  if (stored == null) {
    apply(null)
    return
  }

  const otherToken = stored.tokenId != null && stored.tokenId !== tokenId
  const otherAccount =
    isEnvironmentId(config.id) && config.id !== stored.accountId

  if (otherToken || otherAccount) {
    clear()
    return
  }

  apply({ id: stored.id, code: stored.code, name: stored.name })
}

export function prime(alias: string): void {
  if (client.currentUser != null) return

  pending = alias
  client.setSessionEnvironment(alias)
}

export function set(record: StoredSessionEnvironment): void {
  const storage = credentialStorage()
  const other = storage === localStorage ? sessionStorage : localStorage
  other.removeItem(STORAGE_KEY)
  storage.setItem(STORAGE_KEY, JSON.stringify(record))

  pending = null
  apply({ id: record.id, code: record.code, name: record.name })
}

export function reconcile(truth: {
  accountId: string | null
  tokenId: string | null
  environmentId: string | null | undefined
}): void {
  if (pending != null) {
    const alias = pending
    const byId = isEnvironmentId(alias)

    set({
      accountId: truth.accountId ?? "",
      tokenId: truth.tokenId,
      id: truth.environmentId ?? (byId ? alias : null),
      code: byId ? null : alias,
      name: null,
    })

    return
  }

  if (current != null && truth.environmentId === null) {
    clear()
  }
}

export async function resolve(): Promise<void> {
  const stored = read()
  if (current == null || current.id != null || stored == null) return

  const response = await environments.get({ id: current.code! })
  if (response.data == null) return

  const { code, name } = response.data.attributes

  set({ ...stored, id: response.data.id, code, name })
}

export function release(): void {
  pending = null
  apply(null)
}

export function clear(): void {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)

  release()
}

export function recall(): string | undefined {
  const environment = current ?? read()

  return pending ?? environment?.code ?? environment?.id ?? undefined
}
