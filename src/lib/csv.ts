import { License } from "@/types/licenses"

const QUOTED_CHARS = /[",\n\r]/
const FORMULA_PREFIX = /^[=+\-@\t\r]/

function toCsvCell(value: string | null | undefined): string {
  if (value == null || value === "") {
    return ""
  }

  const guarded = FORMULA_PREFIX.test(value) ? `'${value}` : value
  if (QUOTED_CHARS.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`
  }

  return guarded
}

export function toCsv(
  headers: readonly string[],
  rows: readonly (string | null | undefined)[][],
): string {
  return [headers, ...rows]
    .map((row) => row.map(toCsvCell).join(","))
    .join("\r\n")
}

const LICENSE_COLUMNS: readonly (readonly [
  string,
  (license: License) => string | null,
])[] = [
  ["id", (license) => license.id],
  ["name", (license) => license.attributes.name],
  ["key", (license) => license.attributes.key],
  ["status", (license) => license.attributes.status],
  ["policy", (license) => license.relationships.policy?.data?.id ?? null],
  ["product", (license) => license.relationships.product?.data?.id ?? null],
  ["owner", (license) => license.relationships.owner?.data?.id ?? null],
  ["expiry", (license) => license.attributes.expiry],
  ["created", (license) => license.attributes.created],
  [
    "metadata",
    (license) =>
      Object.keys(license.attributes.metadata).length
        ? JSON.stringify(license.attributes.metadata)
        : null,
  ],
]

export function licensesToCsv(licenses: readonly License[]): string {
  const sorted = [...licenses].sort((a, b) =>
    (a.attributes.expiry ?? "").localeCompare(b.attributes.expiry ?? ""),
  )

  return toCsv(
    LICENSE_COLUMNS.map(([header]) => header),
    sorted.map((license) => LICENSE_COLUMNS.map(([, value]) => value(license))),
  )
}
