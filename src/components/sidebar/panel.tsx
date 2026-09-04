import { useEffect, useState } from "react"
import { Link, useLocation, useMatchRoute } from "@tanstack/react-router"

import { cn } from "@/lib/utils"
import { VIEWS, ViewId, type View, type ViewRoute } from "@/lib/views"
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
  SidebarMenuAction,
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

import { User, Star, StarOff, GripVertical } from "lucide-react"

import * as keygen from "@/keygen"

import {
  favoriteKey,
  useFavorites,
  reorderFavorites,
  toggleFavoritePage,
  toggleFavoriteRoute,
} from "@/hooks/use-favorites"
import { useCloud } from "@/hooks/use-cloud"
import { useMobile } from "@/hooks/use-mobile"
import { useAppVersion } from "@/hooks/use-app-version"
import { usePermissions } from "@/hooks/use-permissions"
import { useEnvironment } from "@/hooks/use-environment"
import { useListReorder, reorderSubset } from "@/hooks/use-list-reorder"

import { DOCS_API_URL, GITHUB_URL } from "@/lib/url"

import { useLogout } from "@/queries/auth"

import * as Palette from "@/components/palette"
import * as SidebarNotice from "./notice"
import Combobox from "./combobox"

function useActiveView(): View {
  const matchRoute = useMatchRoute()
  const accountId = keygen.config.id

  for (const view of VIEWS) {
    if (
      view.routes.some((o) =>
        matchRoute({ to: o.to, params: { accountId }, fuzzy: true }),
      )
    ) {
      return view
    }
  }

  return VIEWS.find((view) => view.id === ViewId.Home)!
}

function useVisibleViews(): View[] {
  const { canAll } = usePermissions()
  const { code } = useEnvironment()

  const isRouteVisible = (route: ViewRoute): boolean => {
    if (route.ee && keygen.config.isCE) return false
    if (route.globalOnly && code != null) return false
    return route.requires == null || canAll(route.requires)
  }

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

function FavoriteReorderItem({
  onRemove,
  handleProps,
  children,
}: {
  onRemove: () => void
  handleProps: React.ComponentProps<typeof SidebarMenuAction>
  children: React.ReactElement
}) {
  return (
    <SidebarMenuItem data-reorder-item>
      <SidebarMenuButton asChild>{children}</SidebarMenuButton>
      <SidebarMenuAction
        showOnHover
        className="right-6 cursor-grab touch-none active:cursor-grabbing"
        {...handleProps}
      >
        <GripVertical />
      </SidebarMenuAction>
      <SidebarMenuAction showOnHover onClick={onRemove}>
        <StarOff />
      </SidebarMenuAction>
    </SidebarMenuItem>
  )
}

export default function SidebarPanel(): React.ReactElement {
  const activeView = useActiveView()
  const visibleViews = useVisibleViews()
  const [selectedView, setSelectedView] = useState(activeView)
  const [prevActiveId, setPrevActiveId] = useState(activeView.id)

  // follow route when nav jumps into a different view section
  if (activeView.id !== prevActiveId) {
    setPrevActiveId(activeView.id)
    setSelectedView(activeView)
  }

  const { can } = usePermissions()
  const accountId = keygen.config.id
  const { open, setOpen } = useSidebar()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const allFavorites = useFavorites()

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

  const allVisibleRoutes = visibleViews.flatMap((view) =>
    view.routes.filter(
      (route) => isCloud || route.to !== "/$accountId/app/billing",
    ),
  )
  const favorites = allFavorites.filter((favorite) =>
    favorite.kind === "route"
      ? allVisibleRoutes.some((route) => route.to === favorite.to)
      : favorite.accountId === accountId,
  )
  const hasFavorites = favorites.length > 0

  const pathname = useLocation({ select: (location) => location.pathname })
  const isCurrentPageFavorited = favorites.some(
    (favorite) => favorite.kind === "page" && favorite.path === pathname,
  )

  const favoritesReorder = useListReorder((from, to) =>
    reorderFavorites(reorderSubset(allFavorites, favorites, from, to)),
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
              <Tooltip key={view.id}>
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
              <DropdownMenuItem asChild>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </DropdownMenuItem>
              {keygen.config.supportEmail && (
                <DropdownMenuItem asChild>
                  <a href={`mailto:${keygen.config.supportEmail}`}>Support</a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <a href={DOCS_API_URL} target="_blank" rel="noreferrer">
                  API
                </a>
              </DropdownMenuItem>
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

        <SidebarContent className="gap-0 overflow-x-hidden overflow-y-auto">
          <SidebarGroup>
            <SidebarMenu>
              {currentView && (
                <>
                  <SidebarGroupLabel>{currentView.label}</SidebarGroupLabel>
                  {visibleRoutes.map((route) => {
                    const isFavorite = allFavorites.some(
                      (favorite) =>
                        favorite.kind === "route" && favorite.to === route.to,
                    )

                    return (
                      <SidebarMenuItem key={route.to}>
                        <SidebarMenuButton asChild>
                          <Link
                            {...route}
                            params={{ accountId }}
                            activeOptions={{ exact: isCurrentPageFavorited }}
                            activeProps={{
                              className: "bg-background-2 text-content-loud",
                            }}
                          >
                            {route.label}
                          </Link>
                        </SidebarMenuButton>
                        <SidebarMenuAction
                          showOnHover={!isFavorite}
                          onClick={() => toggleFavoriteRoute(route.to)}
                        >
                          <Star className={cn(isFavorite && "fill-current")} />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    )
                  })}
                </>
              )}
            </SidebarMenu>
          </SidebarGroup>
          {hasFavorites && (
            <SidebarGroup className="mt-2 pt-0">
              <SidebarMenu>
                <SidebarGroupLabel>Favorites</SidebarGroupLabel>
                {favorites.map((favorite) => {
                  const { label, linkProps, onRemove } =
                    favorite.kind === "route"
                      ? (() => {
                          const route = allVisibleRoutes.find(
                            (r) => r.to === favorite.to,
                          )!
                          return {
                            label: route.label,
                            linkProps: {
                              ...route,
                              params: { accountId },
                              activeOptions: { exact: isCurrentPageFavorited },
                            },
                            onRemove: () => toggleFavoriteRoute(favorite.to),
                          }
                        })()
                      : {
                          label: favorite.label,
                          linkProps: { to: favorite.path },
                          onRemove: () => toggleFavoritePage(favorite),
                        }

                  return (
                    <FavoriteReorderItem
                      key={favoriteKey(favorite)}
                      handleProps={favoritesReorder.handleProps}
                      onRemove={onRemove}
                    >
                      <Link
                        {...linkProps}
                        activeProps={{
                          className: "bg-background-2 text-content-loud",
                        }}
                      >
                        <span>{label}</span>
                      </Link>
                    </FavoriteReorderItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="w-60 border-none p-4">
          <SidebarNotice.Onboarding
            fallback={
              hasUpdate ? (
                <SidebarNotice.NewVersion onReload={reload} />
              ) : (
                <SidebarNotice.Billing />
              )
            }
          />
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
