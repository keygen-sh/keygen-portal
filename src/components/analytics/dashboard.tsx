import { useState } from "react"
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

function AnalyticsLockedPreview({
  reason,
}: {
  reason: "ce" | "free" | "permission"
}) {
  const title =
    reason === "ce"
      ? "Analytics is an EE offering"
      : reason === "free"
        ? "Analytics requires a paid plan"
        : "Analytics permission required"
  const description =
    reason === "ce"
      ? "Request, event, and validation analytics depend on EE request and event logs."
      : reason === "free"
        ? "Upgrade your Cloud plan to unlock account analytics, charts, and leaderboards."
        : "Ask an account admin for analytics read access to view this dashboard."

  return (
    <LockedOverlay
      className="min-h-[720px]"
      icon={<Lock className="size-4" />}
      title={title}
      description={description}
      action={
        reason === "permission" ? null : (
          <Button size="sm" asChild>
            <a href={PRICING_URL} target="_blank" rel="noreferrer">
              View pricing
            </a>
          </Button>
        )
      }
    >
      <AnalyticsSkeleton />
    </LockedOverlay>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-md border-accent bg-background p-4"
          >
            <Skeleton className="mb-5 h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-md" />
        <Skeleton className="h-72 rounded-md" />
      </div>
      <Skeleton className="h-96 rounded-md" />
    </div>
  )
}

function AnalyticsContent({ enabled }: { enabled: boolean }) {
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

  const heatmapCanLoad = enabled && heatmapVisibility.hasEntered
  const activityCanLoad = enabled && activityVisibility.hasEntered
  const eventCanLoad = enabled && eventVisibility.hasEntered
  const leaderboardCanLoad = enabled && leaderboardVisibility.hasEntered

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
          enabled={enabled}
          tooltip="An Active Licensed User (ALU) is a user licensed to use your product, identified through a license or user object, with activity in the last 90 days."
        />
        <GaugeCard
          title="Users"
          metric="users"
          range={gaugeRange}
          enabled={enabled}
        />
        <GaugeCard
          title="Licenses"
          metric="licenses"
          range={gaugeRange}
          enabled={enabled}
        />
        <GaugeCard
          title="Machines"
          metric="machines"
          range={gaugeRange}
          enabled={enabled}
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
      </section>

      <section ref={eventVisibility.ref} className="space-y-3">
        <SectionHeader
          title="Events"
          icon={Activity}
          rangeDays={eventRangeDays}
          options={ANALYTICS_RANGE_OPTIONS}
          onRangeChange={setEventRangeDays}
        />
        <EventCharts range={eventRange} enabled={eventCanLoad} />
      </section>

      <section ref={leaderboardVisibility.ref} className="space-y-3">
        <SectionHeader
          title="Leaderboards"
          icon={BarChart3}
          rangeDays={leaderboardRangeDays}
          options={ANALYTICS_RANGE_OPTIONS}
          onRangeChange={setLeaderboardRangeDays}
        />
        <Leaderboards range={leaderboardRange} enabled={leaderboardCanLoad} />
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
  const isFreePlan = isCloud && (plan?.attributes.price == null || plan?.attributes.price === 0)
  const isChecking =
    permissionsLoading || accountLoading || (isCloud && planLoading)

  if (isChecking) {
    return <AnalyticsSkeleton />
  }

  if (!hasPermission) {
    return <AnalyticsLockedPreview reason="permission" />
  }

  if (isCE) {
    return <AnalyticsLockedPreview reason="ce" />
  }

  if (isFreePlan) {
    return <AnalyticsLockedPreview reason="free" />
  }

  return <AnalyticsContent enabled />
}
