const STORAGE_KEY = "keygen.account.recent"
const MAX_RECENT = 5

export interface RecentAccount {
  id: string
  slug: string
  name: string
}

export function getRecentAccounts(): RecentAccount[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? (parsed as RecentAccount[]).slice(0, MAX_RECENT)
      : []
  } catch {
    return []
  }
}

export function addRecentAccount(account: RecentAccount): void {
  const others = getRecentAccounts().filter((a) => a.id !== account.id)
  const next = [account, ...others].slice(0, MAX_RECENT)

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
