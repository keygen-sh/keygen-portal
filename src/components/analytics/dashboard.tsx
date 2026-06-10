import { useState } from "react"
import { Activity, BarChart3, Grid3X3, Lock } from "lucide-react"

import LockedOverlay from "@/components/locked-overlay"
import * as Skeletons from "@/components/skeletons"
import { Button } from "@/components/ui/button"

import { useMobile } from "@/hooks/use-mobile"
import { useCloud } from "@/hooks/use-cloud"
import { useEdition } from "@/hooks/use-edition"
import { usePermissions } from "@/hooks/use-permissions"

import { useGetAccount, useGetAccountPlan } from "@/queries/accounts"
import {
  useRequestSparks,
  useResourceGauge,
  useValidationSparks,
} from "@/queries/analytics"

import ActivityChart from "./activity-chart"
import {
  SPARK_RANGE_OPTIONS,
  SparkRangeDays,
  HEATMAP_RANGE_OPTIONS,
  HeatmapRangeDays,
  LEADERBOARD_RANGE_OPTIONS,
  LeaderboardRangeDays,
  UPGRADE_URL,
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

const requestUsageFormatter = new Intl.NumberFormat()
const requestUsagePercentFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "percent",
})

function UpgradeButton() {
  return (
    <Button size="sm" asChild>
      <a href={UPGRADE_URL} target="_blank" rel="noreferrer">
        View pricing
      </a>
    </Button>
  )
}

function AnalyticsPermissionLockedOverlay() {
  return (
    <LockedOverlay
      className="min-h-[720px]"
      icon={<Lock className="size-4" />}
      title="Analytics permission required"
      description="Ask an account admin for analytics read access to view this dashboard."
    >
      <Skeletons.AnalyticsCharts.Dashboard static />
    </LockedOverlay>
  )
}

function AnalyticsUpgradeLockedOverlay({
  upgradeRequired,
}: {
  upgradeRequired: boolean
}) {
  const title = upgradeRequired
    ? "Analytics is a paid offering"
    : "Analytics is an EE offering"
  const description = upgradeRequired
    ? "View historical analytics across your account. Upgrade to a paid tier to unlock deeper insights."
    : "View historical analytics across your account. Upgrade to Keygen EE to unlock deeper insights."

  return (
    <LockedOverlay
      sticky
      icon={<Lock className="size-4" />}
      title={title}
      description={description}
      action={<UpgradeButton />}
    />
  )
}

function RequestUsageSummary({
  count,
  limit,
}: {
  count: number
  limit?: number | null
}) {
  const formattedCount = requestUsageFormatter.format(count)
  const hasLimit = limit != null && limit > 0
  const formattedLimit = hasLimit ? requestUsageFormatter.format(limit) : null
  const formattedPercent = hasLimit
    ? requestUsagePercentFormatter.format(count / limit)
    : null

  return (
    <span className="block text-right text-xs leading-snug font-normal text-content-subdued">
      You've made{" "}
      <span className="font-semibold text-content-muted">{formattedCount}</span>{" "}
      API requests today
      {hasLimit && (
        <>
          ,{" "}
          <span className="font-semibold text-content-muted">
            {formattedPercent}
          </span>{" "}
          of your daily limit of{" "}
          <span className="font-semibold text-content-muted">
            {formattedLimit}
          </span>
        </>
      )}
      .
    </span>
  )
}

function AnalyticsContent({
  canUseGaugeSparks,
  canUseActivity,
  canUseEvents,
  canUseLeaderboards,
  upgradeRequired,
  requestDailyLimit,
}: {
  canUseGaugeSparks: boolean
  canUseActivity: boolean
  canUseEvents: boolean
  canUseLeaderboards: boolean
  upgradeRequired: boolean
  requestDailyLimit?: number | null
}) {
  const isMobile = useMobile()
  const [heatmapRangeDays, setHeatmapRangeDays] =
    useState<HeatmapRangeDays>(365)
  const [activityRangeSelection, setActivityRangeSelection] =
    useState<SparkRangeDays | null>(null)
  const [eventRangeDays, setEventRangeDays] = useState<SparkRangeDays>(30)
  const [leaderboardRangeDays, setLeaderboardRangeDays] =
    useState<LeaderboardRangeDays>(30)
  const defaultActivityRangeDays: SparkRangeDays = isMobile ? 30 : 90
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
  const { data: requestGauge = [], isLoading: requestGaugeLoading } =
    useResourceGauge("requests", { enabled: activityCanLoad })
  const { data: validations = [], isLoading: validationsLoading } =
    useValidationSparks(activityRange, { enabled: activityCanLoad })
  const requestCountToday = requestGauge.reduce(
    (total, entry) => total + entry.count,
    0,
  )
  const showRequestUsage = activityCanLoad && !requestGaugeLoading
  const hasLockedAnalytics =
    !canUseActivity || !canUseEvents || !canUseLeaderboards
  const shouldShowAnalyticsUpgradeLockedOverlay =
    hasLockedAnalytics && activityVisibility.hasEntered

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

      <div className="relative">
        {shouldShowAnalyticsUpgradeLockedOverlay && (
          <AnalyticsUpgradeLockedOverlay upgradeRequired={upgradeRequired} />
        )}

        <div className="space-y-6">
          <section ref={activityVisibility.ref} className="space-y-3">
            <SectionHeader
              title="Activity"
              icon={Activity}
              rangeDays={activityRangeDays}
              options={SPARK_RANGE_OPTIONS}
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
                  action={
                    showRequestUsage ? (
                      <RequestUsageSummary
                        count={requestCountToday}
                        limit={requestDailyLimit}
                      />
                    ) : null
                  }
                  actionClassName="row-span-1 max-w-[min(30rem,58vw)] self-center"
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
              <Skeletons.AnalyticsCharts.Activity />
            )}
          </section>

          <section ref={eventVisibility.ref} className="space-y-3">
            <SectionHeader
              title="Events"
              icon={Activity}
              rangeDays={eventRangeDays}
              options={SPARK_RANGE_OPTIONS}
              onRangeChange={setEventRangeDays}
            />
            {canUseEvents ? (
              <EventCharts range={eventRange} enabled={eventCanLoad} />
            ) : (
              <Skeletons.AnalyticsCharts.Events />
            )}
          </section>

          <section ref={leaderboardVisibility.ref} className="space-y-3">
            <SectionHeader
              title="Leaderboards"
              icon={BarChart3}
              rangeDays={leaderboardRangeDays}
              options={LEADERBOARD_RANGE_OPTIONS}
              onRangeChange={setLeaderboardRangeDays}
            />
            {canUseLeaderboards ? (
              <Leaderboards
                range={leaderboardRange}
                enabled={leaderboardCanLoad}
              />
            ) : (
              <Skeletons.AnalyticsCharts.Leaderboards />
            )}
          </section>
        </div>
      </div>
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
  const isLoading =
    permissionsLoading || accountLoading || (isCloud && planLoading)

  if (isLoading) {
    return <Skeletons.AnalyticsCharts.Dashboard />
  }

  if (!hasPermission) {
    return <AnalyticsPermissionLockedOverlay />
  }

  return (
    <AnalyticsContent
      canUseGaugeSparks={!isCE && !isFreePlan}
      canUseActivity={!isCE}
      canUseEvents={!isCE && !isFreePlan}
      canUseLeaderboards={!isCE && !isFreePlan}
      upgradeRequired={isFreePlan}
      requestDailyLimit={isCloud ? plan?.attributes.maxReqs : null}
    />
  )
}
