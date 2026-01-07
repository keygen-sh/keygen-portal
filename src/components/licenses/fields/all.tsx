import { Separator } from "@/components/ui/separator"

import { Policy } from "@/types/policies"

import { cn } from "@/lib/utils"

import GeneralFields from "./general"
import ExpirationFields from "./expiration"
import LimitsFields from "./limits"
import AdditionalFields from "./additional"

interface AllFieldsProps {
  selectedPolicy?: Policy | null
  className?: string
}

export default function AllFields({
  selectedPolicy,
  className,
}: AllFieldsProps): React.ReactElement {
  return (
    <div className={cn("p-4", className)}>
      <h2 className="text-content-loud/90">Attributes</h2>
      <div className="mt-6 flex w-full flex-col md:flex-row">
        <GeneralFields layout="edit" className="flex-1" />

        <Separator className="my-6 block md:hidden" />

        <div className="mx-8 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <ExpirationFields layout="edit" className="flex-1" />
      </div>

      <Separator className="my-6" />

      <LimitsFields layout="edit" selectedPolicy={selectedPolicy} />

      <Separator className="my-6" />

      <AdditionalFields layout="edit" />
    </div>
  )
}
