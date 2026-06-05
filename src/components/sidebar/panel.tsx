import { useEffect, useState } from "react"
import { Link, linkOptions, useMatchRoute } from "@tanstack/react-router"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar as Rail,
  SidebarHeader as RailHeader,
  SidebarTrigger as RailTrigger,
  SidebarContent as RailContent,
  SidebarFooter as RailFooter,
  SidebarGroup as RailGroup,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  type LucideIcon,
  Zap,
  Key,
  User,
  Home,
  Shield,
  Webhook,
  Package,
  Settings,
  KeyRound,
} from "lucide-react"

import * as keygen from "@/keygen"

import { useCloud } from "@/hooks/use-cloud"
import { useMobile } from "@/hooks/use-mobile"
import { useAppVersion } from "@/hooks/use-app-version"
import { usePermissions } from "@/hooks/use-permissions"

import { useLogout } from "@/queries/auth"

import type { Permission } from "@/types/users"

import * as Palette from "@/components/palette"
import Combobox from "./combobox"
import NewVersionCard from "./new-version-card"
import BillingStatusCard from "./billing-status-card"

enum ViewId {
  Home = "home",
  Licensing = "licensing",
  Distribution = "distribution",
  Automate = "automate",
  Webhooks = "webhooks",
  Access = "access",
  Security = "security",
  Settings = "settings",
}

type ViewRoute = {
  to: string
  label: string
  params: Record<string, unknown>
  requires?: readonly Permission[]
}

type View = {
  id: ViewId
  label: string
  icon: LucideIcon
  routes: ViewRoute[]
}

const VIEWS: View[] = [
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
  { id: ViewId.Automate, label: "Automate", icon: Zap, routes: [] },
  { id: ViewId.Webhooks, label: "Webhooks", icon: Webhook, routes: [] },
  {
    id: ViewId.Access,
    label: "Access",
    icon: KeyRound,
    routes: [],
  },
  {
    id: ViewId.Security,
    label: "Security",
    icon: Shield,
    routes: linkOptions([
      {
        to: "/$accountId/app/event-logs",
        label: "Event Logs",
        params: { accountId: keygen.config.id },
        requires: ["event-log.read"],
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

function useActiveView(): View {
  const matchRoute = useMatchRoute()

  for (const view of VIEWS) {
    if (
      view.routes.some((o) =>
        matchRoute({ to: o.to, params: o.params, fuzzy: true }),
      )
    ) {
      return view
    }
  }

  return VIEWS.find((view) => view.id === ViewId.Home)!
}

function useVisibleViews(): View[] {
  const { canAll } = usePermissions()

  const isRouteVisible = (route: ViewRoute): boolean =>
    route.requires == null || canAll(route.requires)

  const filtered = VIEWS.map((view) => ({
    ...view,
    routes: view.routes.filter(isRouteVisible),
  }))

  return filtered.filter((view) => {
    if (view.id === ViewId.Home) return true
    const original = VIEWS.find((v) => v.id === view.id)!
    if (original.routes.length === 0) return true
    return view.routes.length > 0
  })
}

export default function SidebarPanel(): React.ReactElement {
  const activeView = useActiveView()
  const visibleViews = useVisibleViews()
  const { can } = usePermissions()
  const [selectedView, setSelectedView] = useState(activeView)
  const { open, setOpen } = useSidebar()
  const [paletteOpen, setPaletteOpen] = useState(false)

  const isMobile = useMobile()
  const { isCloud } = useCloud()
  const { hasUpdate, reload } = useAppVersion()

  const logout = useLogout()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const currentView =
    visibleViews.find((v) => v.id === selectedView.id) ?? visibleViews[0]

  const visibleRoutes = isCloud
    ? (currentView?.routes ?? [])
    : (currentView?.routes ?? []).filter(
        (r) => r.to !== "/$accountId/app/billing",
      )

  return (
    <div className={cn("flex h-full", isMobile && "absolute z-50")}>
      {/* Rail Sidebar */}
      <Rail
        collapsible={"none"}
        className={cn(
          "border-r bg-background transition-all duration-200",
          isMobile && !open ? "w-0" : isMobile && open ? "w-16" : "w-16",
        )}
      >
        <RailHeader className="flex flex-col items-center justify-center space-y-4 pt-6 pb-0">
          <img
            src="/logomark.svg"
            alt="Keygen Logomark"
            className="h-5 md:h-4"
          />
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              open
                ? "pointer-events-none opacity-0"
                : "pointer-events-auto opacity-100 delay-100",
            )}
          >
            {!isMobile && <RailTrigger variant="rail" size="rail" />}
          </div>
        </RailHeader>

        <RailContent
          className={cn(
            "overflow-x-hidden border-t border-b border-accent md:border-none md:transition-transform md:duration-200",
            open ? "md:-translate-y-14 md:delay-100" : "md:translate-y-0",
          )}
        >
          <RailGroup className="flex flex-col items-center">
            {visibleViews.map((view) => (
              <Tooltip key={view.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="rail"
                    size="rail"
                    className={cn(
                      currentView?.id === view.id && "bg-background-3",
                    )}
                    onClick={() => {
                      setSelectedView(view)
                      setOpen(true)
                    }}
                  >
                    <view.icon
                      className={cn(
                        "size-6 md:size-5",
                        currentView?.id === view.id
                          ? "text-content-loud"
                          : "group-hover:text-primary",
                      )}
                    />
                  </Button>
                </TooltipTrigger>

                {!isMobile && (
                  <TooltipContent side="right" className="ml-1">
                    {view.label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </RailGroup>
        </RailContent>

        <RailFooter className="flex flex-col items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {open && (
                <Button variant="rail" size="rail">
                  <User className="size-6 group-hover:text-primary md:size-5" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="ml-8 w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {isCloud && can("account.billing.read") && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/$accountId/app/billing"
                      params={{ accountId: keygen.config.id }}
                    >
                      Billing
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link
                    to="/$accountId/app/general"
                    params={{ accountId: keygen.config.id }}
                  >
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>GitHub</DropdownMenuItem>
              <DropdownMenuItem disabled>Support</DropdownMenuItem>
              <DropdownMenuItem disabled>API</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout.mutate()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </RailFooter>
      </Rail>

      {/* Content Sidebar */}
      <Sidebar
        collapsible="none"
        variant="sidebar"
        side="left"
        className={cn(
          "z-10 flex h-full flex-col overflow-hidden bg-background transition-all duration-200",
          open ? "w-60 border-r" : "w-0",
        )}
      >
        <SidebarHeader className="flex flex-col items-center justify-center border-b">
          <SidebarGroup className="flex-row justify-between px-1">
            <Combobox />
            <SidebarTrigger variant="rail" size="rail" className="size-8!" />
          </SidebarGroup>
          <SidebarGroup className="flex-row justify-between px-1 pt-0 pb-2">
            <div className="flex w-full gap-2">
              <Button
                onClick={() => setPaletteOpen(true)}
                variant="command"
                size="command"
                className={cn(
                  "flex w-full items-center",
                  isMobile
                    ? "justify-start gap-2 text-left"
                    : "justify-between",
                )}
              >
                {isMobile && <span className="text-lg">⌘</span>}
                Quick actions / search...
                {!isMobile && (
                  <kbd className="rounded-[3px] border-t border-content-subdued bg-background-3 px-1 text-xs text-nowrap text-content-subdued">
                    ⌘ K
                  </kbd>
                )}
              </Button>
            </div>
            <Palette.Menu open={paletteOpen} onOpenChange={setPaletteOpen} />
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent className="overflow-hidden">
          <SidebarGroup>
            <SidebarMenu>
              {currentView && (
                <>
                  <SidebarGroupLabel>{currentView.label}</SidebarGroupLabel>
                  {visibleRoutes.map((route) => (
                    <SidebarMenuItem key={route.to}>
                      <SidebarMenuButton asChild>
                        <Link
                          {...route}
                          activeProps={{
                            className: "bg-background-2 text-content-loud",
                          }}
                        >
                          {route.label}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="w-60 border-none p-4">
          {hasUpdate ? (
            <NewVersionCard onReload={reload} />
          ) : (
            <BillingStatusCard />
          )}
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
