import { useState } from "react"
import { Activity, BarChart3, Grid3X3, Lock } from "lucide-react"

import LockedOverlay from "@/components/locked-overlay"
import * as Skeletons from "@/components/skeletons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
      <Skeletons.AnalyticsCharts.Dashboard staticSkeletons />
    </LockedOverlay>
  )
}

function AnalyticsLockedCallout({
  upgradeRequired,
}: {
  upgradeRequired: boolean
}) {
  const title = upgradeRequired
    ? "Analytics is a paid offering"
    : "Analytics is an EE offering"
  const description = upgradeRequired
    ? "View historical analytics across your account. Upgrade to a paid tier to unlock analytics."
    : "View historical analytics across your account. Upgrade to Keygen EE to unlock analytics."

  return (
    <div className="pointer-events-none sticky top-[calc(100dvh-9.5rem)] z-20 -mb-32 flex justify-center bg-gradient-to-t from-background via-background/90 to-transparent px-4 pt-20 pb-4">
      <Card className="pointer-events-auto w-full max-w-sm items-start gap-4 rounded border-none p-4 text-left shadow-sm">
        <CardHeader className="w-full px-0">
          <CardTitle className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-content-muted">
              <Lock className="size-4" />
            </span>
            {title}
          </CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardFooter className="w-full px-0">
          <UpgradeButton />
        </CardFooter>
      </Card>
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
  const hasLockedAnalytics =
    !canUseActivity || !canUseEvents || !canUseLeaderboards

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
        {hasLockedAnalytics && (
          <AnalyticsLockedCallout upgradeRequired={upgradeRequired} />
        )}

        <div className="space-y-6">
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
              <Skeletons.AnalyticsCharts.Activity />
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
              <Skeletons.AnalyticsCharts.Events />
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
  const isChecking =
    permissionsLoading || accountLoading || (isCloud && planLoading)

  if (isChecking) {
    return <Skeletons.AnalyticsCharts.Dashboard />
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
