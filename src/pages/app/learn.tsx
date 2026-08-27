import { useMemo, useState } from "react"
import { Navigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { CircleCheckBig, ExternalLink, RotateCw, Undo2 } from "lucide-react"

import * as keygen from "@/keygen"
import * as fathom from "@/fathom"

import { InternalRoles } from "@/types/users"

import { cn } from "@/lib/utils"

import { useGetCurrentUser, useListUsers } from "@/queries/users"
import { useListProducts } from "@/queries/products"
import { useListPolicies } from "@/queries/policies"
import { useListLicenses } from "@/queries/licenses"

import { useValidationListener } from "@/hooks/use-validation-listener"
import { useListEnvironments } from "@/queries/environments"

import { useEdition } from "@/hooks/use-edition"
import { useMobile } from "@/hooks/use-mobile"
import { usePermissions } from "@/hooks/use-permissions"
import { useEnvironment } from "@/hooks/use-environment"
import { useQuickstartEnvironment } from "@/hooks/use-quickstart-environment"

import { EnvironmentContext } from "@/contexts/environment-context"

import {
  DOCS_URL,
  DOCS_API_URL,
  API_SOURCE_URL,
  PORTAL_SOURCE_URL,
} from "@/lib/url"

import * as Onboarding from "@/components/onboarding"
import Carousel from "@/components/carousel"
import { Notice } from "@/components/notice"
import PageHeader from "@/components/page-header"
import GoToButton from "@/components/go-to-button"

const NEW_USER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const PERMISSION_TOOLTIPS: Record<OnboardingStep, string> = {
  invite:
    "Inviting teammates requires specific permissions. Please contact your administrator for assistance.",
  environment:
    "Creating environments requires specific permissions. Please contact your administrator for assistance.",
  product:
    "Creating products requires specific permissions. Please contact your administrator for assistance.",
  policy:
    "Creating policies requires specific permissions. Please contact your administrator for assistance.",
  license:
    "Creating licenses requires specific permissions. Please contact your administrator for assistance.",
  validate:
    "Words of great encouragement. If you're seeing this outside of code, oops.",
}

export default function Learn() {
  const { isEE } = useEdition()
  const { code, select } = useEnvironment()
  const { can, canAll } = usePermissions()

  const { data: currentUser } = useGetCurrentUser()

  const isNewUser =
    currentUser != null &&
    Date.now() - new Date(currentUser.attributes.created).getTime() <
      NEW_USER_WINDOW_MS

  const greeting = isNewUser ? "Welcome to Keygen Portal" : "Welcome back"
  const firstName = currentUser?.attributes.firstName
  const headline = firstName ? `${greeting}, ${firstName}` : greeting

  const [openDialog, setOpenDialog] = useState<OnboardingStep | null>(null)

  const dialogProps = (dialog: OnboardingStep) => ({
    open: openDialog === dialog,
    onOpenChange: (open: boolean) => setOpenDialog(open ? dialog : null),
  })

  const openStep = (step: OnboardingStep) => {
    fathom.track(`onboarding: ${step} opened`)
    setOpenDialog(step)
  }

  const canProbeTeammates = can("admin.read")
  const canProbeEnvironments = isEE && can("environment.read")
  const canProbeProducts = can("product.read")
  const canProbePolicies = can("policy.read")
  const canProbeLicenses = can("license.read")

  const quickstart = useQuickstartEnvironment({
    enabled: canProbeEnvironments,
  })
  const quickstartCode = quickstart.environment?.code ?? null

  const teammates = useListUsers(
    { pageSize: 2, filters: { roles: [...InternalRoles] } },
    { enabled: canProbeTeammates },
  )
  const environments = useListEnvironments(
    { pageSize: 1 },
    { enabled: canProbeEnvironments },
  )
  const products = useListProducts(
    { pageSize: 1, environment: quickstartCode },
    { enabled: canProbeProducts && !quickstart.isPending },
  )
  const policies = useListPolicies(
    { pageSize: 1, environment: quickstartCode },
    { enabled: canProbePolicies && !quickstart.isPending },
  )
  const licenses = useListLicenses(
    { pageSize: 10, environment: quickstartCode },
    { enabled: canProbeLicenses && !quickstart.isPending },
  )

  const latestLicense = licenses.data[0] ?? null
  const hasValidated = licenses.data.some(
    (license) => license.attributes.lastValidated != null,
  )

  const validationListener = useValidationListener({
    enabled: canProbeLicenses && !hasValidated,
    licenseId: latestLicense?.id,
    environment: quickstartCode,
  })

  const quickstartScope = useMemo(
    () => ({
      id: quickstart.environment?.id ?? null,
      code: quickstart.environment?.code ?? null,
      select: async () => {},
    }),
    [quickstart.environment?.id, quickstart.environment?.code],
  )

  const hasTeammates = teammates.data.length > 1
  const hasEnvironments = environments.data.length > 0
  const hasProducts = products.data.length > 0
  const hasPolicies = policies.data.length > 0
  const hasLicenses = licenses.data.length > 0

  const probesSettled =
    (!canProbeTeammates || teammates.isFetched) &&
    (!canProbeEnvironments || environments.isFetched) &&
    (!canProbeProducts || products.isFetched) &&
    (!canProbePolicies || policies.isFetched) &&
    (!canProbeLicenses || licenses.isFetched)

  const stepPermitted: Record<OnboardingStep, boolean> = {
    invite: canAll(["user.create", "admin.create"]),
    environment: can("environment.create"),
    product: can("product.create"),
    policy: can("policy.create"),
    license: can("license.create"),
    validate: true,
  }

  const stepComplete: Record<OnboardingStep, boolean> = {
    invite: hasTeammates,
    environment: hasEnvironments,
    product: hasProducts,
    policy: hasPolicies,
    license: hasLicenses,
    validate: hasValidated,
  }

  const canProbeStep: Record<OnboardingStep, boolean> = {
    invite: canProbeTeammates,
    environment: canProbeEnvironments,
    product: canProbeProducts,
    policy: canProbePolicies,
    license: canProbeLicenses,
    validate: canProbeLicenses,
  }

  const stepReady: Record<OnboardingStep, boolean> = {
    invite: true,
    environment: true,
    product: true,
    policy: !canProbeProducts || hasProducts,
    license: !canProbePolicies || hasPolicies,
    validate: hasLicenses,
  }

  const stepOrder: OnboardingStep[] = isEE
    ? ["invite", "environment", "product", "policy", "license", "validate"]
    : ["invite", "product", "policy", "license", "validate"]

  const [skippedSteps, setSkippedSteps] = useState<ReadonlySet<OnboardingStep>>(
    new Set(),
  )

  const skipStep = (step: OnboardingStep) => {
    fathom.track(`onboarding: ${step} skipped`)
    setSkippedSteps((prev) => new Set(prev).add(step))
  }

  const unskipStep = (step: OnboardingStep) =>
    setSkippedSteps((prev) => {
      const next = new Set(prev)
      next.delete(step)
      return next
    })

  const activeStep = probesSettled
    ? (stepOrder.find(
        (step) =>
          stepPermitted[step] &&
          canProbeStep[step] &&
          stepReady[step] &&
          !stepComplete[step] &&
          !skippedSteps.has(step),
      ) ?? null)
    : null

  const stepState = (step: OnboardingStep): OnboardingStepState =>
    stepComplete[step]
      ? "complete"
      : skippedSteps.has(step)
        ? "skipped"
        : step === activeStep
          ? "active"
          : "locked"

  const permissionTooltip = (step: OnboardingStep) =>
    stepPermitted[step] ? undefined : PERMISSION_TOOLTIPS[step]

  if (code != null) {
    return (
      <Navigate
        to="/$accountId/app/dashboard"
        params={{ accountId: keygen.config.id }}
        replace
      />
    )
  }

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Learn" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-8 p-8">
          <div className="">
            <h2 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl leading-tight font-medium text-transparent drop-shadow-[0_2px_12px_var(--color-background)] select-none">
              {headline}
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            <div className="pb-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Quickstart
              </h2>
              <p className="text-sm text-content-normal">
                Get started with Keygen immediately by inviting teammates,
                configuring an environment, and learning how to create a
                product, a basic policy, and your first license.
              </p>
            </div>
            <Carousel
              scrollToIndex={
                activeStep ? stepOrder.indexOf(activeStep) : undefined
              }
            >
              <OnboardingCard
                title="Invite teammates"
                description="Teammates get their own login credentials and permissions, and can help manage your products, policies, and licenses."
                state={stepState("invite")}
                actionLabel="Invite Teammates"
                disabledTooltip={permissionTooltip("invite")}
                onAction={() => openStep("invite")}
                onSkip={() => skipStep("invite")}
                onUndoSkip={() => unskipStep("invite")}
              />

              {isEE && (
                <OnboardingCard
                  title="Create an environment"
                  description="Use environments to separate your production data from your integration and testing data."
                  state={stepState("environment")}
                  actionLabel="New Environment"
                  disabledTooltip={permissionTooltip("environment")}
                  onAction={() => openStep("environment")}
                  onSkip={() => skipStep("environment")}
                  onUndoSkip={() => unskipStep("environment")}
                />
              )}

              <OnboardingCard
                title="Create a product"
                description="Products represent the items you sell, license, and distribute."
                state={stepState("product")}
                actionLabel="New Product"
                disabledTooltip={permissionTooltip("product")}
                onAction={() => openStep("product")}
              />

              <OnboardingCard
                title="Create a policy"
                description="Policies define behavior for the different license types that your product offers."
                state={stepState("policy")}
                actionLabel="New Policy"
                disabledTooltip={permissionTooltip("policy")}
                onAction={() => openStep("policy")}
              />

              <OnboardingCard
                title="Create a license"
                description="Licenses implement policies and grant access to your product."
                state={stepState("license")}
                actionLabel="New License"
                disabledTooltip={permissionTooltip("license")}
                onAction={() => openStep("license")}
              />

              <OnboardingCard
                title="Validate your license"
                description="Validate your license key with a live API call, and view the new license's attributes and configuration."
                state={stepState("validate")}
                actionLabel="Validate License"
                onAction={() => {
                  validationListener.arm()
                  openStep("validate")
                }}
                onRefresh={
                  validationListener.refreshable
                    ? validationListener.refresh
                    : undefined
                }
              />
            </Carousel>
          </div>

          <Notice className="max-w-xl">
            <Notice.Title>Want to skip the tutorial?</Notice.Title>
            <Notice.Description>
              <span className="mt-1 block">
                Create your product, a more customized policy with specific
                license rules, or create a license with custom usage limits and
                advanced configuration.
              </span>
              <ul className="mt-2 list-disc gap-1 text-sm text-content-normal">
                <li className="w-fit">
                  <GoToButton
                    path="/$accountId/app/products"
                    params={{ accountId: keygen.config.id }}
                    label="View Products"
                    buttonClassName="text-xs"
                  />
                </li>
                <li className="w-fit">
                  <GoToButton
                    path="/$accountId/app/policies"
                    params={{ accountId: keygen.config.id }}
                    label="View Policies"
                    buttonClassName="text-xs"
                  />
                </li>
                <li className="w-fit">
                  <GoToButton
                    path="/$accountId/app/licenses"
                    params={{ accountId: keygen.config.id }}
                    label="View Licenses"
                    buttonClassName="text-xs"
                  />
                </li>
              </ul>
            </Notice.Description>
          </Notice>

          <Separator />

          <div className="flex flex-col gap-2">
            <div className="pb-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Technical
              </h2>
              <p className="text-sm text-content-normal">
                Learn how to integrate the Keygen API into your product, and how
                to use the Keygen Portal to manage your products, policies, and
                licenses.
              </p>
            </div>
            <Carousel>
              <div className="h-full max-w-lg rounded bg-background-1 p-4">
                <div className="flex h-full flex-col justify-between gap-4">
                  <h3 className="font-owners-wide text-content-muted">
                    Documentation
                  </h3>
                  <p className="text-sm text-content-normal">
                    See the official documentation and API reference, which
                    covers everything more extensively.
                  </p>
                  <div className="flex flex-col gap-4 md:flex-row">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-none bg-background-2"
                      asChild
                    >
                      <a href={DOCS_URL} target="_blank" rel="noreferrer">
                        Open documentation
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-none bg-background-2"
                      asChild
                    >
                      <a href={DOCS_API_URL} target="_blank" rel="noreferrer">
                        Open API reference
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="h-full max-w-lg rounded bg-background-1 p-4">
                <div className="flex h-full flex-col justify-between gap-4">
                  <h3 className="font-owners-wide text-content-muted">
                    Source Code
                  </h3>
                  <p className="text-sm text-content-normal">
                    You can find both the Keygen API and Portal source code on
                    Github.
                  </p>
                  <div className="flex flex-col gap-4 md:flex-row">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-none bg-background-2"
                      asChild
                    >
                      <a href={API_SOURCE_URL} target="_blank" rel="noreferrer">
                        Read API source code
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-none bg-background-2"
                      asChild
                    >
                      <a
                        href={PORTAL_SOURCE_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Read Portal source code
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Carousel>
          </div>
        </div>
      </ScrollArea>

      <Onboarding.Form.Invite {...dialogProps("invite")} />
      {isEE && <Onboarding.Form.Environment {...dialogProps("environment")} />}

      <EnvironmentContext.Provider value={quickstartScope}>
        <Onboarding.Form.Product {...dialogProps("product")} />
        <Onboarding.Form.Policy {...dialogProps("policy")} />
        <Onboarding.Form.License {...dialogProps("license")} />
        {latestLicense && (
          <Onboarding.Dialog.Validation
            key={latestLicense.id}
            license={latestLicense}
            externalResult={validationListener.detected}
            environment={quickstart.environment}
            onSwitchEnvironment={(environment) =>
              select(environment.id, environment.code)
            }
            {...dialogProps("validate")}
          />
        )}
      </EnvironmentContext.Provider>
    </section>
  )
}

type OnboardingStep =
  | "invite"
  | "environment"
  | "product"
  | "policy"
  | "license"
  | "validate"

type OnboardingStepState = "active" | "complete" | "locked" | "skipped"

interface OnboardingCardProps {
  title: string
  description: string
  state: OnboardingStepState
  actionLabel: string
  disabledTooltip?: string
  onSkip?: () => void
  onUndoSkip?: () => void
  onAction: () => void
  onRefresh?: () => void
}

function OnboardingCard({
  title,
  description,
  state,
  actionLabel,
  disabledTooltip,
  onSkip,
  onUndoSkip,
  onAction,
  onRefresh,
}: OnboardingCardProps) {
  const complete = state === "complete"
  const dimmed = state !== "active"

  const action = complete ? (
    <span className="flex items-center gap-4 text-content-subdued">
      Complete
      <CircleCheckBig className="size-4 shrink-0 text-brand-primary" />
    </span>
  ) : state === "skipped" ? (
    <>
      <span className="text-content-subdued">Skipped</span>
      {onUndoSkip && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onUndoSkip}
          className="w-fit"
        >
          <Undo2 className="size-4" />
        </Button>
      )}
    </>
  ) : (
    <Button
      size="sm"
      variant={state === "active" ? "default" : "outline"}
      className={state === "locked" ? "border-none bg-background-4" : undefined}
      disabled={state === "locked"}
      onClick={onAction}
    >
      {actionLabel}
    </Button>
  )

  return (
    <div className="h-full w-full rounded bg-background-1 p-4 md:w-80">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-owners-wide text-content-muted transition-opacity duration-300",
              dimmed && "opacity-50",
            )}
          >
            {title}
          </h3>
        </div>

        <p
          className={cn(
            "text-sm text-content-normal transition-opacity duration-300",
            dimmed && "opacity-50",
          )}
        >
          {description}
        </p>

        <div
          className={cn(
            "flex flex-col gap-2 transition-opacity duration-300 md:flex-row md:items-center",
            dimmed && "opacity-50",
          )}
        >
          {state === "locked" && disabledTooltip ? (
            <DisabledTooltip tooltip={disabledTooltip}>
              {action}
            </DisabledTooltip>
          ) : (
            action
          )}

          {state === "active" && onSkip && (
            <Button
              size="sm"
              variant="ghost"
              className="w-fit"
              onClick={onSkip}
            >
              Skip for now
            </Button>
          )}

          {state === "active" && onRefresh && (
            <Button
              size="sm"
              variant="ghost"
              className="w-fit"
              onClick={onRefresh}
            >
              <RotateCw className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// TODO(cazden) this has been duplicated a few times and probably deserves its own component
function DisabledTooltip({
  tooltip,
  children,
}: {
  tooltip: string
  children: React.ReactNode
}) {
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)

  const trigger = (
    <span
      tabIndex={0}
      className={cn(
        "block rounded-md transition-colors",
        open ? "bg-background-1" : "hover:bg-background-1",
      )}
    >
      {children}
    </span>
  )

  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
          {tooltip}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
