import { useState, useCallback } from "react"

import {
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
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { Lock, Unlock, Award } from "lucide-react"

import * as Forms from "@/forms"
import {
  Product,
  DistributionStrategy,
  ProductErrorCode,
} from "@/types/products"

import { useCreateProduct } from "@/queries/products"
import { useSlide } from "@/hooks/use-slide"

import { toast } from "@/lib/toast"
import * as Motion from "@/components/motion"
import StrategyForm from "./strategy-form"
import AttributesForm from "./attributes-form"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"

interface ProductsCreateModalProps {
  onSelectProduct: (product: Product | null) => void
  onClose: () => void
}

export default function ProductsCreateModal({
  onSelectProduct,
  onClose,
}: ProductsCreateModalProps) {
  const createProduct = useCreateProduct()

  const [step, direction, goTo] = useSlide([0, 1])

  const [distributionStrategy, setDistributionStrategy] =
    useState<DistributionStrategy>(DistributionStrategy.Licensed)

  const [formError, setFormError] = useState<string | null>(null)

  const handleCreateProduct = useCallback(
    (values: Forms.Products.CreatePayload) => {
      if (!values.name || !distributionStrategy) {
        toast({
          message: "Failed to create product",
          description: "Missing required fields.",
          variant: "error",
        })
        return
      }

      const { permissions, ...rest } = values

      const payload = {
        ...(permissions && permissions.length ? { permissions } : {}),
        distributionStrategy,
        ...rest,
      }

      createProduct.mutate(payload, {
        onSuccess: (product) => {
          toast({ message: "Product created", variant: "success" })
          onSelectProduct(product)
          onClose()
        },
        onError: (error) => {
          if (
            typeof error === "object" &&
            error &&
            "code" in error &&
            error.code === ProductErrorCode.CodeTaken
          ) {
            setFormError("Code already exists")
          }
          toast({ message: "Failed to create product", variant: "error" })
        },
      })
    },
    [distributionStrategy, createProduct, onSelectProduct, onClose],
  )

  const handleStrategyChange = useCallback(
    (newStrategy: DistributionStrategy) => {
      setDistributionStrategy(newStrategy)
    },
    [],
  )

  return (
    <DialogContent className="md:min-w-4xl">
      <DialogHeader className="h-fit border-b border-accent p-2">
        <DialogDescription className="flex h-5 items-center text-xs">
          <BadgeGroup prefix="Creating a new" suffix="product">
            {distributionStrategy === DistributionStrategy.Licensed && (
              <BadgeGroupItem>
                <Award />
                Licensed
              </BadgeGroupItem>
            )}
            {distributionStrategy === DistributionStrategy.Open && (
              <BadgeGroupItem>
                <Unlock />
                Open
              </BadgeGroupItem>
            )}
            {distributionStrategy === DistributionStrategy.Closed && (
              <BadgeGroupItem>
                <Lock />
                Closed
              </BadgeGroupItem>
            )}
          </BadgeGroup>
        </DialogDescription>
        <DialogTitle>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {step === 0 ? (
                  <BreadcrumbPage>Distribution strategy</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink onClick={() => goTo(0)}>
                    Distribution strategy
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {step === 1 ? (
                  <BreadcrumbPage>Attributes</BreadcrumbPage>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    Attributes
                  </span>
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </DialogTitle>
      </DialogHeader>
      <Motion.Slide direction={direction}>
        {step === 0 ? (
          <StrategyForm
            key="strategy"
            distributionStrategy={distributionStrategy}
            onStrategyChange={handleStrategyChange}
            onSubmit={() => goTo(1)}
            onCancel={onClose}
          />
        ) : (
          <AttributesForm
            key="attributes"
            loading={createProduct.isPending}
            error={formError}
            onSubmit={handleCreateProduct}
            onCancel={onClose}
          />
        )}
      </Motion.Slide>
    </DialogContent>
  )
}
