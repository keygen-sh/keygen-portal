import { useState, useCallback } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import { Lock, Unlock, Award } from "lucide-react"

import {
  Product,
  DistributionStrategy,
  ProductDescription,
} from "@/types/products"
import type { EditFormValues } from "./edit-form"

import { useUpdateProduct } from "@/hooks/use-product"

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
  const [description, setDescription] = useState<ProductDescription>(
    ProductDescription.LICENSED_UPDATE,
  )

  const handleSubmit = (values: EditFormValues) => {
    if (!product) return
    updateProduct.mutate(values, {
      onSuccess: () => {
        toast({ message: "Product updated", variant: "success" })
        onClose()
      },
      onError: () =>
        toast({ message: "Failed to update product", variant: "error" }),
    })
  }

  const handleDescriptionChange = useCallback(
    (newDescription: ProductDescription) => {
      setDescription(newDescription)
    },
    [],
  )

  const renderDescription = useCallback(() => {
    const words = description.split(" ")
    const tags = words.filter((word) =>
      Object.values(DistributionStrategy).includes(
        word.toUpperCase() as DistributionStrategy,
      ),
    )

    return words.map((word, index) => {
      if (tags.includes(word as DistributionStrategy)) {
        const w = word.toUpperCase() as DistributionStrategy
        return (
          <Badge key={index} variant="secondary">
            {w === DistributionStrategy.LICENSED ? (
              <Award />
            ) : w === DistributionStrategy.OPEN ? (
              <Unlock />
            ) : (
              <Lock />
            )}
            {word}
          </Badge>
        )
      }
      return <span key={index}>{word}</span>
    })
  }, [description])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-fit">
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
            {renderDescription()}
          </DialogDescription>
          <DialogTitle>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Update product</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </DialogTitle>
        </DialogHeader>

        <EditForm
          key={product?.id ?? "new"}
          product={product ?? null}
          loading={updateProduct.isPending}
          onDescriptionChange={handleDescriptionChange}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
