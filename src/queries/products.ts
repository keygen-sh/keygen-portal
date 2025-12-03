import {
  useQuery,
  useQueryClient,
  useMutation,
  skipToken,
} from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/products"
import { APIError } from "@/types/api"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetProduct(productId: string | undefined) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["products", productId, { environment: code }],
    queryFn: productId
      ? async () => {
          const response = await keygen.products.get({ id: productId })

          if (!response.data) {
            throw new Error("Product not found")
          }

          return response.data as Product
        }
      : skipToken,
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

  return useMutation<Product, APIError, CreateProductPayload>({
    mutationFn: (payload) =>
      keygen.products
        .create(payload)
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

  return useMutation<Product, APIError, UpdateProductPayload>({
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
      queryClient.setQueryData(
        ["products", productId, { environment: code }],
        updated,
      )
      queryClient.invalidateQueries({
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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["products", productId, { environment: code }],
      })
    },
  })
}
