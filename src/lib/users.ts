import { AttributeType } from "@/components/attribute/value"

import { User } from "@/types/users"

export function getUserLabel(user: User) {
  return user.attributes.fullName ?? user.attributes.email
}

const RECENT_STORAGE_KEY = "keygen.user.recent"

export interface RecentUser {
  firstName: string
}

export function getRecentUser(): RecentUser | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    return parsed as RecentUser
  } catch {
    return null
  }
}

export function setRecentUser(user: RecentUser): void {
  window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(user))
}

export const userAttributeTypeSchema: Record<
  keyof Omit<
    User["attributes"],
    "metadata" | "permissions" | "created" | "updated"
  >,
  AttributeType
> = {
  email: "raw",
  firstName: "string",
  lastName: "string",
  fullName: "string",
  status: "enum",
  role: "enum",
}
