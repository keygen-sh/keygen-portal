import client from "@/keygen/client"
import config from "@/keygen/config"

const STORAGE_KEY = "environment"

interface StoredEnvironment {
  accountId: string
  id: string
  code: string
  token?: string
}

export interface ActiveEnvironment {
  id: string
  code: string
  token: string | null
}

function sessionStorageArea(): Storage {
  return sessionStorage.getItem("tokenId") != null
    ? sessionStorage
    : localStorage
}

function readEnvironment(): StoredEnvironment | null {
  const raw =
    localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const stored = JSON.parse(raw) as StoredEnvironment

    // don't carry an environment over to another account
    if (!stored?.id || !stored?.code || stored.accountId !== config.id) {
      return null
    }

    return stored
  } catch {
    return null
  }
}

export function storeEnvironment({ id, code, token }: ActiveEnvironment): void {
  const storage = sessionStorageArea()
  const other = storage === localStorage ? sessionStorage : localStorage
  other.removeItem(STORAGE_KEY)

  const stored: StoredEnvironment = {
    accountId: config.id,
    id,
    code,
    ...(config.isTokenAuthenticated && token != null ? { token } : {}),
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(stored))

  client.setEnvironment(code)
  client.setEnvironmentToken(token)
}

export function clearEnvironment(): void {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)

  client.setEnvironment(null)
  client.setEnvironmentToken(null)
}

export function restoreEnvironment(): ActiveEnvironment | null {
  const stored = readEnvironment()
  if (stored == null) return null

  const environment = {
    id: stored.id,
    code: stored.code,
    token: stored.token ?? null,
  }

  client.setEnvironment(environment.code)
  client.setEnvironmentToken(environment.token)

  return environment
}
