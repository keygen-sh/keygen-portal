import {
  Box,
  Cpu,
  Key,
  User,
  UserX,
  Clock,
  Scroll,
  Layers,
  Rocket,
  Archive,
  Package,
  UserCog,
  FileText,
  PowerOff,
  UserPlus,
  KeyRound,
  CalendarX,
  Hourglass,
  UserMinus,
  MonitorOff,
  TimerReset,
  CircleSlash,
  CalendarClock,
  CalendarRange,
  AlertTriangle,
  type LucideIcon,
  Users as UsersIcon,
} from "lucide-react"

import {
  DialogKey,
  type Keyword,
  type SearchChip,
  type RecentItem,
  type FilterPreset,
  type FieldKeyword,
  type CreateAction,
  type ParsedSearch,
  type AccountAction,
  type SearchInputState,
  type FilterableResource,
  type CommandSearchResource,
} from "@/types/palette"
import { UserStatus } from "@/types/users"
import { ReleaseStatus } from "@/types/releases"
import { LicenseStatus } from "@/types/licenses"
import { ArtifactStatus } from "@/types/artifacts"
import { HeartbeatStatus } from "@/types/machines"
import { type SearchOperator, type SearchQuery } from "@/types/search"

import { resourceConfigs } from "@/lib/search"

export const DOCS_URL = "https://keygen.sh/docs"
export const API_URL = "https://keygen.sh/docs/api"
export const SUPPORT_EMAIL = "support@keygen.sh"

export const RESOURCE_LABEL: Record<FilterableResource, string> = {
  licenses: "Licenses",
  groups: "Groups",
  users: "Users",
  machines: "Machines",
  entitlements: "Entitlements",
  products: "Products",
  policies: "Policies",
  releases: "Releases",
  artifacts: "Artifacts",
}

export const RESOURCE_LIST_PATH: Record<FilterableResource, string> = {
  licenses: "/$accountId/app/licenses",
  groups: "/$accountId/app/groups",
  users: "/$accountId/app/users",
  machines: "/$accountId/app/machines",
  entitlements: "/$accountId/app/entitlements",
  products: "/$accountId/app/products",
  policies: "/$accountId/app/policies",
  releases: "/$accountId/app/releases",
  artifacts: "/$accountId/app/artifacts",
}

export const RESOURCE_ICON: Record<FilterableResource, LucideIcon> = {
  licenses: KeyRound,
  users: UsersIcon,
  groups: UsersIcon,
  machines: Cpu,
  entitlements: Layers,
  products: Box,
  policies: Scroll,
  releases: Rocket,
  artifacts: Archive,
}

export const ACCOUNT_ACTIONS: ReadonlyArray<AccountAction> = [
  {
    id: "profile",
    label: "Update profile",
    icon: UserCog,
    to: "/$accountId/app/general",
  },
  {
    id: "password",
    label: "Change password",
    icon: KeyRound,
    to: "/$accountId/app/security",
  },
  {
    id: "invite",
    label: "Invite a teammate",
    icon: UserPlus,
    to: "/$accountId/app/team",
  },
]

export const CREATE_ACTIONS: ReadonlyArray<CreateAction> = [
  { key: DialogKey.License, label: "License", icon: Key },
  { key: DialogKey.User, label: "User", icon: User },
  { key: DialogKey.Group, label: "Group", icon: UsersIcon },
  { key: DialogKey.Policy, label: "Policy", icon: Scroll },
  { key: DialogKey.Product, label: "Product", icon: Box },
  { key: DialogKey.Package, label: "Package", icon: Package },
  { key: DialogKey.Release, label: "Release", icon: Rocket },
]

export const FILTER_PRESETS: ReadonlyArray<FilterPreset> = [
  {
    id: "licenses-expiring-week",
    label: "Licenses expiring this week",
    icon: CalendarClock,
    type: "licenses",
    search: { status: LicenseStatus.Expiring, expires: { within: "P7D" } },
  },
  {
    id: "licenses-expiring-month",
    label: "Licenses expiring this month",
    icon: CalendarRange,
    type: "licenses",
    search: { expires: { within: "P30D" } },
  },
  {
    id: "licenses-expiring-quarter",
    label: "Licenses expiring this quarter",
    icon: Clock,
    type: "licenses",
    search: { expires: { within: "P90D" } },
  },
  {
    id: "licenses-expired-recent",
    label: "Recently expired licenses",
    icon: CalendarX,
    type: "licenses",
    search: { status: LicenseStatus.Expired, expired: { within: "P30D" } },
  },
  {
    id: "licenses-never-activated",
    label: "Never-activated licenses",
    icon: PowerOff,
    type: "licenses",
    search: { activated: false },
  },
  {
    id: "licenses-dormant",
    label: "Dormant licenses",
    icon: Hourglass,
    type: "licenses",
    search: { activity: { outside: "P90D" } },
  },
  {
    id: "users-inactive",
    label: "Inactive users",
    icon: UserMinus,
    type: "users",
    search: { status: UserStatus.Inactive },
  },
  {
    id: "users-unlicensed",
    label: "Unlicensed users",
    icon: UserX,
    type: "users",
    search: { assigned: false },
  },
  {
    id: "machines-dead",
    label: "Dead machines",
    icon: MonitorOff,
    type: "machines",
    search: { status: HeartbeatStatus.Dead },
  },
  {
    id: "releases-draft",
    label: "Draft releases",
    icon: FileText,
    type: "releases",
    search: { status: ReleaseStatus.Draft },
  },
  {
    id: "releases-yanked",
    label: "Yanked releases",
    icon: CircleSlash,
    type: "releases",
    search: { status: ReleaseStatus.Yanked },
  },
  {
    id: "artifacts-failed",
    label: "Failed uploads",
    icon: AlertTriangle,
    type: "artifacts",
    search: { status: ArtifactStatus.Failed },
  },
  {
    id: "artifacts-waiting",
    label: "Pending uploads",
    icon: TimerReset,
    type: "artifacts",
    search: { status: ArtifactStatus.Waiting },
  },
]

export const RECENTS_LIMIT = 3
export const RECENTS_KEY = "keygen.command.recent.v1"

export function loadRecents(): RecentItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, RECENTS_LIMIT) as RecentItem[]
  } catch {
    return []
  }
}

export function saveRecents(items: RecentItem[]): void {
  window.localStorage.setItem(RECENTS_KEY, JSON.stringify(items))
}

export const KEYWORD = {
  Type: "type",
  Id: "id",
  Name: "name",
  Key: "key",
  Email: "email",
  FirstName: "firstName",
  LastName: "lastName",
  FullName: "fullName",
  Fingerprint: "fingerprint",
  Code: "code",
  Version: "version",
  Tag: "tag",
  Role: "role",
  Metadata: "metadata",
  Owner: "owner",
  User: "user",
} as const

export const COMMAND_SEARCH_RESOURCES: ReadonlyArray<CommandSearchResource> = [
  "licenses",
  "groups",
  "users",
  "machines",
  "entitlements",
  "products",
  "policies",
  "releases",
]

export const COMMAND_SEARCH_FIELDS: Record<
  CommandSearchResource,
  readonly FieldKeyword[]
> = {
  licenses: [
    KEYWORD.Id,
    KEYWORD.Name,
    KEYWORD.Key,
    KEYWORD.Metadata,
    KEYWORD.Owner,
    KEYWORD.User,
  ],
  groups: [KEYWORD.Name],
  users: [
    KEYWORD.Id,
    KEYWORD.Email,
    KEYWORD.FirstName,
    KEYWORD.LastName,
    KEYWORD.FullName,
    KEYWORD.Name,
    KEYWORD.Metadata,
    KEYWORD.Role,
  ],
  machines: [
    KEYWORD.Id,
    KEYWORD.Fingerprint,
    KEYWORD.Name,
    KEYWORD.Metadata,
    KEYWORD.Owner,
    KEYWORD.User,
  ],
  entitlements: [KEYWORD.Id, KEYWORD.Code, KEYWORD.Name],
  products: [KEYWORD.Id, KEYWORD.Name, KEYWORD.Metadata],
  policies: [KEYWORD.Id, KEYWORD.Name, KEYWORD.Metadata],
  releases: [KEYWORD.Id, KEYWORD.Version, KEYWORD.Tag, KEYWORD.Metadata],
}

const TYPE_ALIASES: Record<string, CommandSearchResource> = {
  license: "licenses",
  licenses: "licenses",
  group: "groups",
  groups: "groups",
  user: "users",
  users: "users",
  machine: "machines",
  machines: "machines",
  entitlement: "entitlements",
  entitlements: "entitlements",
  product: "products",
  products: "products",
  policy: "policies",
  policies: "policies",
  release: "releases",
  releases: "releases",
}

const FIELD_ALIASES: Record<string, FieldKeyword> = {
  firstname: KEYWORD.FirstName,
  lastname: KEYWORD.LastName,
  fullname: KEYWORD.FullName,
  meta: KEYWORD.Metadata,
}

const RECOGNIZED_FIELDS: ReadonlySet<FieldKeyword> = new Set(
  Object.values(COMMAND_SEARCH_FIELDS).flat(),
)

function isFieldKeyword(s: string): s is FieldKeyword {
  return RECOGNIZED_FIELDS.has(s as FieldKeyword)
}

export function resolveKeyword(raw: string): Keyword | null {
  const lower = raw.trim().toLowerCase()
  if (!lower) return null
  if (lower === KEYWORD.Type) return KEYWORD.Type
  const canonical = FIELD_ALIASES[lower] ?? lower
  if (isFieldKeyword(canonical)) return canonical
  return null
}

export function resolveType(value: string): CommandSearchResource | null {
  return TYPE_ALIASES[value.trim().toLowerCase()] ?? null
}

export function parseChips(
  chips: SearchChip[],
  freeText: string,
): ParsedSearch {
  let type: CommandSearchResource | null = null
  const fields: Partial<Record<FieldKeyword, string>> = {}

  for (const chip of chips) {
    const value = chip.value.trim()
    if (!value) continue
    if (chip.keyword === KEYWORD.Type) {
      type = resolveType(value) ?? type
      continue
    }
    fields[chip.keyword] = value
  }

  const free = freeText.trim()
  const freeTerm = free.length > 0 ? free : null

  return { type, fields, freeTerm }
}

export function buildResourceSearch(
  resource: CommandSearchResource,
  parsed: ParsedSearch,
): { query: SearchQuery; op?: SearchOperator } | null {
  if (parsed.type && parsed.type !== resource) return null

  const allowed = COMMAND_SEARCH_FIELDS[resource]
  const allowedSet = new Set<string>(allowed)

  const entries = Object.entries(parsed.fields).filter(
    ([k, v]) => allowedSet.has(k) && typeof v === "string",
  ) as [FieldKeyword, string][]

  if (entries.length > 0) {
    if (!entries.some(([, v]) => v.length >= 3)) return null

    if (resource === "users") {
      const idx = entries.findIndex(([k]) => k === KEYWORD.Name)
      if (idx >= 0) {
        const term = entries[idx][1]
        const others = entries.filter((_, i) => i !== idx)
        const { query, op } = resourceConfigs.users.searchQuery(term)
        const expanded = Object.fromEntries(
          Object.entries(query).filter(([k]) => allowedSet.has(k)),
        )

        if (others.length === 0) {
          return { query: expanded, op }
        }
        return {
          query: { ...Object.fromEntries(others), lastName: term },
        }
      }
    }

    const out: SearchQuery = {}
    for (const [k, v] of entries) {
      if (k === KEYWORD.Metadata) {
        const eq = v.indexOf("=")
        if (eq < 0) return null
        const mk = v.slice(0, eq).trim()
        const mv = v.slice(eq + 1).trim()
        if (!mk || mv.length < 3) return null
        out[k] = { [mk]: mv }
      } else {
        out[k] = v
      }
    }
    return { query: out }
  }

  if (parsed.freeTerm && parsed.freeTerm.length >= 3) {
    const { query, op } = resourceConfigs[resource].searchQuery(parsed.freeTerm)
    const safe = Object.fromEntries(
      Object.entries(query).filter(([k]) => allowedSet.has(k)),
    )
    if (Object.keys(safe).length === 0) return null
    return { query: safe, op }
  }

  return null
}

export function isTypeOnlyBrowse(parsed: ParsedSearch): boolean {
  return (
    parsed.type != null &&
    Object.keys(parsed.fields).length === 0 &&
    !parsed.freeTerm
  )
}

export const EMPTY_SEARCH_INPUT: SearchInputState = {
  chips: [],
  pending: null,
  text: "",
}

export function isInputEmpty(state: SearchInputState): boolean {
  return state.chips.length === 0 && !state.pending && state.text === ""
}

export function reduceInputText(
  state: SearchInputState,
  newText: string,
): SearchInputState {
  let next: SearchInputState = { ...state, text: newText }

  while (true) {
    if (next.pending && next.text.includes(" ")) {
      const idx = next.text.indexOf(" ")
      const value = next.text.slice(0, idx).trim()
      const rest = next.text.slice(idx + 1)
      next = {
        chips: value
          ? [...next.chips, { keyword: next.pending, value }]
          : next.chips,
        pending: null,
        text: rest,
      }
      continue
    }

    if (!next.pending) {
      const m = next.text.match(/^([A-Za-z]+):(.*)$/)
      if (m) {
        const kw = m[1]
        const rest = m[2]
        const resolved = resolveKeyword(kw)
        if (resolved) {
          next = { ...next, pending: resolved, text: rest }
          continue
        }
      }
    }

    break
  }

  return next
}

export function commitPendingInput(state: SearchInputState): SearchInputState {
  if (!state.pending) return state
  const value = state.text.trim()
  if (!value) return { ...state, pending: null }
  return {
    chips: [...state.chips, { keyword: state.pending, value }],
    pending: null,
    text: "",
  }
}

export function popLastInput(state: SearchInputState): SearchInputState {
  if (state.pending) return { ...state, pending: null }
  if (state.chips.length === 0) return state
  const last = state.chips[state.chips.length - 1]
  return {
    chips: state.chips.slice(0, -1),
    pending: last.keyword,
    text: last.value,
  }
}

export function removeChipAt(
  state: SearchInputState,
  idx: number,
): SearchInputState {
  return { ...state, chips: state.chips.filter((_, i) => i !== idx) }
}

export function parseInputState(state: SearchInputState): ParsedSearch {
  const effectiveChips = state.pending
    ? [...state.chips, { keyword: state.pending, value: state.text }]
    : state.chips
  const freeText = state.pending ? "" : state.text
  return parseChips(effectiveChips, freeText)
}
