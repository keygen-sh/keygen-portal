import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function PolicyFieldsSkeleton(): React.ReactElement {
  return (
    <div className="p-4">
      <h2 className="text-content-loud/90">General</h2>
      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-3/5" />
        </div>

        <div className="mx-8 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="mt-4 w-full space-y-3 md:mt-0">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-9 w-3/4" />
        </div>
      </section>

      <Separator className="my-6" />

      <h2 className="text-content-loud/90">Attributes</h2>
      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-9 w-full" />
          <div className="flex w-full justify-between">
            <Skeleton className="h-9 w-1/2" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>

        <div className="mx-8 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="mt-6 w-full space-y-6 md:mt-0">
          <Skeleton className="hidden h-9 w-3/5 md:block" />
          <Skeleton className="hidden h-9 w-1/3 md:block" />
          <Skeleton className="hidden h-9 w-1/2 md:block" />
        </div>
      </section>

      <Separator className="my-6" />

      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-9 w-1/3" />
        </div>

        <div className="mx-8 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="w-full space-y-6">
          <Skeleton className="hidden h-9 w-full md:block" />
          <Skeleton className="hidden h-9 w-1/3 md:block" />
        </div>
      </section>
    </div>
  )
}
