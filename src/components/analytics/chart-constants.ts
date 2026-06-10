export const PRICING_URL = "https://keygen.sh/pricing"

export const CHART_COLORS = [
  "var(--color-secondary)",
  "var(--color-primary)",
  "var(--color-warning)",
  "var(--color-destructive)",
] as const

export const [BLUE, GREEN, AMBER, RED] = CHART_COLORS
export const GRAY = "var(--color-content-normal)"

export function chartMix(
  color: string,
  mixColor: string,
  weight: 40 | 50 | 60,
) {
  return `color-mix(in oklch, ${color} ${weight}%, ${mixColor})`
}

export const REQUEST_METRICS = [
  "requests.2xx",
  "requests.3xx",
  "requests.4xx",
  "requests.5xx",
] as const

export const METRIC_COLORS: Record<string, string> = {
  "requests.2xx": GREEN,
  "requests.3xx": BLUE,
  "requests.4xx": AMBER,
  "requests.5xx": RED,
  "validations.valid": GREEN,
  "validations.banned": RED,
  "validations.expired": chartMix(RED, AMBER, 60),
  "validations.suspended": chartMix(RED, BLUE, 60),
  "validations.overdue": chartMix(AMBER, RED, 60),
  "validations.no-machine": chartMix(BLUE, GREEN, 60),
  "validations.no-machines": chartMix(BLUE, GREEN, 40),
  "validations.too-many-machines": chartMix(AMBER, RED, 60),
  "validations.too-many-users": AMBER,
  "validations.too-many-cores": chartMix(BLUE, AMBER, 60),
  "validations.too-many-processes": BLUE,
  "validations.too-much-memory": chartMix(RED, BLUE, 40),
  "validations.too-much-disk": chartMix(RED, AMBER, 60),
  "validations.entitlements-missing": chartMix(AMBER, BLUE, 60),
  "validations.fingerprint-scope-mismatch": chartMix(BLUE, RED, 60),
  "validations.machine-scope-mismatch": chartMix(BLUE, GREEN, 60),
  "validations.policy-scope-mismatch": chartMix(AMBER, BLUE, 60),
  "validations.product-scope-mismatch": chartMix(AMBER, GREEN, 60),
  "validations.heartbeat-not-started": chartMix(AMBER, RED, 50),
  "validations.heartbeat-dead": RED,
  "validations.not-found": GRAY,
  "release.downloaded": BLUE,
  "release.upgraded": GREEN,
  "user.created": GREEN,
  "user.deleted": RED,
  "license.created": GREEN,
  "license.expired": chartMix(RED, AMBER, 60),
  "license.checked-out": BLUE,
  "license.renewed": GREEN,
  "license.suspended": chartMix(RED, BLUE, 60),
  "license.revoked": RED,
  "license.deleted": RED,
  "license.validation.succeeded": GREEN,
  "license.validation.failed": RED,
  "machine.created": GREEN,
  "machine.deleted": RED,
  "machine.checked-out": BLUE,
  "machine.heartbeat.ping": chartMix(BLUE, GREEN, 60),
  "machine.heartbeat.pong": GREEN,
  "machine.heartbeat.dead": RED,
  "machine.heartbeat.reset": AMBER,
  "process.created": GREEN,
  "process.deleted": RED,
  "process.heartbeat.ping": chartMix(BLUE, GREEN, 60),
  "process.heartbeat.pong": GREEN,
  "process.heartbeat.dead": RED,
  "process.heartbeat.reset": AMBER,
}

export const VALIDATION_METRICS = [
  "validations.valid",
  "validations.expired",
  "validations.suspended",
  "validations.overdue",
  "validations.no-machine",
  "validations.no-machines",
  "validations.too-many-machines",
  "validations.too-many-users",
  "validations.too-many-cores",
  "validations.too-many-processes",
  "validations.too-much-memory",
  "validations.too-much-disk",
  "validations.entitlements-missing",
  "validations.fingerprint-scope-mismatch",
  "validations.machine-scope-mismatch",
  "validations.policy-scope-mismatch",
  "validations.product-scope-mismatch",
  "validations.heartbeat-not-started",
  "validations.heartbeat-dead",
  "validations.not-found",
] as const

export const EVENT_GROUPS = [
  {
    title: "Releases",
    events: ["release.downloaded", "release.upgraded"],
  },
  {
    title: "Users",
    events: ["user.created", "user.deleted"],
  },
  {
    title: "Licenses",
    events: [
      "license.created",
      "license.expired",
      "license.checked-out",
      "license.renewed",
      "license.suspended",
      "license.revoked",
      "license.deleted",
      "license.validation.*",
    ],
  },
  {
    title: "Machines",
    events: [
      "machine.created",
      "machine.deleted",
      "machine.checked-out",
      "machine.heartbeat.*",
    ],
  },
  {
    title: "Processes",
    events: ["process.created", "process.deleted", "process.heartbeat.*"],
  },
] as const

export const LEADERBOARDS = [
  { metric: "ips", title: "Top IPs" },
  { metric: "urls", title: "Top URLs" },
  { metric: "licenses", title: "Top licenses" },
  { metric: "user-agents", title: "Top user agents" },
] as const

export type AnalyticsRangeDays = 30 | 60 | 90
export type HeatmapRangeDays = AnalyticsRangeDays | 365
export type SectionRangeDays = AnalyticsRangeDays | HeatmapRangeDays

export const ANALYTICS_RANGE_OPTIONS = [
  { value: 30, label: "Last 30 days" },
  { value: 60, label: "Last 60 days" },
  { value: 90, label: "Last 90 days" },
] as const

export const HEATMAP_RANGE_OPTIONS = [
  { value: 30, label: "Next 30 days" },
  { value: 60, label: "Next 60 days" },
  { value: 90, label: "Next 90 days" },
  { value: 365, label: "Next 1 year" },
] as const
