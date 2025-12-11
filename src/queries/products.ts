import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Forms from "@/forms"
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
    retry: (failures, error) =>
      error.message !== "Product not found" && failures < 3,
  })
}

export function useListProducts() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["products", { environment: code }],
    queryFn: () =>
      keygen.products.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Product, APIError, Forms.Products.CreateValues>({
    mutationFn: (values) =>
      keygen.products
        .create({ values })
        .then((response) => response.data as Product),

    onSuccess: (newProduct) => {
      queryClient.setQueryData<Product[]>(
        ["products", { environment: code }],
        (old) => (old ? [newProduct, ...old] : [newProduct]),
      )
      queryClient.setQueryData(
        ["products", newProduct.id, { environment: code }],
        newProduct,
      )
    },
  })
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Product, APIError, Forms.Products.UpdateValues>({
    mutationFn: (values) =>
      keygen.products.get({ id: productId }).then(async (response) => {
        const current = response.data as Product

        const changes = diff(
          current.attributes,
          values,
        ) as Forms.Products.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updated = await keygen.products
          .update({ id: productId, values: changes })
          .then((response) => response.data as Product)

        return updated
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
