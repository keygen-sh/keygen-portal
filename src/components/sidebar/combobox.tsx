import { useState, useEffect, useMemo, Fragment } from "react"
import { Check, ChevronsUpDown, Circle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandSeparator,
  CommandEmpty,
} from "@/components/ui/command"

import { Droplet } from "lucide-react"

import { Product } from "@/types/products"
import { Environment } from "@/types/environments"

import { useProducts } from "@/hooks/use-product"
import { useEnvironments } from "@/hooks/use-environment"

import * as Environments from "@/components/environments"

export default function SidebarCombobox(): React.ReactElement {
  const [showEnvironmentsModal, setShowEnvironmentsModal] = useState(false)
  const [open, setOpen] = useState(false)
  const { data: products = [], isLoading: productsLoading } = useProducts()
  const { data: environments = [], isLoading: environmentsLoading } =
    useEnvironments()

  const productOptions = useMemo(() => {
    return products.map((product: Product) => ({
      id: product.id,
      name: product.attributes.name,
    }))
  }, [products])

  const environmentOptions = useMemo(() => {
    return environments.map((env: Environment) => ({
      id: env.id,
      code: env.attributes.code,
      name: env.attributes.name,
    }))
  }, [environments])

  const [productId, setProductId] = useState<string | null>(null)
  const [environmentId, setEnvironmentId] = useState<string | null>(null)

  useEffect(() => {
    if (!productId && productOptions.length) setProductId(productOptions[0].id)
  }, [productOptions, productId])

  useEffect(() => {
    if (!environmentId && environmentOptions.length)
      setEnvironmentId(environmentOptions[0].id)
  }, [environmentOptions, environmentId])

  const currentProduct = productOptions.find((p) => p.id === productId)!
  const currentEnvironment = environmentOptions.find(
    (e) => e.id === environmentId,
  )!

  if (productsLoading || environmentsLoading || !productId || !environmentId) {
    return (
      <div className="flex h-9 w-full items-center pr-4">
        <Skeleton className="h-7 w-full" />
      </div>
    )
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            aria-expanded={open}
            size="default"
            className="!px-1 !py-0"
          >
            {/* TODO(cazden) Use company logo */}
            <Droplet className="mr-2 size-6 rounded-sm bg-content-loud p-1 text-background" />

            <div className="flex max-w-32 flex-col text-left text-content-loud">
              <div className="flex items-center gap-2">
                <span className="truncate">{currentProduct.name}</span>
                <ChevronsUpDown className="size-3 opacity-60" />
              </div>
              <span className="text-xs font-normal text-content-normal">
                {currentEnvironment.name}
              </span>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="mt-1 w-60 p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <ScrollArea className="h-64">
                <CommandEmpty>No match.</CommandEmpty>

                {productOptions.map((product) => (
                  <Fragment key={product.id}>
                    <CommandGroup heading={product.name}>
                      {environmentOptions.map((environment) => {
                        const selected =
                          product.id === productId &&
                          environment.id === environmentId
                        return (
                          <CommandItem
                            key={`${product.id}:${environment.id}`}
                            value={`${product.id}:${environment.id}`}
                            onSelect={() => {
                              setProductId(product.id)
                              setEnvironmentId(environment.id)
                              setOpen(false)
                            }}
                          >
                            {selected ? (
                              <Check className="mr-2 size-4" />
                            ) : (
                              <Circle className="mr-2 size-4 opacity-0" />
                            )}
                            {environment.name}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                    {product.id !==
                      productOptions[productOptions.length - 1].id && (
                      <CommandSeparator />
                    )}
                  </Fragment>
                ))}
              </ScrollArea>
              <div className="border-t border-accent">
                <CommandItem
                  onSelect={() => {
                    setShowEnvironmentsModal(true)
                    setOpen(false)
                  }}
                  className="m-1 text-content-normal"
                >
                  Manage Environments
                </CommandItem>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Environments.Modal
        open={showEnvironmentsModal}
        onClose={() => setShowEnvironmentsModal(false)}
      />
    </>
  )
}
