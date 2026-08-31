import { linkOptions } from "@tanstack/react-router"

import {
  type LucideIcon,
  Key,
  Home,
  Shield,
  Webhook,
  Package,
  Settings,
} from "lucide-react"

import * as keygen from "@/keygen"

import type { Permission } from "@/types/users"

export enum ViewId {
  Home = "home",
  Licensing = "licensing",
  Distribution = "distribution",
  Webhooks = "webhooks",
  Access = "access",
  Security = "security",
  Settings = "settings",
}

export type ViewRoute = {
  to: string
  label: string
  params: Record<string, unknown>
  requires?: readonly Permission[]
  ee?: boolean
  globalOnly?: boolean
}

export type View = {
  id: ViewId
  label: string
  icon: LucideIcon
  routes: ViewRoute[]
}

export const VIEWS: View[] = [
  {
    id: ViewId.Home,
    label: "Home",
    icon: Home,
    routes: linkOptions([
      {
        to: "/$accountId/app/dashboard",
        label: "Metrics",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/learn",
        label: "Learn",
        params: { accountId: keygen.config.id },
        globalOnly: true,
      },
    ]),
  },
  {
    id: ViewId.Licensing,
    label: "Licensing",
    icon: Key,
    routes: linkOptions([
      {
        to: "/$accountId/app/products",
        label: "Products",
        params: { accountId: keygen.config.id },
        requires: ["product.read"],
      },
      {
        to: "/$accountId/app/entitlements",
        label: "Entitlements",
        params: { accountId: keygen.config.id },
        requires: ["entitlement.read"],
      },
      {
        to: "/$accountId/app/groups",
        label: "Groups",
        params: { accountId: keygen.config.id },
        requires: ["group.read"],
      },
      {
        to: "/$accountId/app/policies",
        label: "Policies",
        params: { accountId: keygen.config.id },
        requires: ["policy.read"],
      },
      {
        to: "/$accountId/app/licenses",
        label: "Licenses",
        params: { accountId: keygen.config.id },
        requires: ["license.read"],
      },
      {
        to: "/$accountId/app/machines",
        label: "Machines",
        params: { accountId: keygen.config.id },
        requires: ["machine.read"],
      },
      {
        to: "/$accountId/app/components",
        label: "Components",
        params: { accountId: keygen.config.id },
        requires: ["component.read"],
      },
      {
        to: "/$accountId/app/processes",
        label: "Processes",
        params: { accountId: keygen.config.id },
        requires: ["process.read"],
      },
      {
        to: "/$accountId/app/users",
        label: "Users",
        params: { accountId: keygen.config.id },
        requires: ["user.read"],
      },
    ]),
  },
  {
    id: ViewId.Distribution,
    label: "Distribution",
    icon: Package,
    routes: linkOptions([
      {
        to: "/$accountId/app/packages",
        label: "Packages",
        params: { accountId: keygen.config.id },
        requires: ["package.read"],
      },
      {
        to: "/$accountId/app/releases",
        label: "Releases",
        params: { accountId: keygen.config.id },
        requires: ["release.read"],
      },
      {
        to: "/$accountId/app/artifacts",
        label: "Artifacts",
        params: { accountId: keygen.config.id },
        requires: ["artifact.read"],
      },
      {
        to: "/$accountId/app/platforms",
        label: "Platforms",
        params: { accountId: keygen.config.id },
        requires: ["platform.read"],
      },
      {
        to: "/$accountId/app/arches",
        label: "Architectures",
        params: { accountId: keygen.config.id },
        requires: ["arch.read"],
      },
      {
        to: "/$accountId/app/channels",
        label: "Channels",
        params: { accountId: keygen.config.id },
        requires: ["channel.read"],
      },
      {
        to: "/$accountId/app/engines",
        label: "Engines",
        params: { accountId: keygen.config.id },
        requires: ["engine.read"],
      },
    ]),
  },
  {
    id: ViewId.Webhooks,
    label: "Webhooks",
    icon: Webhook,
    routes: linkOptions([
      {
        to: "/$accountId/app/webhook-endpoints",
        label: "Endpoints",
        params: { accountId: keygen.config.id },
        requires: ["webhook-endpoint.read"],
      },
      {
        to: "/$accountId/app/webhook-events",
        label: "Events",
        params: { accountId: keygen.config.id },
        requires: ["webhook-event.read"],
      },
    ]),
  },
  {
    id: ViewId.Security,
    label: "Security",
    icon: Shield,
    routes: linkOptions([
      {
        to: "/$accountId/app/tokens",
        label: "Tokens",
        params: { accountId: keygen.config.id },
        requires: ["token.read"],
      },
      {
        to: "/$accountId/app/event-logs",
        label: "Event Logs",
        params: { accountId: keygen.config.id },
        requires: ["event-log.read"],
      },
      {
        to: "/$accountId/app/request-logs",
        label: "Request Logs",
        params: { accountId: keygen.config.id },
        requires: ["request-log.read"],
      },
    ]),
  },
  {
    id: ViewId.Settings,
    label: "Settings",
    icon: Settings,
    routes: linkOptions([
      {
        to: "/$accountId/app/general",
        label: "General",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/security",
        label: "Security",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/team",
        label: "Team",
        params: { accountId: keygen.config.id },
        requires: ["admin.read", "user.read"],
      },
      {
        to: "/$accountId/app/permissions",
        label: "Permissions",
        params: { accountId: keygen.config.id },
        requires: ["account.update"],
        ee: true,
      },
      {
        to: "/$accountId/app/developers",
        label: "Developers",
        params: { accountId: keygen.config.id },
        requires: ["token.read"],
      },
      {
        to: "/$accountId/app/billing",
        label: "Billing",
        params: { accountId: keygen.config.id },
        requires: ["account.billing.read"],
      },
    ]),
  },
]

export function viewRouteFor(pathname: string): ViewRoute | null {
  for (const view of VIEWS) {
    for (const route of view.routes) {
      if (route.to.replace("$accountId", keygen.config.id) === pathname) {
        return route
      }
    }
  }
  return null
}
