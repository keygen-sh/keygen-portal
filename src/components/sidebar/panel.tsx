import { useState } from "react"
import { Link, linkOptions, useMatchRoute } from "@tanstack/react-router"

import { Search } from "lucide-react"

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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"

import {
  type LucideIcon,
  Home,
  Key,
  Package,
  Zap,
  Webhook,
  KeyRound,
  Shield,
  User,
} from "lucide-react"

import * as keygen from "@/keygen"
import { useMobile } from "@/hooks/use-mobile"
import Combobox from "./combobox"
import Command from "./command"

enum ViewId {
  Home = "home",
  Licensing = "licensing",
  Distribution = "distribution",
  Automate = "automate",
  Webhooks = "webhooks",
  Access = "access",
  Security = "security",
}

type ViewRoute = {
  to: string
  label: string
  params: Record<string, unknown>
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
      },
      {
        to: "/$accountId/app/entitlements",
        label: "Entitlements",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/groups",
        label: "Groups",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/policies",
        label: "Policies",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/licenses",
        label: "Licenses",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/machines",
        label: "Machines",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/components",
        label: "Components",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/processes",
        label: "Processes",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/users",
        label: "Users",
        params: { accountId: keygen.config.id },
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
      },
      {
        to: "/$accountId/app/releases",
        label: "Releases",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/arches",
        label: "Architectures",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/channels",
        label: "Channels",
        params: { accountId: keygen.config.id },
      },
      {
        to: "/$accountId/app/engines",
        label: "Engines",
        params: { accountId: keygen.config.id },
      },
    ]),
  },
  { id: ViewId.Automate, label: "Automate", icon: Zap, routes: [] },
  { id: ViewId.Webhooks, label: "Webhooks", icon: Webhook, routes: [] },
  { id: ViewId.Access, label: "Access", icon: KeyRound, routes: [] },
  { id: ViewId.Security, label: "Security", icon: Shield, routes: [] },
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

/**
 * Renders the main app sidebar with a rail sidebar and a content sidebar.
 */
export default function SidebarPanel(): React.ReactElement {
  const activeView = useActiveView()
  const [selectedView, setSelectedView] = useState(activeView)
  const { open, setOpen } = useSidebar()

  const isMobile = useMobile()

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
            {VIEWS.map((view) => (
              <Tooltip key={view.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="rail"
                    size="rail"
                    className={cn(
                      selectedView.id === view.id && "bg-background-3",
                    )}
                    onClick={() => {
                      setSelectedView(view)
                      setOpen(true)
                    }}
                  >
                    <view.icon
                      className={cn(
                        "size-6 md:size-5",
                        selectedView.id === view.id
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
                <DropdownMenuItem disabled>Billing</DropdownMenuItem>
                <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>GitHub</DropdownMenuItem>
              <DropdownMenuItem disabled>Support</DropdownMenuItem>
              <DropdownMenuItem disabled>API</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => keygen.logout()}>
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
              {/* Quick actions */}
              <Button
                onClick={() => {
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "k", metaKey: true }),
                  )
                }}
                variant="command"
                size="command"
                className="flex items-center justify-between"
              >
                {isMobile && <span className="text-lg">⌘</span>}
                Quick actions
                {!isMobile && (
                  <kbd className="rounded-[3px] border-t border-content-subdued bg-background-3 px-1 text-xs text-nowrap text-content-subdued">
                    ⌘ K
                  </kbd>
                )}
              </Button>

              {/* Search */}
              <Button
                onClick={() =>
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "/" }),
                  )
                }
                variant="command"
                size="command"
                className="flex items-center justify-between"
              >
                <Search className="size-3 md:size-4" />
                {isMobile ? (
                  <span className="text-nowrap text-content-subdued">
                    Search
                  </span>
                ) : (
                  <kbd className="rounded-[3px] border-t border-content-subdued bg-background-3 px-1.5 text-xs text-nowrap text-content-subdued">
                    /
                  </kbd>
                )}
              </Button>
            </div>
            <Command routes={VIEWS.flatMap((v) => v.routes)} />
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent className="overflow-hidden">
          <SidebarGroup>
            <SidebarMenu>
              {selectedView && (
                <>
                  <SidebarGroupLabel>{selectedView.label}</SidebarGroupLabel>
                  {selectedView.routes.map((route) => (
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
          <Card className="w-full items-start gap-4 rounded border-none p-4">
            <CardHeader className="w-full px-0">
              <CardTitle className="text-sm">
                Your free trial ends soon
              </CardTitle>
              <CardDescription className="text-xs">
                Upgrade today to enjoy the full set of features from Keygen.
              </CardDescription>
            </CardHeader>

            <CardFooter className="w-full px-0">
              <Button size="sm">Upgrade</Button>
            </CardFooter>
          </Card>
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
