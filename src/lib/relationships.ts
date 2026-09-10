import { Falsy } from "@/types/utility"

import { toast } from "@/lib/toast"
import { capitalize } from "@/lib/utils"

export interface RelationshipStep {
  failure: string
  run: () => Promise<unknown>
}

interface SettleRelationshipsProps {
  message: string
  steps: (RelationshipStep | Falsy)[]
}

export async function settleRelationships({
  message,
  steps,
}: SettleRelationshipsProps): Promise<void> {
  let settled = true

  for (const step of steps) {
    if (!step) continue

    try {
      await step.run()
    } catch (error) {
      settled = false
      toast({
        message: `${message}, but ${step.failure}`,
        description:
          error instanceof Error ? capitalize(error.message) : undefined,
        variant: "warning",
        options: { duration: 10000 },
      })
    }
  }

  if (settled) toast({ message, variant: "success" })
}
