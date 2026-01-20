import { useState } from "react"
import { Link, linkOptions } from "@tanstack/react-router"

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
  Home,
  Award,
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

enum View {
  Home = "home",
  Licensing = "licensing",
  Distribution = "distribution",
  Automate = "automate",
  Webhooks = "webhooks",
  Access = "access",
  Security = "security",
}

const VIEWS_LIST = [
  { view: View.Home, Icon: Home },
  {
    view: View.Licensing,
    Icon: Award,
  },
  {
    view: View.Distribution,
    Icon: Package,
  },
  { view: View.Automate, Icon: Zap },
  { view: View.Webhooks, Icon: Webhook },
  { view: View.Access, Icon: KeyRound },
  { view: View.Security, Icon: Shield },
]

const homeOptions = linkOptions([
  {
    to: "/$id/app/dashboard",
    label: "Metrics",
    params: { id: keygen.config.id },
  },
])

const licensingOptions = linkOptions([
  {
    to: "/$id/app/products",
    label: "Products",
    params: { id: keygen.config.id },
  },
  {
    to: "/$id/app/entitlements",
    label: "Entitlements",
    params: { id: keygen.config.id },
  },
  {
    to: "/$id/app/groups",
    label: "Groups",
    params: { id: keygen.config.id },
  },
  {
    to: "/$id/app/policies",
    label: "Policies",
    params: { id: keygen.config.id },
  },
  {
    to: "/$id/app/licenses",
    label: "Licenses",
    params: { id: keygen.config.id },
  },
  {
    to: "/$id/app/machines",
    label: "Machines",
    params: { id: keygen.config.id },
  },
  {
    to: "/$id/app/components",
    label: "Components",
    params: { id: keygen.config.id },
  },
  {
    to: "/$id/app/processes",
    label: "Processes",
    params: { id: keygen.config.id },
  },
  {
    to: "/$id/app/users",
    label: "Users",
    params: { id: keygen.config.id },
  },
])

/**
 * Renders the main app sidebar with a rail sidebar and a content sidebar.
 */
export default function SidebarPanel(): React.ReactElement {
  const [selectedView, setSelectedView] = useState(View.Home)
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
            {VIEWS_LIST.map(({ view, Icon }) => (
              <Tooltip key={view} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="rail"
                    size="rail"
                    className={cn(selectedView === view && "bg-background-3")}
                    onClick={() => {
                      setSelectedView(view)
                      setOpen(true)
                    }}
                  >
                    <Icon
                      className={cn(
                        "size-6 md:size-5",
                        selectedView === view
                          ? "text-content-loud"
                          : "group-hover:text-primary",
                      )}
                    />
                  </Button>
                </TooltipTrigger>

                {!isMobile && (
                  <TooltipContent side="right" className="ml-1">
                    {view.charAt(0).toUpperCase() + view.slice(1)}
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
            <Command routes={homeOptions} />
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent className="overflow-hidden">
          <SidebarGroup>{renderView(selectedView)}</SidebarGroup>
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

function renderView(view: View) {
  switch (view) {
    case View.Home:
      return renderHome()
    case View.Licensing:
      return renderLicensing()
    case View.Distribution:
      return renderDistribution()
    case View.Automate:
      return renderAutomate()
    case View.Webhooks:
      return renderWebhooks()
    case View.Access:
      return renderAccess()
    case View.Security:
      return renderSecurity()
    default:
      return null
  }
}

function renderHome() {
  return (
    <SidebarMenu>
      <SidebarGroupLabel>Home</SidebarGroupLabel>
      {homeOptions.map((option) => {
        return (
          <SidebarMenuItem key={option.to}>
            <SidebarMenuButton asChild>
              <Link
                {...option}
                activeProps={{ className: "bg-background-2 text-content-loud" }}
              >
                {option.label}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function renderLicensing() {
  return (
    <SidebarMenu>
      <SidebarGroupLabel>Licensing</SidebarGroupLabel>
      {licensingOptions.map((option) => {
        return (
          <SidebarMenuItem key={option.to}>
            <SidebarMenuButton asChild>
              <Link
                {...option}
                activeProps={{ className: "bg-background-2 text-content-loud" }}
              >
                {option.label}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function renderDistribution() {
  return (
    <SidebarMenu>
      <SidebarGroupLabel>Distribution</SidebarGroupLabel>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link
            disabled={true}
            to="/$id/app/dashboard"
            params={{ id: keygen.config.id }}
          >
            TO DO
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function renderAutomate() {
  return (
    <SidebarMenu>
      <SidebarGroupLabel>Automate</SidebarGroupLabel>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link
            disabled={true}
            to="/$id/app/dashboard"
            params={{ id: keygen.config.id }}
          >
            TO DO
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function renderWebhooks() {
  return (
    <SidebarMenu>
      <SidebarGroupLabel>Webhooks</SidebarGroupLabel>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link
            disabled={true}
            to="/$id/app/dashboard"
            params={{ id: keygen.config.id }}
          >
            TO DO
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function renderAccess() {
  return (
    <SidebarMenu>
      <SidebarGroupLabel>Access</SidebarGroupLabel>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link
            disabled={true}
            to="/$id/app/dashboard"
            params={{ id: keygen.config.id }}
          >
            TO DO
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function renderSecurity() {
  return (
    <SidebarMenu>
      <SidebarGroupLabel>Security</SidebarGroupLabel>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link
            disabled={true}
            to="/$id/app/dashboard"
            params={{ id: keygen.config.id }}
          >
            TO DO
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
