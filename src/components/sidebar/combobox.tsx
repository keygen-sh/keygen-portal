import { useState, useMemo, Fragment } from "react"
import { Check, ChevronsUpDown, Circle, LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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

type Env = { id: string; label: string }
type Prod = { id: string; name: string; icon: string | LucideIcon; envs: Env[] }

// Dummy
const products: Prod[] = [
  {
    id: "prd_001",
    name: "MDR Cloud",
    icon: Droplet,
    envs: [
      { id: "prd_001_dev", label: "Development" },
      { id: "prd_001_prod", label: "Production" },
    ],
  },
  {
    id: "prd_002",
    name: "Waffle Party Planner",
    icon: Droplet,
    envs: [
      { id: "prd_002_dev", label: "Development" },
      { id: "prd_002_stage", label: "Staging" },
      { id: "prd_002_prod", label: "Production" },
    ],
  },
]

/**
 * Renders a combobox that allows users to select a product and environment.
 */
export default function SidebarCombobox(): React.ReactElement {
  const [open, setOpen] = useState(false)

  const [productId, setProductId] = useState(products[0].id)
  const [envId, setEnvId] = useState(products[0].envs[0].id)

  const currentProduct = useMemo(
    () => products.find((p) => p.id === productId)!,
    [productId],
  )
  const currentEnvironment = currentProduct.envs.find((e) => e.id === envId)!

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          aria-expanded={open}
          size="default"
          className="!px-1 !py-0"
        >
          {typeof currentProduct.icon === "string" ? (
            <img src={currentProduct.icon} />
          ) : (
            <currentProduct.icon className="mr-2 size-6 rounded-sm bg-content-loud p-1 text-background" />
          )}
          <div className="flex max-w-32 flex-col text-left text-content-loud">
            <div className="flex items-center gap-2">
              <span className="truncate">{currentProduct.name}</span>
              <ChevronsUpDown className="size-3 opacity-60" />
            </div>
            <span className="text-xs font-normal text-content-normal">
              {currentEnvironment.label}
            </span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="mt-1 w-60 p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No match.</CommandEmpty>

            {products.map((prod) => (
              <Fragment key={prod.id}>
                <CommandGroup heading={prod.name}>
                  {prod.envs.map((env) => {
                    const selected = prod.id === productId && env.id === envId
                    return (
                      <CommandItem
                        key={env.id}
                        value={env.id}
                        onSelect={() => {
                          setProductId(prod.id)
                          setEnvId(env.id)
                          setOpen(false)
                        }}
                      >
                        {selected ? (
                          <Check className="mr-2 size-4" />
                        ) : (
                          <Circle className="mr-2 size-4 opacity-0" />
                        )}
                        {env.label}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
                <CommandSeparator />
              </Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
