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
import { EditFormValues } from "./edit-form"

import * as keygen from "@/keygen"
import { toast } from "@/lib/toast"
import { diff } from "@/lib/utils"
import EditForm from "./edit-form"

interface ProductsEditModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
  setProduct: (product: Product | null) => void
}

export default function ProductsEditModal({
  open,
  onClose,
  product,
  setProduct,
}: ProductsEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState<ProductDescription>(
    ProductDescription.LICENSED_UPDATE,
  )

  const handleEditProduct = useCallback(
    async (values: EditFormValues) => {
      if (!product) return

      setLoading(true)

      try {
        const changes = diff(product.attributes, {
          ...values,
          permissions:
            values.permissions && values.permissions.length
              ? values.permissions
              : [],
        })

        // Bail if no changes were made
        if (!Object.keys(changes).length) {
          onClose()
          return
        }
        const payload = { id: product.id, ...changes }

        const response = await keygen.products.update(payload)

        if (response.errors) {
          const error = response.errors[0]
          throw new Error(error.code)
        }

        const updatedProduct = response.data as Product

        toast({ message: "Product updated", variant: "success" })
        setProduct(updatedProduct)
        onClose()
      } catch (error) {
        console.error(error)
        toast({ message: "Failed to update product", variant: "error" })
      } finally {
        setLoading(false)
      }
    },
    [product],
  )

  const handleCancelEdit = useCallback(() => {
    onClose()
  }, [])

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
          loading={loading}
          onDescriptionChange={handleDescriptionChange}
          onSubmit={handleEditProduct}
          onCancel={handleCancelEdit}
        />
      </DialogContent>
    </Dialog>
  )
}
