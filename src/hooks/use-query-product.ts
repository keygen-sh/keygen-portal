import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { useEnvironment } from "@/hooks/use-environment"
import { Product } from "@/types/products"
import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useQueryProduct(productId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["product", productId, code],
    queryFn: () =>
      keygen.products
        .get({ id: productId })
        .then((response) => response.data as Product),
  })
}

export function useQueryProducts() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["products", code],
    queryFn: () =>
      keygen.products.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: any) =>
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

  return useMutation({
    mutationFn: (values: any) =>
      keygen.products.get({ id: productId }).then(async (response) => {
        const current = response.data as Product
        const changes = diff(current.attributes, values)

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
