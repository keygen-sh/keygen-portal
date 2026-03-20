import semver from "semver"

import { AttributeType } from "@/components/attribute/value"
import { Release, ReleaseChannel } from "@/types/releases"

export const releaseAttributeTypeSchema: Record<
  keyof Omit<Release["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  name: "string",
  description: "string",
  channel: "enum",
  status: "enum",
  tag: "string",
  version: "raw",
  semver: "json",
  backdated: "date",
  yanked: "date",
}

export function recomposeVersion(
  version: string,
  from: ReleaseChannel,
  to: ReleaseChannel,
): string {
  if (!version) {
    return ""
  }

  const sv = semver.coerce(version, { includePrerelease: true })
  if (!sv) {
    return version
  }

  // versions are broken up into <main>-<prerelease>+<build>
  const main = `${sv.major}.${sv.minor}.${sv.patch}`
  const build = sv.build.length > 0 ? `+${sv.build.join(".")}` : ""

  if (to === ReleaseChannel.Stable) {
    return `${main}${build}`
  }

  const prerelease = [...sv.prerelease]
  if (prerelease[0] === from) {
    prerelease.shift()
  }

  const pre = prerelease.join(".") || "1"
  return `${main}-${to}.${pre}${build}`
}
