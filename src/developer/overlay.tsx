import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import logo from "/logo.svg"

import { toast } from "@/lib/toast"
import { useListProducts, useCreateProduct } from "@/queries/products"

import { SampleProducts } from "@/mock/products"
import { SamplePolicies, MockPolicies } from "@/mock/policies"
import { SampleEntitlements, MockEntitlements } from "@/mock/entitlements"

import * as keygen from "@/keygen"

export default function DeveloperOverlay({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { data: _products = [], isFetching } = useListProducts()
  const create = useCreateProduct()
  const client = useQueryClient()

  const wipeProducts = useCallback(async () => {
    const products = (await keygen.products.list({})).data ?? []

    for (const product of products) {
      await keygen.products.remove({ id: product.id })
    }

    await client.invalidateQueries({ queryKey: ["products"] })
  }, [client])

  const wipeMocks = useCallback(() => {
    MockPolicies.length = 0
    MockEntitlements.length = 0
  }, [])

  const createProducts = useCallback(async () => {
    const productIds: Record<string, string> = {}

    for (const product of SampleProducts) {
      const created = await create.mutateAsync({
        name: product.attributes.name,
        code: product.attributes.code,
        distributionStrategy: product.attributes.distributionStrategy,
        url: product.attributes.url,
        platforms: product.attributes.platforms,
        metadata: product.attributes.metadata,
        permissions: product.attributes.permissions,
      })
      productIds[product.id] = created.id
    }

    return productIds
  }, [create])

  const rebuildPolicies = useCallback((productIds: Record<string, string>) => {
    for (const policy of SamplePolicies) {
      const relationship = policy.relationships.product?.data

      const productId = relationship ? productIds[relationship.id] : undefined

      const cloned = {
        ...policy,
        relationships: {
          ...policy.relationships,
          product: productId
            ? {
                ...policy.relationships.product,
                data: { type: "products" as const, id: productId },
              }
            : policy.relationships.product,
        },
      }

      MockPolicies.push(cloned)
    }
  }, [])

  const rebuildEntitlements = useCallback(() => {
    const policyIds = SamplePolicies.map((p) => p.id)
    for (const entitlement of SampleEntitlements) {
      const cloned = {
        ...entitlement,
        attributes: {
          ...entitlement.attributes,
          metadata: {
            ...entitlement.attributes.metadata,
            policyIds,
          },
        },
      }
      MockEntitlements.push(cloned)
    }
  }, [])

  const seedAll = useCallback(async () => {
    try {
      await wipeProducts()
      wipeMocks()

      const productIds = await createProducts()

      await client.invalidateQueries({ queryKey: ["products"] })

      rebuildPolicies(productIds)
      rebuildEntitlements()

      toast({ message: "Data successfully seeded", variant: "success" })
    } catch (error) {
      toast({ message: "Failed to seed data", variant: "error" })
    }
  }, [
    wipeProducts,
    wipeMocks,
    createProducts,
    rebuildPolicies,
    rebuildEntitlements,
    onClose,
  ])

  if (!open) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-end p-4">
      <div className="pointer-events-auto flex min-w-96 flex-col rounded-md border bg-background">
        <div className="flex items-center justify-between border-b border-accent p-2">
          <Label className="flex items-center gap-1 font-owners-text text-sm text-brand-secondary">
            <img src={logo} alt="Keygen Logo" className="mx-2 h-4" />
            <span className="text-xs">//</span>Developer Tools
          </Label>
          <Button
            onClick={onClose}
            variant="ghost"
            className="min-h-4 w-4 text-content-muted"
          >
            &times;
          </Button>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Label className="font-owners-text text-content-normal">
              Data Seeding
            </Label>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={seedAll} disabled={isFetching}>
              Seed All
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
