import { Button } from "@/components/ui/button"

import { Lock } from "lucide-react"

import { useCloud } from "@/hooks/use-cloud"

import { PRICING_URL } from "@/lib/url"

import * as Forms from "@/components/forms"
import * as Skeletons from "@/components/skeletons"
import LockedOverlay from "@/components/locked-overlay"

export default function PermissionsUpgrade() {
  const { isCloud } = useCloud()

  const title = isCloud
    ? "Permissions is an Ent offering"
    : "Permissions is an EE offering"
  const description = isCloud
    ? "Control what each user, license, product, and token can do across your account. Upgrade to Keygen Ent to unlock permissions."
    : "Control what each user, license, product, and token can do across your account. Upgrade to Keygen EE to unlock permissions."

  return (
    <Forms.Field.Header label="Permissions" variant="stacking">
      <LockedOverlay
        className="h-64"
        icon={<Lock className="size-4" />}
        title={title}
        description={description}
        action={
          <Button size="sm" asChild>
            <a href={PRICING_URL} target="_blank" rel="noreferrer">
              View Pricing
            </a>
          </Button>
        }
      >
        <Skeletons.PermissionSelect static />
      </LockedOverlay>
    </Forms.Field.Header>
  )
}
