import { type ReactElement } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { type Linkage } from "@/types/api"

import { useGetArch } from "@/queries/arches"
import { useGetUser } from "@/queries/users"
import { useGetGroup } from "@/queries/groups"
import { useGetEngine } from "@/queries/engines"
import { useGetPolicy } from "@/queries/policies"
import { useGetAccount } from "@/queries/accounts"
import { useGetLicense } from "@/queries/licenses"
import { useGetMachine } from "@/queries/machines"
import { useGetPackage } from "@/queries/packages"
import { useGetProduct } from "@/queries/products"
import { useGetChannel } from "@/queries/channels"
import { useGetProcess } from "@/queries/processes"
import { useGetRelease } from "@/queries/releases"
import { useGetArtifact } from "@/queries/artifacts"
import { useGetPlatform } from "@/queries/platforms"
import { useGetComponent } from "@/queries/components"
import { useGetEntitlement } from "@/queries/entitlements"
import { useGetEnvironment } from "@/queries/environments"

import { getUserLabel } from "@/lib/users"
import { getGroupLabel } from "@/lib/groups"
import { getLicenseLabel } from "@/lib/licenses"
import { getMachineLabel } from "@/lib/machines"
import { getPackageLabel } from "@/lib/packages"
import { getReleaseLabel } from "@/lib/releases"
import { truncator } from "@/lib/truncate"

import * as keygen from "@/keygen"
import GoToButton from "@/components/go-to-button"

const NAVIGABLE_TYPES = new Set([
  "products",
  "entitlements",
  "groups",
  "policies",
  "licenses",
  "machines",
  "components",
  "processes",
  "users",
  "packages",
  "releases",
  "artifacts",
])

const truncateLabel = truncator("end", { maxLength: 24 })

interface ResourceLinkViewProps {
  linkage: Linkage
  label?: string | null
  isLoading?: boolean
  isError?: boolean
  buttonClassName?: string
  truncate?: boolean
}

function ResourceLinkView({
  linkage,
  label,
  isLoading,
  isError,
  buttonClassName,
  truncate = false,
}: ResourceLinkViewProps): ReactElement {
  if (isLoading) return <Skeleton className="h-5 w-32 rounded-sm" />

  const resolved = label || linkage.id
  const text = truncate ? truncateLabel(resolved) : resolved

  // a resource we can't resolve, e.g. a user/bearer that
  // lives outside the active environment's scope
  if (isError) {
    return (
      <Tooltip>
        <TooltipTrigger className="cursor-pointer">
          <GoToButton
            path={`/$accountId/app/${linkage.type}/$id`}
            params={{ accountId: keygen.config.id, id: linkage.id }}
            label={text}
            disabled
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
          This resource could not be loaded. It may not be accessible from this
          environment, or you may not have permission.
        </TooltipContent>
      </Tooltip>
    )
  }

  if (!NAVIGABLE_TYPES.has(linkage.type)) {
    return <span className="text-content-normal">{text}</span>
  }

  return (
    <GoToButton
      path={`/$accountId/app/${linkage.type}/$id`}
      params={{ accountId: keygen.config.id, id: linkage.id }}
      label={text}
      buttonClassName={buttonClassName}
    />
  )
}

interface ResolvedLinkProps {
  linkage: Linkage
  buttonClassName?: string
  truncate?: boolean
}

function makeResourceLink<T>(
  useGet: (id: string) => {
    data: T | undefined
    isLoading: boolean
    isError: boolean
  },
  getLabel: (data: T | undefined) => string | null | undefined,
) {
  return function ResolvedLink({
    linkage,
    buttonClassName,
    truncate,
  }: ResolvedLinkProps): ReactElement {
    const { data, isLoading, isError } = useGet(linkage.id)

    return (
      <ResourceLinkView
        linkage={linkage}
        label={getLabel(data)}
        isLoading={isLoading}
        isError={isError}
        buttonClassName={buttonClassName}
        truncate={truncate}
      />
    )
  }
}

const RESOURCE_LINKS: Record<
  string,
  (props: ResolvedLinkProps) => ReactElement
> = {
  accounts: makeResourceLink(
    () => useGetAccount(),
    (data) => data?.attributes.name,
  ),
  environments: makeResourceLink(useGetEnvironment, (d) => d?.attributes.name),
  products: makeResourceLink(useGetProduct, (d) => d?.attributes.name),
  entitlements: makeResourceLink(useGetEntitlement, (d) => d?.attributes.name),
  groups: makeResourceLink(useGetGroup, (d) => (d ? getGroupLabel(d) : null)),
  policies: makeResourceLink(useGetPolicy, (d) => d?.attributes.name),
  licenses: makeResourceLink(useGetLicense, (d) =>
    d ? getLicenseLabel(d) : null,
  ),
  machines: makeResourceLink(useGetMachine, (d) =>
    d ? getMachineLabel(d) : null,
  ),
  components: makeResourceLink(
    useGetComponent,
    (d) => d?.attributes.name || d?.attributes.fingerprint,
  ),
  processes: makeResourceLink(useGetProcess, (d) => d?.attributes.pid),
  users: makeResourceLink(useGetUser, (d) => (d ? getUserLabel(d) : null)),
  packages: makeResourceLink(useGetPackage, (d) =>
    d ? getPackageLabel(d) : null,
  ),
  releases: makeResourceLink(useGetRelease, (d) =>
    d ? getReleaseLabel(d) : null,
  ),
  artifacts: makeResourceLink(useGetArtifact, (d) => d?.attributes.filename),
  platforms: makeResourceLink(useGetPlatform, (d) => d?.attributes.name),
  arches: makeResourceLink(useGetArch, (d) => d?.attributes.name),
  channels: makeResourceLink(useGetChannel, (d) => d?.attributes.name),
  engines: makeResourceLink(useGetEngine, (d) => d?.attributes.key),
}

export interface ResourceLinkProps {
  linkage?: Linkage | null
  emptyLabel?: string
  buttonClassName?: string
  truncate?: boolean
}

export default function ResourceLink({
  linkage,
  emptyLabel = "None",
  buttonClassName,
  truncate,
}: ResourceLinkProps): ReactElement {
  if (!linkage) {
    return <span className="text-content-subdued">{emptyLabel}</span>
  }

  const ResolvedLink = RESOURCE_LINKS[linkage.type]

  if (ResolvedLink) {
    return (
      <ResolvedLink
        linkage={linkage}
        buttonClassName={buttonClassName}
        truncate={truncate}
      />
    )
  }

  return (
    <ResourceLinkView
      linkage={linkage}
      buttonClassName={buttonClassName}
      truncate={truncate}
    />
  )
}
