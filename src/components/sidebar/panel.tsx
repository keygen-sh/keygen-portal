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

import * as keygen from "@/keygen/index"
import { useIsMobile } from "@/hooks/use-mobile"
import Icon from "@/components/icon"
import Combobox from "./combobox"
import Command from "./command"

enum VIEWS {
  HOME = "home",
  LICENSING = "licensing",
  DISTRIBUTION = "distribution",
  AUTOMATE = "automate",
  WEBHOOKS = "webhooks",
  ACCESS = "access",
  SECURITY = "security",
}

const VIEWS_LIST = Object.values(VIEWS) as VIEWS[]

const options = linkOptions([
  {
    to: "/$id/app/dashboard",
    label: "Metrics",
    params: { id: keygen.config.id },
  },
])

/**
 * Renders the main app sidebar with a rail sidebar and a content sidebar.
 *
 * @returns {JSX.Element}
 */
export default function SidebarPanel() {
  const [selectedView, setSelectedView] = useState(VIEWS.HOME)
  const { open, setOpen } = useSidebar()

  const isMobile = useIsMobile()

  return (
    <div className={cn("flex h-full", isMobile && "absolute z-50")}>
      {/* Rail Sidebar */}
      <Rail
        collapsible={"none"}
        className={cn(
          "border-r transition-all duration-200",
          isMobile && !open ? "w-0" : isMobile && open ? "w-16" : "w-16",
        )}
      >
        <RailHeader className="flex flex-col items-center justify-center space-y-4 pt-6">
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
            "overflow-hidden md:transition-transform md:duration-200",
            open ? "md:-translate-y-14 md:delay-100" : "md:translate-y-0",
          )}
        >
          <RailGroup className="flex flex-col items-center">
            {VIEWS_LIST.map((view) => (
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
                      name={view}
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

        <RailFooter className="flex flex-col items-center pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {open && (
                <Button variant="rail" size="rail">
                  <Icon
                    name="user"
                    className="size-6 group-hover:text-primary md:size-5"
                  />
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
            <SidebarTrigger variant="rail" size="rail" className="!size-8" />
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
            <Command routes={options} />
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

function renderView(view: VIEWS) {
  switch (view) {
    case VIEWS.HOME:
      return renderHome()
    case VIEWS.LICENSING:
      return renderLicensing()
    case VIEWS.DISTRIBUTION:
      return renderDistribution()
    case VIEWS.AUTOMATE:
      return renderAutomate()
    case VIEWS.WEBHOOKS:
      return renderWebhooks()
    case VIEWS.ACCESS:
      return renderAccess()
    case VIEWS.SECURITY:
      return renderSecurity()
    default:
      return null
  }
}

function renderHome() {
  return (
    <SidebarMenu>
      <SidebarGroupLabel>Home</SidebarGroupLabel>
      {options.map((option) => {
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
