import { Fragment } from "react"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

type Crumb = { key: string; title: string }

interface CollapsedBreadcrumbProps {
  crumb: Crumb[]
  step: number
  goTo: (index: number) => void
  visibleSteps?: number
  className?: string
}

export default function CollapsedBreadcrumb({
  crumb,
  step,
  goTo,
  visibleSteps = 3,
  className,
}: CollapsedBreadcrumbProps): React.ReactElement | null {
  const currentIndex = Math.max(0, step - 1)

  const total = crumb.length
  if (total === 0) return null

  let start = Math.max(0, currentIndex - 1)
  if (start > total - visibleSteps) start = Math.max(0, total - visibleSteps)
  const end = Math.min(total - 1, start + visibleSteps - 1)

  const leftHidden = start > 0
  const rightHidden = end < total - 1

  return (
    <Breadcrumb className={cn("overflow-hidden", className)}>
      <BreadcrumbList className="flex-nowrap">
        {leftHidden && (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="inline-flex h-5 items-center rounded-sm text-content-normal"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Previous steps</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[16rem]">
                  {crumb.slice(0, start).map((path, i) => (
                    <DropdownMenuItem
                      key={path.key}
                      onClick={() => goTo(i + 1)}
                    >
                      {path.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {crumb.slice(start, end + 1).map((path, i) => {
          const absolute = start + i + 1
          const isCurrent = absolute === step
          const isPrevious = absolute < step

          return (
            <Fragment key={path.key}>
              {i !== 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isCurrent ? (
                  <BreadcrumbPage className="max-w-[14rem] truncate">
                    {path.title}
                  </BreadcrumbPage>
                ) : isPrevious ? (
                  <button
                    className="max-w-[14rem] cursor-pointer truncate text-content-normal transition-colors hover:text-content-muted"
                    onClick={() => goTo(absolute)}
                  >
                    {path.title}
                  </button>
                ) : (
                  <span className="max-w-[14rem] truncate text-content-normal">
                    {path.title}
                  </span>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}

        {rightHidden && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="inline-flex h-5 items-center rounded-sm text-content-normal"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Upcoming steps</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[16rem]">
                  {crumb.slice(end + 1).map((path) => (
                    <DropdownMenuItem key={path.key} disabled>
                      {path.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
