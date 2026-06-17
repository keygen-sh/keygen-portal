const STORAGE_KEY = "recentAccounts"
const MAX_RECENT = 5

export interface RecentAccount {
  id: string
  name?: string
}

function isRecentAccount(value: unknown): value is RecentAccount {
  return (
    typeof value === "object" &&
    value != null &&
    typeof (value as RecentAccount).id === "string" &&
    (typeof (value as RecentAccount).name === "string" ||
      (value as RecentAccount).name === undefined)
  )
}

export function getRecentAccounts(): RecentAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter(isRecentAccount) : []
  } catch {
    return []
  }
}

export function addRecentAccount(account: RecentAccount): RecentAccount[] {
  const others = getRecentAccounts().filter((a) => a.id !== account.id)
  const next = [account, ...others].slice(0, MAX_RECENT)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))

  return next
}
