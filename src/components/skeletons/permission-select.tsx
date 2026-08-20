import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const SKELETON_GROUPS: {
  heading: string
  rows: [name: string, description: string][]
}[] = [
  {
    heading: "w-16",
    rows: [
      ["w-44", "w-72"],
      ["w-40", "w-80"],
      ["w-36", "w-64"],
    ],
  },
  {
    heading: "w-14",
    rows: [
      ["w-28", "w-56"],
      ["w-32", "w-72"],
      ["w-24", "w-48"],
    ],
  },
  {
    heading: "w-20",
    rows: [
      ["w-36", "w-64"],
      ["w-40", "w-80"],
    ],
  },
  {
    heading: "w-16",
    rows: [["w-32", "w-72"]],
  },
]

export default function PermissionSelectSkeleton() {
  return (
    <>
      {SKELETON_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="p-1">
          <div className="flex items-center gap-3 py-1.5 pl-3">
            <Skeleton className="size-4 shrink-0 rounded-[4px]" />
            <Skeleton className={cn("h-4 rounded-[4px]", group.heading)} />
          </div>

          {group.rows.map(([name, description], rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-start gap-3 py-2 pr-3 pl-10 md:items-center"
            >
              <Skeleton className="mt-0.5 size-4 shrink-0 rounded-[4px] md:mt-0" />

              <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
                <div className="flex items-center md:w-72 md:shrink-0">
                  <Skeleton className={cn("h-4 rounded-[4px]", name)} />
                </div>

                <Skeleton className={cn("h-3 rounded-[4px]", description)} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
