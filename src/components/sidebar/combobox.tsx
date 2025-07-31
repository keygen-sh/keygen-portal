import { useState, useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandList,
  CommandItem,
} from "@/components/ui/command"

import { Droplet, Check, ChevronsUpDown, Circle } from "lucide-react"

import { Environment } from "@/types/environments"

import { useListEnvironments } from "@/queries/environments"
import { useEnvironment } from "@/hooks/use-environment"

import * as Environments from "@/components/environments"

const GLOBAL_ENVIRONMENT = {
  id: "__global",
  code: null,
  name: "Global",
}

export default function SidebarCombobox(): React.ReactElement {
  const { code, select } = useEnvironment()

  const [openModal, setOpenModal] = useState(false)
  const [openPopover, setOpenPopover] = useState(false)
  const { data: environments = [], isLoading } = useListEnvironments()

  const environmentOptions = useMemo(() => {
    return [
      GLOBAL_ENVIRONMENT,
      ...environments.map((environment: Environment) => ({
        id: environment.id,
        code: environment.attributes.code,
        name: environment.attributes.name,
      })),
    ]
  }, [environments])

  const [environmentId, setEnvironmentId] = useState<string | null>(
    () =>
      environmentOptions.find((option) => option.code === code)?.id ??
      "__global",
  )

  useEffect(() => {
    if (environmentOptions.length === 0) {
      setEnvironmentId(null)
      return
    }

    if (
      !environmentId ||
      !environmentOptions.some((e) => e.id === environmentId)
    ) {
      setEnvironmentId(environmentOptions[0].id)
    }
  }, [environmentOptions, environmentId])

  const switchEnvironment = async (id: string, newCode: string | null) => {
    if (newCode === code) {
      setOpenPopover(false)
      return
    }
    await select(id === "__global" ? null : id, newCode)
    setEnvironmentId(id)

    setOpenPopover(false)
  }

  const currentEnvironment = environmentOptions.find(
    (e) => e.id === environmentId,
  )!

  if (isLoading || !currentEnvironment) {
    return (
      <div className="flex h-9 w-full items-center pr-4">
        <Skeleton className="h-7 w-full" />
      </div>
    )
  }

  return (
    <>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            aria-expanded={openPopover}
            size="default"
            className="!px-1 !py-0"
          >
            {/* TODO(cazden) Use company logo */}
            <Droplet className="mr-2 size-6 rounded-sm bg-content-loud p-1 text-background" />

            <div className="flex max-w-32 flex-col text-left text-content-loud">
              <div className="flex items-center gap-2">
                {/* TODO(cazden) Get company name */}
                <span className="truncate">Umbral</span>
                <ChevronsUpDown className="size-3 opacity-60" />
              </div>
              <span className="text-xs font-normal text-content-normal">
                {currentEnvironment.name}
              </span>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-48 p-0">
          <Command>
            <CommandList>
              <CommandGroup heading="Environments">
                {environmentOptions.map((environment) => {
                  const selected = environment.id === environmentId

                  return (
                    <CommandItem
                      key={environment.id}
                      value={environment.id}
                      onSelect={() =>
                        switchEnvironment(environment.id, environment.code)
                      }
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
              <div className="border-t border-accent">
                <CommandItem
                  onSelect={() => {
                    setOpenModal(true)
                    setOpenPopover(false)
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
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  )
}
