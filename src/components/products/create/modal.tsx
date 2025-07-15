import { useState, useCallback } from "react"

import { Badge } from "@/components/ui/badge"
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

import { useSlide } from "@/hooks/use-slide"

import {
  Product,
  ProductMode,
  DistributionStrategy,
  ProductDescription,
} from "@/types/products"
import { AttributesFormValues } from "./attributes-form"

import { toast } from "@/lib/toast"
import * as Motion from "@/components/motion"
import StrategyForm from "./strategy-form"
import AttributesForm from "./attributes-form"

interface ProductsCreateModalProps {
  onSelectProduct: (env: Product | null) => void
  onChangeMode: (mode: ProductMode, env?: Product) => void
}

export default function ProductsCreateModal({
  onSelectProduct,
  onChangeMode,
}: ProductsCreateModalProps) {
  const [step, direction, goTo] = useSlide([0, 1])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [distributionStrategy, setDistributionStrategy] =
    useState<DistributionStrategy>(DistributionStrategy.LICENSED)

  const [description, setDescription] = useState<ProductDescription>(
    ProductDescription.OPEN,
  )

  const handleCreateProduct = useCallback(
    async (values: AttributesFormValues) => {
      if (!values.name || !distributionStrategy) {
        toast({
          message: "Failed to create product",
          description: "Missing required fields.",
          variant: "error",
        })
        return
      }

      setLoading(true)
      setTimeout(() => {
        toast({ message: "Product created", variant: "success" })
        onChangeMode(ProductMode.VIEW)
        setLoading(false)
      }, 1000)
    },
    [onSelectProduct, onChangeMode],
  )

  const handleCancelCreate = useCallback(() => {
    onChangeMode(ProductMode.VIEW)
  }, [onChangeMode])

  const handleStrategyChange = useCallback(
    (newStrategy: DistributionStrategy) => {
      setDistributionStrategy(newStrategy)
    },
    [],
  )

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
    <DialogContent className="md:min-w-4xl">
      <DialogHeader className="h-fit border-b border-accent p-2">
        <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
          {renderDescription()}
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
            onDescriptionChange={handleDescriptionChange}
            onSubmit={() => goTo(1)}
            onCancel={handleCancelCreate}
          />
        ) : (
          <AttributesForm
            key="attributes"
            loading={loading}
            error={error}
            onSubmit={handleCreateProduct}
            onCancel={handleCancelCreate}
          />
        )}
      </Motion.Slide>
    </DialogContent>
  )
}
