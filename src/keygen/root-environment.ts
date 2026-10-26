import client from "@/keygen/client"
import * as environments from "@/keygen/environments"

const STORAGE_KEY = "keygen.environment.root"

export interface RootEnvironment {
  id: string | null
  code: string | null
  name: string | null
}

export interface StoredRootEnvironment extends RootEnvironment {
  tokenId: string | null
}

let current: RootEnvironment | null = null
let pending: string | null = null

function credentialStorage(): Storage {
  return sessionStorage.getItem("tokenId") != null
    ? sessionStorage
    : localStorage
}

function read(): StoredRootEnvironment | null {
  const raw =
    localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const stored = JSON.parse(raw) as StoredRootEnvironment
    if (!stored?.id && !stored?.code) return null

    return stored
  } catch {
    return null
  }
}

function apply(environment: RootEnvironment | null): void {
  current = environment
  client.setRootEnvironment(
    environment ? (environment.id ?? environment.code) : null,
  )
}

export function get(): RootEnvironment | null {
  return current
}

export function restore(tokenId: string | null): void {
  if (pending != null) return

  const stored = read()
  if (stored == null) {
    apply(null)
    return
  }

  if (stored.tokenId != null && stored.tokenId !== tokenId) {
    clear()
    return
  }

  apply({ id: stored.id, code: stored.code, name: stored.name })
}

export function prime(alias: string): void {
  if (client.currentUser != null) return

  pending = alias
  client.setRootEnvironment(alias)
}

export function set(record: StoredRootEnvironment): void {
  const storage = credentialStorage()
  const other = storage === localStorage ? sessionStorage : localStorage
  other.removeItem(STORAGE_KEY)
  storage.setItem(STORAGE_KEY, JSON.stringify(record))

  pending = null
  apply({ id: record.id, code: record.code, name: record.name })
}

export function reconcile(truth: {
  tokenId: string | null
  environmentId: string | null | undefined
}): void {
  if (pending != null) {
    set({
      tokenId: truth.tokenId,
      id: truth.environmentId ?? null,
      code: pending,
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
  if (current == null || current.name != null || stored == null) return

  const response = await environments.get({ id: (current.id ?? current.code)! })
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
