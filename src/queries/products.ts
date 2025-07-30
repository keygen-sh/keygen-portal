import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/products"
import { ErrorResponse } from "@/types/api"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useReadProduct(productId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["product", productId, code],
    queryFn: async () => {
      const response = await keygen.products.get({ id: productId })

      if (!response.data) {
        throw new Error("Product not found")
      }

      return response.data as Product
    },
    retry: (failures, error) =>
      error.message !== "Product not found" && failures < 3,
  })
}

export function useReadProducts() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["products", code],
    queryFn: () =>
      keygen.products.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation<Product, ErrorResponse, CreateProductPayload>({
    mutationFn: (payload) =>
      keygen.products
        .create(payload)
        .then((response) => response.data as Product),

    onSuccess: (newProduct) => {
      queryClient.setQueryData<Product[]>(["products"], (old) =>
        old ? [newProduct, ...old] : [newProduct],
      )

      queryClient.setQueryData(["product", newProduct.id], newProduct)
    },
  })
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient()

  return useMutation<Product, ErrorResponse, UpdateProductPayload>({
    mutationFn: (values) =>
      keygen.products.get({ id: productId }).then(async (response) => {
        const current = response.data as Product

        const changes = diff(current.attributes, values) as UpdateProductPayload
        if (Object.keys(changes).length === 0) return current

        const updated = await keygen.products
          .update({ id: productId, ...changes })
          .then((response) => response.data as Product)

        return updated
      }),

    onSuccess: (updated) => {
      queryClient.setQueryData(["product", productId], updated)
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useDeleteProduct(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => keygen.products.remove({ id: productId }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.removeQueries({ queryKey: ["product", productId] })
    },
  })
}
