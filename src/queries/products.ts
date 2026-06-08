import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"
import { Product } from "@/types/products"
import { APIError } from "@/types/api"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetProduct(productId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["products", productId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.products.get({ id: productId })

      if (!response.data) {
        throw new Error("Product not found")
      }

      return response.data
    },
    enabled: !!productId,
  })
}

export function useListProducts(
  params?: { cursor?: string | null; pageSize?: number },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["products", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.products.list(
        params ? { pageCursor: params.cursor, pageSize: params.pageSize } : {},
      )

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response
    },
    enabled: options?.enabled,
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Product, APIError, Schemas.Products.CreateValues>({
    mutationFn: (values) =>
      keygen.products.create({ values }).then((response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        return response.data
      }),

    onSuccess: async (newProduct) => {
      queryClient.setQueryData(
        ["products", newProduct.id, { environment: code }],
        newProduct,
      )
      await queryClient.invalidateQueries({
        queryKey: ["products", { environment: code }],
      })
    },
  })
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Product, APIError, Schemas.Products.UpdateValues>({
    mutationFn: (values) =>
      keygen.products.get({ id: productId }).then(async (response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        const current = response.data

        const changes = diff(
          current.attributes,
          values,
        ) as Schemas.Products.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updateResponse = await keygen.products.update({
          id: productId,
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        return updateResponse.data
      }),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["products", productId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["products", { environment: code }],
      })
    },
  })
}

export function useRemoveProduct(productId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.products.remove({ id: productId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["products", productId, { environment: code }],
      })
    },
  })
}
