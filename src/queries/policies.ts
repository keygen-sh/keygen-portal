import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Forms from "@/forms"

import { APIError } from "@/types/api"
import { Policy } from "@/types/policies"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetPolicy(policyId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["policies", policyId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.policies.get({ id: policyId })

      if (!response.data) {
        throw new Error("Policy not found")
      }

      return response.data
    },
    retry: (failures, error) =>
      error.message !== "Policy not found" && failures < 3,
  })
}

export function useListPolicies() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["policies", { environment: code }],
    queryFn: () =>
      keygen.policies.list({}).then((response) => response.data ?? []),
  })
}

export function useCreatePolicy() {
  const queryClient = useQueryClient()

  return useMutation<Policy, APIError, Forms.Policies.CreatePayload>({
    mutationFn: async (values) => {
      const response = await keygen.policies.create(values)
      const policy = response.data as Policy

      const entitlementIds = values.entitlements?.attach ?? []
      if (entitlementIds.length > 0) {
        await keygen.policies.attachEntitlements({
          policyId: policy.id,
          entitlementIds,
        })
      }

      return policy
    },

    onSuccess: (newPolicy) => {
      queryClient.setQueryData<Policy[]>(["policies"], (old) =>
        old ? [newPolicy, ...old] : [newPolicy],
      )
      queryClient.setQueryData(["policy", newPolicy.id], newPolicy)
    },
  })
}

export function useUpdatePolicy(policyId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Policy, APIError, Forms.Policies.UpdatePayload>({
    mutationFn: (values) =>
      keygen.policies.get({ id: policyId }).then(async (response) => {
        const current = response.data as Policy

        const changes = diff(
          current.attributes,
          values,
        ) as Forms.Policies.UpdatePayload
        if (Object.keys(changes).length === 0) return current

        const updated = await keygen.policies
          .update({ id: policyId, ...changes })
          .then((response) => response.data as Policy)

        return updated
      }),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["policies", policyId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["policies", { environment: code }],
      })
    },
  })
}

export function useRemovePolicy(policyId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.policies.remove({ id: policyId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["policies", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["policies", policyId, { environment: code }],
      })
    },
  })
}

export function useListPolicyEntitlements(policyId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["policies", policyId, "entitlements", { environment: code }],
    queryFn: () =>
      keygen.policies
        .listEntitlements({ policyId })
        .then((response) => response.data ?? []),
    enabled: !!policyId,
  })
}

export function useAttachPolicyEntitlements(policyId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<null, APIError, string[]>({
    mutationFn: (entitlementIds) =>
      keygen.policies.attachEntitlements({ policyId, entitlementIds }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["policies", policyId, "entitlements", { environment: code }],
      })
      await queryClient.invalidateQueries({
        queryKey: ["policies", policyId, { environment: code }],
      })
    },
  })
}

export function useDetachPolicyEntitlements(policyId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<null, APIError, string[]>({
    mutationFn: (entitlementIds) =>
      keygen.policies.detachEntitlements({ policyId, entitlementIds }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["policies", policyId, "entitlements", { environment: code }],
      })
      await queryClient.invalidateQueries({
        queryKey: ["policies", policyId, { environment: code }],
      })
    },
  })
}
