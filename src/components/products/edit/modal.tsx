import { Dialog, DialogContent } from "@/components/ui/dialog"

import * as Forms from "@/forms"
import { Product } from "@/types/products"

import { useUpdateProduct } from "@/queries/products"

import { toast } from "@/lib/toast"
import EditForm from "./edit-form"

interface ProductsEditModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
}

export default function ProductsEditModal({
  open,
  onClose,
  product,
}: ProductsEditModalProps) {
  const updateProduct = useUpdateProduct(product?.id ?? "")

  const handleUpdateProduct = (values: Forms.Products.UpdatePayload) => {
    if (!product) return
    updateProduct.mutate(values, {
      onSuccess: () => {
        toast({ message: "Product updated", variant: "success" })
        onClose()
      },
      onError: () =>
        toast({ message: "Failed to update product", variant: "error" }),
      onSettled() {
        if (!updateProduct.isError) {
          onClose()
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-fit">
        <EditForm
          key={product?.id ?? "new"}
          product={product ?? null}
          loading={updateProduct.isPending}
          onSubmit={handleUpdateProduct}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
