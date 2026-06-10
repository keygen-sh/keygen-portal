import { type ReactNode, useState } from "react"
import { Activity, BarChart3, Grid3X3, Lock } from "lucide-react"

import LockedOverlay from "@/components/locked-overlay"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useMobile } from "@/hooks/use-mobile"
import { useCloud } from "@/hooks/use-cloud"
import { useEdition } from "@/hooks/use-edition"
import { usePermissions } from "@/hooks/use-permissions"

import { useGetAccount, useGetAccountPlan } from "@/queries/accounts"
import { useRequestSparks, useValidationSparks } from "@/queries/analytics"

import { cn } from "@/lib/utils"
import ActivityChart from "./activity-chart"
import {
  ANALYTICS_RANGE_OPTIONS,
  AnalyticsRangeDays,
  HEATMAP_RANGE_OPTIONS,
  HeatmapRangeDays,
  PRICING_URL,
  REQUEST_METRICS,
  VALIDATION_METRICS,
  useAnalyticsRange,
  useLazyVisibility,
} from "@/lib/analytics"
import EventCharts from "./event-charts"
import GaugeCard from "./gauge-card"
import Leaderboards from "./leaderboards"
import LicenseExpirationHeatmap from "./license-expiration-heatmap"
import SectionHeader from "./section-header"

function UpgradeButton() {
  return (
    <Button size="sm" asChild>
      <a href={PRICING_URL} target="_blank" rel="noreferrer">
        View pricing
      </a>
    </Button>
  )
}

function AnalyticsPermissionPreview() {
  return (
    <LockedOverlay
      className="min-h-[720px]"
      icon={<Lock className="size-4" />}
      title="Analytics permission required"
      description="Ask an account admin for analytics read access to view this dashboard."
    >
      <AnalyticsSkeleton staticSkeletons />
    </LockedOverlay>
  )
}

function AnalyticsLockedSection({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string
  description: string
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <LockedOverlay
      className={className}
      icon={<Lock className="size-4" />}
      title={title}
      description={description}
      action={action}
    >
      {children}
    </LockedOverlay>
  )
}

function ActivityPreview() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {["Requests", "Validations"].map((title) => (
        <Card
          key={title}
          className="gap-0 rounded-md border-accent bg-background p-0"
        >
          <div className="border-b border-accent px-4 pt-3 pb-2">
            <StaticSkeleton className="h-4 w-24" />
          </div>
          <div className="p-4">
            <StaticSkeleton className="h-64 w-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function StaticSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("animate-none", className)} />
}

function EventChartsPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="gap-0 rounded-md border-accent bg-background p-0"
        >
          <div className="border-b border-accent px-4 pt-3 pb-2">
            <StaticSkeleton className="h-5 w-36" />
          </div>
          <div className="p-3">
            <StaticSkeleton className="h-36 w-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function LeaderboardsPreview() {
  return (
    <Card className="gap-0 rounded-md border-accent bg-background p-0">
      <div className="p-4">
        <StaticSkeleton className="h-80 w-full" />
      </div>
    </Card>
  )
}

function AnalyticsSkeleton({
  staticSkeletons = false,
}: {
  staticSkeletons?: boolean
}) {
  const Placeholder = staticSkeletons ? StaticSkeleton : Skeleton

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-md border-accent bg-background p-4"
          >
            <Placeholder className="mb-5 h-4 w-20" />
            <Placeholder className="h-8 w-24" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Placeholder className="h-72 rounded-md" />
        <Placeholder className="h-72 rounded-md" />
      </div>
      <Placeholder className="h-96 rounded-md" />
    </div>
  )
}

function AnalyticsContent({
  canUseGaugeSparks,
  canUseActivity,
  canUseEvents,
  canUseLeaderboards,
  upgradeRequired,
}: {
  canUseGaugeSparks: boolean
  canUseActivity: boolean
  canUseEvents: boolean
  canUseLeaderboards: boolean
  upgradeRequired: boolean
}) {
  const isMobile = useMobile()
  const [heatmapRangeDays, setHeatmapRangeDays] =
    useState<HeatmapRangeDays>(365)
  const [activityRangeSelection, setActivityRangeSelection] =
    useState<AnalyticsRangeDays | null>(null)
  const [eventRangeDays, setEventRangeDays] = useState<AnalyticsRangeDays>(30)
  const [leaderboardRangeDays, setLeaderboardRangeDays] =
    useState<AnalyticsRangeDays>(30)
  const defaultActivityRangeDays: AnalyticsRangeDays = isMobile ? 30 : 90
  const activityRangeDays = activityRangeSelection ?? defaultActivityRangeDays

  const heatmapVisibility = useLazyVisibility<HTMLElement>()
  const activityVisibility = useLazyVisibility<HTMLElement>()
  const eventVisibility = useLazyVisibility<HTMLElement>()
  const leaderboardVisibility = useLazyVisibility<HTMLElement>()

  const heatmapCanLoad = heatmapVisibility.hasEntered
  const activityCanLoad = canUseActivity && activityVisibility.hasEntered
  const eventCanLoad = canUseEvents && eventVisibility.hasEntered
  const leaderboardCanLoad =
    canUseLeaderboards && leaderboardVisibility.hasEntered

  const gaugeRange = useAnalyticsRange(30)
  const activityRange = useAnalyticsRange(activityRangeDays)
  const eventRange = useAnalyticsRange(eventRangeDays)
  const leaderboardRange = useAnalyticsRange(leaderboardRangeDays)
  const { data: requests = [], isLoading: requestsLoading } = useRequestSparks(
    activityRange,
    { enabled: activityCanLoad },
  )
  const { data: validations = [], isLoading: validationsLoading } =
    useValidationSparks(activityRange, { enabled: activityCanLoad })

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <GaugeCard
          title="ALUs"
          metric="alus"
          range={gaugeRange}
          enabled
          sparkEnabled={canUseGaugeSparks}
          tooltip="An Active Licensed User (ALU) is a user licensed to use your product, identified through a license or user object, with activity in the last 90 days."
        />
        <GaugeCard
          title="Users"
          metric="users"
          range={gaugeRange}
          enabled
          sparkEnabled={canUseGaugeSparks}
        />
        <GaugeCard
          title="Licenses"
          metric="licenses"
          range={gaugeRange}
          enabled
          sparkEnabled={canUseGaugeSparks}
        />
        <GaugeCard
          title="Machines"
          metric="machines"
          range={gaugeRange}
          enabled
          sparkEnabled={canUseGaugeSparks}
        />
      </div>

      <section ref={heatmapVisibility.ref} className="space-y-3">
        <SectionHeader
          title="Heatmaps"
          icon={Grid3X3}
          rangeDays={heatmapRangeDays}
          options={HEATMAP_RANGE_OPTIONS}
          onRangeChange={setHeatmapRangeDays}
        />
        <LicenseExpirationHeatmap
          enabled={heatmapCanLoad}
          rangeDays={heatmapRangeDays}
        />
      </section>

      <section ref={activityVisibility.ref} className="space-y-3">
        <SectionHeader
          title="Activity"
          icon={Activity}
          rangeDays={activityRangeDays}
          options={ANALYTICS_RANGE_OPTIONS}
          onRangeChange={setActivityRangeSelection}
        />
        {canUseActivity ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <ActivityChart
              title="Requests"
              data={requests}
              expectedMetrics={REQUEST_METRICS}
              range={activityRange}
              isLoading={!activityCanLoad || requestsLoading}
            />
            <ActivityChart
              title="Validations"
              data={validations}
              expectedMetrics={VALIDATION_METRICS}
              range={activityRange}
              isLoading={!activityCanLoad || validationsLoading}
            />
          </div>
        ) : (
          <AnalyticsLockedSection
            title="Activity analytics require ClickHouse"
            description="Request and validation activity charts depend on ClickHouse-backed analytics, which are not available in CE."
          >
            <ActivityPreview />
          </AnalyticsLockedSection>
        )}
      </section>

      <section ref={eventVisibility.ref} className="space-y-3">
        <SectionHeader
          title="Events"
          icon={Activity}
          rangeDays={eventRangeDays}
          options={ANALYTICS_RANGE_OPTIONS}
          onRangeChange={setEventRangeDays}
        />
        {canUseEvents ? (
          <EventCharts range={eventRange} enabled={eventCanLoad} />
        ) : (
          <AnalyticsLockedSection
            title={
              upgradeRequired
                ? "Event analytics require a paid plan"
                : "Event analytics require ClickHouse"
            }
            description={
              upgradeRequired
                ? "Upgrade your Cloud plan to unlock event analytics."
                : "Event analytics depend on ClickHouse, which is not available in CE."
            }
            action={upgradeRequired ? <UpgradeButton /> : null}
          >
            <EventChartsPreview />
          </AnalyticsLockedSection>
        )}
      </section>

      <section ref={leaderboardVisibility.ref} className="space-y-3">
        <SectionHeader
          title="Leaderboards"
          icon={BarChart3}
          rangeDays={leaderboardRangeDays}
          options={ANALYTICS_RANGE_OPTIONS}
          onRangeChange={setLeaderboardRangeDays}
        />
        {canUseLeaderboards ? (
          <Leaderboards range={leaderboardRange} enabled={leaderboardCanLoad} />
        ) : (
          <AnalyticsLockedSection
            title={
              upgradeRequired
                ? "Request leaderboards require a paid plan"
                : "Request leaderboards require ClickHouse"
            }
            description={
              upgradeRequired
                ? "Upgrade your Cloud plan to unlock request leaderboard aggregations."
                : "Request leaderboards depend on ClickHouse, which is not available in CE."
            }
            action={upgradeRequired ? <UpgradeButton /> : null}
          >
            <LeaderboardsPreview />
          </AnalyticsLockedSection>
        )}
      </section>
    </div>
  )
}

export default function Dashboard() {
  const { isCloud } = useCloud()
  const { isCE } = useEdition()
  const { can, isLoading: permissionsLoading } = usePermissions()
  const { data: account, isLoading: accountLoading } = useGetAccount()
  const planId = account?.relationships.plan?.data?.id
  const { data: plan, isLoading: planLoading } = useGetAccountPlan(
    isCloud ? planId : undefined,
  )

  const hasPermission = can("account.analytics.read")
  const isFreePlan =
    isCloud && (plan?.attributes.price == null || plan?.attributes.price === 0)
  const isChecking =
    permissionsLoading || accountLoading || (isCloud && planLoading)

  if (isChecking) {
    return <AnalyticsSkeleton />
  }

  if (!hasPermission) {
    return <AnalyticsPermissionPreview />
  }

  return (
    <AnalyticsContent
      canUseGaugeSparks={!isCE && !isFreePlan}
      canUseActivity={!isCE}
      canUseEvents={!isCE && !isFreePlan}
      canUseLeaderboards={!isCE && !isFreePlan}
      upgradeRequired={isFreePlan}
    />
  )
}
