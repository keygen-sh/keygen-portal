import {
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"

import { cn } from "@/lib/utils"

const REQUEST_LOG_SKELETON_COLUMNS = [
  "Timestamp",
  "IP",
  "Status",
  "Method",
  "URL",
] as const

const REQUEST_LOG_SKELETON_ROWS = [
  ["w-44", "w-28", "w-10", "w-14", "w-64"],
  ["w-40", "w-32", "w-10", "w-16", "w-72"],
  ["w-44", "w-24", "w-10", "w-14", "w-56"],
  ["w-36", "w-28", "w-10", "w-16", "w-48"],
  ["w-44", "w-32", "w-10", "w-14", "w-64"],
  ["w-40", "w-24", "w-10", "w-12", "w-52"],
  ["w-44", "w-28", "w-10", "w-16", "w-72"],
  ["w-36", "w-32", "w-10", "w-14", "w-56"],
  ["w-44", "w-24", "w-10", "w-16", "w-60"],
  ["w-40", "w-28", "w-10", "w-12", "w-72"],
  ["w-44", "w-32", "w-10", "w-14", "w-44"],
  ["w-36", "w-24", "w-10", "w-16", "w-64"],
  ["w-44", "w-28", "w-10", "w-14", "w-56"],
  ["w-40", "w-32", "w-10", "w-16", "w-72"],
  ["w-36", "w-24", "w-10", "w-12", "w-48"],
  ["w-44", "w-28", "w-10", "w-14", "w-60"],
  ["w-40", "w-32", "w-10", "w-16", "w-52"],
  ["w-44", "w-24", "w-10", "w-14", "w-72"],
  ["w-36", "w-28", "w-10", "w-16", "w-56"],
  ["w-40", "w-32", "w-10", "w-12", "w-48"],
  ["w-44", "w-24", "w-10", "w-14", "w-72"],
  ["w-36", "w-28", "w-10", "w-16", "w-64"],
  ["w-44", "w-32", "w-10", "w-14", "w-56"],
  ["w-40", "w-24", "w-10", "w-16", "w-60"],
  ["w-36", "w-28", "w-10", "w-12", "w-48"],
  ["w-44", "w-32", "w-10", "w-14", "w-72"],
  ["w-40", "w-24", "w-10", "w-16", "w-52"],
  ["w-36", "w-28", "w-10", "w-14", "w-44"],
] as const

function StaticSkeleton({ className }: { className?: string }) {
  return <span className={className} />
}

export default function RequestLogSkeleton() {
  return (
    <div className="relative min-w-full px-2">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <TableHeader>
          <TableRow>
            {REQUEST_LOG_SKELETON_COLUMNS.map((column) => (
              <TableHead
                key={column}
                className="border-b border-accent bg-background text-sm select-none md:text-xs"
              >
                <div className="flex h-6 items-center px-1 text-xs text-content-muted">
                  {column}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {REQUEST_LOG_SKELETON_ROWS.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="pointer-events-none">
              {row.map((width, columnIndex) => (
                <TableCell
                  key={columnIndex}
                  className="border-b border-accent bg-background"
                >
                  {columnIndex === 4 ? (
                    <StaticSkeleton
                      className={cn(
                        "block h-[14px] animate-none rounded-[3px] bg-secondary/20",
                        width,
                      )}
                    />
                  ) : columnIndex === 0 ? (
                    <StaticSkeleton
                      className={cn("block h-3 rounded-sm bg-accent", width)}
                    />
                  ) : (
                    <StaticSkeleton
                      className={cn(
                        "block h-5 rounded-sm bg-content-subdued/30",
                        width,
                      )}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </table>
    </div>
  )
}
