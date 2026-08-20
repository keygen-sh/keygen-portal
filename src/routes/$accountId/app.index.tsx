import { createFileRoute, redirect } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import { currentUserQueryOptions } from "@/queries/users"

import { resolvePermissions } from "@/lib/permissions"

import * as keygen from "@/keygen"

const NEW_USER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// redirect new users to the learn page if they have the required permissions and no licenses
async function shouldLandOnLearn(queryClient: QueryClient): Promise<boolean> {
  const me = await queryClient
    .ensureQueryData(currentUserQueryOptions())
    .catch(() => null)
  if (!me) {
    return false
  }

  const isNewUser =
    Date.now() - new Date(me.attributes.created).getTime() < NEW_USER_WINDOW_MS
  if (!isNewUser) {
    return false
  }

  const permissions = resolvePermissions(
    me.attributes.permissions,
    me.attributes.role,
  )

  const canQuickstart =
    permissions.has("product.create") &&
    permissions.has("product.read") &&
    permissions.has("policy.create") &&
    permissions.has("policy.read") &&
    permissions.has("license.create") &&
    permissions.has("license.read")
  if (!canQuickstart) {
    return false
  }

  try {
    const response = await keygen.licenses.list({
      pageSize: 1,
      environment: null,
    })
    if (response.errors) {
      return false
    }

    return response.data.length === 0
  } catch {
    return false
  }
}

export const Route = createFileRoute("/$accountId/app/")({
  beforeLoad: async ({ context, params }) => {
    const learn = await shouldLandOnLearn(context.queryClient)

    redirect({
      to: learn ? "/$accountId/app/learn" : "/$accountId/app/dashboard",
      params: { accountId: params.accountId },
      replace: true,
      throw: true,
    })
  },
  component: () => null,
})
