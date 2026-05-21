import {
  Box,
  Cpu,
  Key,
  Code,
  User,
  UserX,
  Clock,
  Scroll,
  Layers,
  Rocket,
  Archive,
  Package,
  UserCog,
  BookOpen,
  LifeBuoy,
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
  KEYWORD,
  DialogKey,
  COMMAND_SEARCH_RESOURCES,
  type Command,
  type Keyword,
  type SearchChip,
  type RecentItem,
  type FilterPreset,
  type FieldKeyword,
  type ParsedSearch,
  type SearchSuggestion,
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

import { resourceConfigs, MIN_SEARCH_LENGTH } from "@/lib/search"

const DOCS_URL = "https://keygen.sh/docs"
const API_URL = "https://keygen.sh/docs/api"
const SUPPORT_EMAIL = "support@keygen.sh"

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

export const RESOURCE_SINGULAR: Record<CommandSearchResource, string> = {
  licenses: "license",
  groups: "group",
  users: "user",
  machines: "machine",
  entitlements: "entitlement",
  products: "product",
  policies: "policy",
  releases: "release",
}

interface CreateAction {
  key: DialogKey
  label: string
  icon: LucideIcon
}

const CREATE_ACTIONS: ReadonlyArray<CreateAction> = [
  { key: DialogKey.License, label: "License", icon: Key },
  { key: DialogKey.User, label: "User", icon: User },
  { key: DialogKey.Group, label: "Group", icon: UsersIcon },
  { key: DialogKey.Policy, label: "Policy", icon: Scroll },
  { key: DialogKey.Product, label: "Product", icon: Box },
  { key: DialogKey.Package, label: "Package", icon: Package },
  { key: DialogKey.Release, label: "Release", icon: Rocket },
]

const FILTER_PRESETS: ReadonlyArray<FilterPreset> = [
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

export function buildCommands(opts: { isCloud: boolean }): Command[] {
  const all: Command[] = []

  for (const resource of COMMAND_SEARCH_RESOURCES) {
    all.push({
      id: `find:${resource}`,
      label: `Find ${RESOURCE_SINGULAR[resource]}`,
      icon: RESOURCE_ICON[resource],
      group: "find",
      keywords: ["search", resource, RESOURCE_SINGULAR[resource]],
      kind: "find",
      resource,
    })
  }

  for (const preset of FILTER_PRESETS) {
    all.push({
      id: `preset:${preset.id}`,
      label: preset.label,
      icon: preset.icon,
      group: "filter",
      keywords: ["filter", preset.type],
      kind: "preset",
      preset,
    })
  }

  for (const action of CREATE_ACTIONS) {
    all.push({
      id: `new:${action.key}`,
      label: `New ${action.label.toLowerCase()}`,
      icon: action.icon,
      group: "new",
      keywords: ["create", action.label.toLowerCase()],
      kind: "create",
      dialog: action.key,
    })
  }

  all.push(
    {
      id: "account:profile",
      label: "Update profile",
      icon: UserCog,
      group: "account",
      keywords: ["settings", "general", "account"],
      kind: "navigate",
      to: "/$accountId/app/general",
    },
    {
      id: "account:password",
      label: "Change password",
      icon: KeyRound,
      group: "account",
      keywords: ["security", "credentials"],
      kind: "navigate",
      to: "/$accountId/app/security",
    },
    {
      id: "account:invite",
      label: "Invite a teammate",
      icon: UserPlus,
      group: "account",
      keywords: ["team", "invite"],
      cloudOnly: true,
      kind: "navigate",
      to: "/$accountId/app/team",
    },
    {
      id: "account:team",
      label: "Team",
      icon: UsersIcon,
      group: "account",
      keywords: ["team", "members"],
      kind: "navigate",
      to: "/$accountId/app/team",
    },
  )

  all.push(
    {
      id: "help:docs",
      label: "Documentation",
      icon: BookOpen,
      group: "help",
      keywords: ["docs", "documentation", "help"],
      kind: "external",
      url: DOCS_URL,
    },
    {
      id: "help:api",
      label: "API reference",
      icon: Code,
      group: "help",
      keywords: ["api", "reference", "developer"],
      kind: "external",
      url: API_URL,
    },
    {
      id: "help:support",
      label: "Get support",
      icon: LifeBuoy,
      group: "help",
      keywords: ["support", "help", "contact", "email"],
      kind: "mailto",
      email: SUPPORT_EMAIL,
    },
  )

  return all.filter((c) => opts.isCloud || !c.cloudOnly)
}

export const RECENTS_LIMIT = 3
export const RECENTS_KEY = "keygen.command.recent.v2"

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

export function recentKey(item: RecentItem): string {
  return item.kind === "command"
    ? `command:${item.commandId}`
    : `resource:${item.resource}:${item.id}`
}

export function saveRecents(items: RecentItem[]): void {
  window.localStorage.setItem(RECENTS_KEY, JSON.stringify(items))
}

export function commandFilter(
  value: string,
  search: string,
  keywords?: readonly string[],
): number {
  const query = normalizeCommandSearchText(search)
  if (!query) return 1

  const fields = [value, ...(keywords ?? [])]
    .map(normalizeCommandSearchText)
    .filter(Boolean)
  const terms = query.split(" ")

  if (!terms.every((term) => fields.some((field) => field.includes(term)))) {
    return 0
  }

  if (fields.some((field) => field === query)) return 3
  if (fields.some((field) => field.startsWith(query))) return 2
  return 1
}

function normalizeCommandSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

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
  groups: [KEYWORD.Id, KEYWORD.Name, KEYWORD.Metadata],
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
  entitlements: [KEYWORD.Id, KEYWORD.Code, KEYWORD.Name, KEYWORD.Metadata],
  products: [KEYWORD.Id, KEYWORD.Name, KEYWORD.Metadata],
  policies: [KEYWORD.Id, KEYWORD.Name, KEYWORD.Metadata],
  releases: [KEYWORD.Id, KEYWORD.Version, KEYWORD.Tag, KEYWORD.Metadata],
}

const IRREGULAR_TYPE_PLURALS: Record<string, CommandSearchResource> = {
  policy: "policies",
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

export function displayKeyword(keyword: Keyword): string {
  return keyword === KEYWORD.Metadata ? "metadata:k=v" : `${keyword}:`
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
  const lower = value.trim().toLowerCase()
  if (lower in IRREGULAR_TYPE_PLURALS) return IRREGULAR_TYPE_PLURALS[lower]
  const plural = lower.endsWith("s") ? lower : `${lower}s`
  return (COMMAND_SEARCH_RESOURCES as readonly string[]).includes(plural)
    ? (plural as CommandSearchResource)
    : null
}

function parseChips(chips: SearchChip[]): ParsedSearch {
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

  return { type, fields }
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
    if (!entries.some(([, v]) => v.length >= MIN_SEARCH_LENGTH)) return null

    if (entries.length === 1 && entries[0][0] === KEYWORD.Name) {
      const term = entries[0][1]
      const { query, op } = resourceConfigs[resource].searchQuery(term)
      const expanded = Object.fromEntries(
        Object.entries(query).filter(([k]) => allowedSet.has(k)),
      )
      if (Object.keys(expanded).length > 0) return { query: expanded, op }
    }

    const out: SearchQuery = {}
    for (const [k, v] of entries) {
      if (k === KEYWORD.Metadata) {
        const eq = v.indexOf("=")
        if (eq < 0) return null
        const mk = v.slice(0, eq).trim()
        const mv = v.slice(eq + 1).trim()
        if (!mk || mv.length < MIN_SEARCH_LENGTH) return null
        out[k] = { [mk]: mv }
      } else {
        out[k] = v
      }
    }
    return { query: out }
  }

  return null
}

export function validateSearchInput(
  resource: CommandSearchResource | null,
  state: SearchInputState,
): string | null {
  const typeChip = state.chips.find((chip) => chip.keyword === KEYWORD.Type)

  if (typeChip) {
    const value = typeChip.value.trim()
    if (value && !resolveType(value)) {
      return `type:${value} is not a searchable resource type.`
    }
  }

  if (!state.pending) {
    const invalidKeyword = state.text.trim().match(/^([A-Za-z]+):/)
    if (invalidKeyword && !resolveKeyword(invalidKeyword[1])) {
      return `${invalidKeyword[1]}: is not a searchable keyword.`
    }
  }

  if (!resource) return null

  const allowed = new Set<Keyword>(COMMAND_SEARCH_FIELDS[resource])

  for (const chip of state.chips) {
    if (chip.keyword === KEYWORD.Type) continue

    if (!allowed.has(chip.keyword)) {
      return `${displayKeyword(chip.keyword)} is not searchable for ${RESOURCE_SINGULAR[resource]}s.`
    }

    const value = chip.value.trim()

    if (chip.keyword === KEYWORD.Metadata) {
      const eq = value.indexOf("=")
      if (eq < 0) {
        return "metadata: must use key=value."
      }

      const key = value.slice(0, eq).trim()
      const metadataValue = value.slice(eq + 1).trim()
      if (!key) {
        return "metadata: must include a key."
      }
      if (metadataValue.length < MIN_SEARCH_LENGTH) {
        return `metadata: values must be at least ${MIN_SEARCH_LENGTH} characters.`
      }

      continue
    }

    if (value.length < MIN_SEARCH_LENGTH) {
      return `${displayKeyword(chip.keyword)} values must be at least ${MIN_SEARCH_LENGTH} characters.`
    }
  }

  return null
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
      next = commitPendingValue(next, value, rest)
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

export function getSearchSuggestions(
  resource: CommandSearchResource | null,
  state: SearchInputState,
): SearchSuggestion[] {
  const text = state.text.trim().toLowerCase()

  if (state.pending === KEYWORD.Type) {
    return COMMAND_SEARCH_RESOURCES.filter((candidate) => {
      const singular = RESOURCE_SINGULAR[candidate]
      return (
        text.length === 0 ||
        singular.startsWith(text) ||
        candidate.startsWith(text)
      )
    })
      .slice(0, 1)
      .map((candidate) => {
        const value = RESOURCE_SINGULAR[candidate]
        return {
          kind: "type",
          value,
          label: `type:${value}`,
        }
      })
  }

  if (state.pending || text.length === 0) return []

  const used = new Set(state.chips.map((chip) => chip.keyword))
  const keywords: readonly Keyword[] = resource
    ? COMMAND_SEARCH_FIELDS[resource].filter((field) => !used.has(field))
    : [KEYWORD.Type]

  return keywords
    .filter((keyword) => {
      const display = displayKeyword(keyword).toLowerCase()
      return keyword.toLowerCase().startsWith(text) || display.startsWith(text)
    })
    .slice(0, 1)
    .map((keyword) => ({
      kind: "keyword",
      keyword,
      label: keyword,
    }))
}

export function applySearchSuggestion(
  state: SearchInputState,
  suggestion: SearchSuggestion,
): SearchInputState {
  if (suggestion.kind === "type") {
    return {
      chips: [
        ...state.chips.filter((chip) => chip.keyword !== KEYWORD.Type),
        { keyword: KEYWORD.Type, value: suggestion.value },
      ],
      pending: null,
      text: "",
    }
  }

  return {
    ...state,
    pending: suggestion.keyword,
    text: "",
  }
}

export function commitPendingInput(state: SearchInputState): SearchInputState {
  if (!state.pending) return state
  return commitPendingValue(state, state.text, "")
}

function commitPendingValue(
  state: SearchInputState,
  rawValue: string,
  text: string,
): SearchInputState {
  if (!state.pending) return { ...state, text }

  const value = rawValue.trim()
  if (!value) return { ...state, pending: null, text }
  const chips =
    state.pending === KEYWORD.Type
      ? state.chips.filter((chip) => chip.keyword !== KEYWORD.Type)
      : state.chips

  return {
    chips: [...chips, { keyword: state.pending, value }],
    pending: null,
    text,
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

export function parseCommittedInputState(
  state: SearchInputState,
): ParsedSearch {
  return parseChips(state.chips)
}
