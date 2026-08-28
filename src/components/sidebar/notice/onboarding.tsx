import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

import { useListLicenses } from "@/queries/licenses"
import { useListProducts } from "@/queries/products"
import { useListEnvironments } from "@/queries/environments"

import { useEdition } from "@/hooks/use-edition"
import { useEnvironment } from "@/hooks/use-environment"
import { usePermissions } from "@/hooks/use-permissions"
import { useOnboardingDismissed } from "@/hooks/use-onboarding-dismissed"
import { useQuickstartEnvironment } from "@/hooks/use-quickstart-environment"

import { dismissOnboarding } from "@/lib/onboarding"

import * as keygen from "@/keygen"

import SidebarNoticeCard from "./card"

interface SidebarNoticeOnboardingProps {
  fallback?: React.ReactNode
}

export default function SidebarNoticeOnboarding({
  fallback = null,
}: SidebarNoticeOnboardingProps): React.ReactNode {
  const accountId = keygen.config.id
  const { isEE } = useEdition()
  const { code } = useEnvironment()
  const { can, canAll } = usePermissions()
  const dismissed = useOnboardingDismissed(accountId)

  const canCreateEnvironment = isEE && can("environment.create")

  const eligible =
    !dismissed &&
    code == null &&
    canAll([
      "product.create",
      "policy.create",
      "license.create",
      "license.read",
    ])

  const quickstart = useQuickstartEnvironment({
    enabled: eligible && isEE && can("environment.read"),
  })
  const quickstartCode = quickstart.environment?.code ?? null

  const licenses = useListLicenses(
    { pageSize: 1, environment: quickstartCode },
    { enabled: eligible && !quickstart.isPending },
  )
  const hasLicenses = licenses.data.length > 0

  const suppressorEnabled = eligible && isEE && can("product.read")
  const environments = useListEnvironments(undefined, {
    enabled: suppressorEnabled,
  })
  const products = useListProducts(
    { pageSize: 1, environment: quickstartCode },
    { enabled: suppressorEnabled && !quickstart.isPending },
  )
  const isEstablished =
    suppressorEnabled &&
    environments.data.length > 0 &&
    products.data.length > 0

  if (!eligible || licenses.isError || hasLicenses || isEstablished) {
    return fallback
  }

  if (
    licenses.isPending ||
    (suppressorEnabled && (environments.isPending || products.isPending))
  ) {
    return null
  }

  return (
    <SidebarNoticeCard
      title="Get started with Keygen"
      description={
        canCreateEnvironment
          ? "Invite teammates, configure an environment and learn how to create a product, a policy, and your first license."
          : "Invite teammates and learn how to create a product, a policy, and your first license."
      }
      onDismiss={() => dismissOnboarding(accountId)}
      dismissLabel="Dismiss setup guide"
    >
      <Button size="sm" asChild>
        <Link to="/$accountId/app/learn" params={{ accountId }}>
          Get started
        </Link>
      </Button>
    </SidebarNoticeCard>
  )
}
