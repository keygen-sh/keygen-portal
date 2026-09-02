import { useEffect, useSyncExternalStore } from "react"

import * as keygen from "@/keygen"

export interface FavoritePage {
  path: string
  label: string
  accountId: string
}

export type Favorite =
  | { kind: "route"; to: string }
  | ({ kind: "page" } & FavoritePage)

function createFavoritesStore<T>(
  storageKey: string,
  isValid: (value: unknown) => value is T,
  keyOf: (value: T) => string,
) {
  const load = (): ReadonlyArray<T> => {
    if (typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return []
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return []
      return parsed.filter(isValid)
    } catch {
      return []
    }
  }

  let favorites = load()
  const listeners = new Set<() => void>()

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const getSnapshot = (): ReadonlyArray<T> => favorites

  const commit = (next: ReadonlyArray<T>): void => {
    favorites = next
    window.localStorage.setItem(storageKey, JSON.stringify(favorites))
    listeners.forEach((listener) => listener())
  }

  const toggle = (item: T): void => {
    const key = keyOf(item)
    commit(
      favorites.some((f) => keyOf(f) === key)
        ? favorites.filter((f) => keyOf(f) !== key)
        : [...favorites, item],
    )
  }

  const update = (item: T): void => {
    const index = favorites.findIndex((f) => keyOf(f) === keyOf(item))
    if (index < 0) return
    if (JSON.stringify(favorites[index]) === JSON.stringify(item)) return
    const next = [...favorites]
    next[index] = item
    commit(next)
  }

  const reorder = (next: ReadonlyArray<T>): void => {
    commit(next)
  }

  const useFavorites = (): ReadonlyArray<T> =>
    useSyncExternalStore(subscribe, getSnapshot)

  return { useFavorites, toggle, update, reorder }
}

const isString = (value: unknown): value is string => typeof value === "string"

const isFavoritePage = (value: unknown): value is FavoritePage => {
  if (typeof value !== "object" || value === null) return false
  const page = value as Partial<FavoritePage>
  return (
    typeof page.path === "string" &&
    typeof page.label === "string" &&
    typeof page.accountId === "string"
  )
}

const isFavorite = (value: unknown): value is Favorite => {
  if (typeof value !== "object" || value === null) return false
  const favorite = value as Partial<Favorite>
  if (favorite.kind === "route") return typeof favorite.to === "string"
  if (favorite.kind === "page") return isFavoritePage(value)
  return false
}

export const favoriteKey = (favorite: Favorite): string =>
  favorite.kind === "route" ? `route:${favorite.to}` : `page:${favorite.path}`

const identity = (id: string): string => id

const commandFavorites = createFavoritesStore(
  "keygen.command.favorites.v1",
  isString,
  identity,
)
const favorites = createFavoritesStore(
  "keygen.favorites.v2",
  isFavorite,
  favoriteKey,
)

export const useFavoriteCommands = commandFavorites.useFavorites
export const toggleFavoriteCommand = commandFavorites.toggle
export const reorderFavoriteCommands = commandFavorites.reorder

export const useFavorites = favorites.useFavorites
export const reorderFavorites = favorites.reorder

export const toggleFavoriteRoute = (to: string): void =>
  favorites.toggle({ kind: "route", to })

export const toggleFavoritePage = (page: FavoritePage): void =>
  favorites.toggle({ kind: "page", ...page })

export function useSyncFavoritePageLabel(label?: string | null): void {
  useEffect(() => {
    if (!label) return
    favorites.update({
      kind: "page",
      path: window.location.pathname,
      label,
      accountId: keygen.config.id,
    })
  }, [label])
}
