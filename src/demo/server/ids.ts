const UUID_PATTERN =
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i

export function isUuid(value: string): boolean
export function isUuid(value: unknown): value is string
export function isUuid(value: unknown): boolean {
  return typeof value === "string" && UUID_PATTERN.test(value)
}

function hex(value: number, width: number): string {
  return value.toString(16).padStart(width, "0")
}

export function randomHex(
  length: number,
  random: () => number = Math.random,
): string {
  let output = ""
  while (output.length < length) {
    output += hex(Math.floor(random() * 0x10000), 4)
  }
  return output.slice(0, length)
}

export function uuid(
  at: number = Date.now(),
  random: () => number = Math.random,
): string {
  const millis = Math.max(0, Math.floor(at))
  const timeHex =
    hex(Math.floor(millis / 0x100000000), 4) + hex(millis % 0x100000000, 8)
  const versionHex = hex(0x7000 | Math.floor(random() * 0x1000), 4)
  const variantHex = hex(0x8000 | Math.floor(random() * 0x4000), 4)
  const tailHex = randomHex(12, random)

  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-${versionHex}-${variantHex}-${tailHex}`
}

export function randomToken(
  prefix: string,
  random: () => number = Math.random,
): string {
  return `${prefix}-${randomHex(64, random)}v3`
}

export function randomLicenseKey(random: () => number = Math.random): string {
  const raw = randomHex(30, random).toUpperCase() + "V3"
  return raw.match(/.{1,6}/g)?.join("-") ?? raw
}

export function stripUuidDashes(value: string): string {
  return value.replace(/-/g, "")
}

export function addUuidDashes(value: string): string {
  return value.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5")
}
