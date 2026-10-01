import { Button } from "@/components/ui/button"

import { Lock } from "lucide-react"

import { PRICING_URL } from "@/lib/url"

import * as Forms from "@/components/forms"
import * as Skeletons from "@/components/skeletons"
import LockedOverlay from "@/components/locked-overlay"

export default function PermissionsUpgrade() {
  return (
    <Forms.Field.Header label="Permissions" variant="stacking">
      <LockedOverlay
        className="h-64"
        icon={<Lock className="size-4" />}
        title="Permissions is an EE offering"
        description="Control what each user, license, product, and token can do across your account. Upgrade to Keygen EE to unlock permissions."
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
