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

import * as keygen from "@/keygen/index"
import Icon from "@/components/icon"
import CommandMenu from "@/components/command-menu"

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
export function AppSidebar() {
  const [selectedView, setSelectedView] = useState(VIEWS.HOME)
  const { open, setOpen } = useSidebar()

  return (
    <div className="flex h-full">
      {/* Rail Sidebar */}
      <Rail collapsible="none" className="w-16 border-r">
        <RailHeader className="flex flex-col items-center justify-center space-y-4 pt-6">
          <img
            src="/logomark.svg"
            alt="Keygen Logomark"
            className="h-6 md:h-4"
          />
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              open
                ? "pointer-events-none opacity-0"
                : "pointer-events-auto opacity-100 delay-100",
            )}
          >
            <RailTrigger variant="rail" size="rail" />
          </div>
        </RailHeader>

        <RailContent
          className={cn(
            "transition-transform duration-200",
            open ? "-translate-y-14 delay-100" : "translate-y-0",
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
                        selectedView === view
                          ? "text-content-loud"
                          : "group-hover:text-primary",
                      )}
                    />
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="right" className="ml-1">
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </TooltipContent>
              </Tooltip>
            ))}
          </RailGroup>
        </RailContent>

        <RailFooter className="flex flex-col items-center pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="rail" size="rail">
                <Icon name="user" className="size-6 group-hover:text-primary" />
              </Button>
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
          "flex h-full flex-col overflow-hidden transition-all duration-200",
          open ? "w-60 border-r" : "w-0",
        )}
      >
        <SidebarHeader className="flex flex-col items-center justify-center border-b p-2">
          <SidebarGroup className="flex w-full justify-between">
            <SidebarTrigger variant="rail" size="rail" />
          </SidebarGroup>
          <SidebarGroup>
            <div className="flex w-full gap-2">
              {/* Quick actions */}
              <Button
                variant="command"
                size="command"
                className="flex items-center justify-between"
              >
                Quick actions
                <kbd className="rounded-[3px] border-t border-content-subdued bg-background-3 px-1 text-xs text-nowrap text-content-subdued">
                  ⌘ K
                </kbd>
              </Button>

              {/* Search */}
              <Button
                variant="command"
                size="command"
                className="flex items-center justify-between"
              >
                <Search className="size-4" />
                <kbd className="rounded-[3px] border-t border-content-subdued bg-background-3 px-1.5 text-xs text-nowrap text-content-subdued">
                  /
                </kbd>
              </Button>
            </div>
            <CommandMenu routes={options} />
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>{renderView(selectedView)}</SidebarGroup>
        </SidebarContent>
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
