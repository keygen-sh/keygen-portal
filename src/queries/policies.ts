import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

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
    enabled: !!policyId,
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

  return useMutation<Policy, APIError, Schemas.Policies.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.policies.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      const policy = response.data

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

  return useMutation<Policy, APIError, Schemas.Policies.UpdateValues>({
    mutationFn: (values) =>
      keygen.policies.get({ id: policyId }).then(async (response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        const current = response.data

        const changes = diff(
          current.attributes,
          values,
        ) as Schemas.Policies.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updateResponse = await keygen.policies.update({
          id: policyId,
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        return updateResponse.data
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

export function useAttachPolicyEntitlements() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    null,
    APIError,
    { policyId: string; entitlementIds: string[] }
  >({
    mutationFn: ({ policyId, entitlementIds }) =>
      keygen.policies.attachEntitlements({ policyId, entitlementIds }),

    onSuccess: async (_, { policyId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["policies", policyId, "entitlements", { environment: code }],
      })
      await queryClient.invalidateQueries({
        queryKey: ["policies", policyId, { environment: code }],
      })
    },
  })
}

export function useDetachPolicyEntitlements() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    null,
    APIError,
    { policyId: string; entitlementIds: string[] }
  >({
    mutationFn: ({ policyId, entitlementIds }) =>
      keygen.policies.detachEntitlements({ policyId, entitlementIds }),

    onSuccess: async (_, { policyId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["policies", policyId, "entitlements", { environment: code }],
      })
      await queryClient.invalidateQueries({
        queryKey: ["policies", policyId, { environment: code }],
      })
    },
  })
}
