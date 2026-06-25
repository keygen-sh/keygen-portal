import { useState, useMemo } from "react"

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

import { Check, ChevronsUpDown, Circle } from "lucide-react"

import { Environment } from "@/types/environments"

import { useListEnvironments } from "@/queries/environments"
import { useGetAccount } from "@/queries/accounts"
import { useEnvironment } from "@/hooks/use-environment"
import { useEdition } from "@/hooks/use-edition"

import * as Environments from "@/components/environments"

import { AccountLogo } from "@/components/sidebar/account-logo"

const GLOBAL_ENVIRONMENT = {
  id: "__global",
  code: null,
  name: "Global",
}

function CeCombobox(): React.ReactElement {
  const { data: account } = useGetAccount()

  return (
    <div className="flex h-9 items-center px-1">
      <AccountLogo name={account?.attributes.name} className="mr-2" />
      <div className="flex max-w-32 flex-col text-left text-content-loud">
        {account ? (
          <span className="truncate">{account.attributes.name}</span>
        ) : (
          <Skeleton className="h-4 w-20" />
        )}
      </div>
    </div>
  )
}

function EeCombobox(): React.ReactElement {
  const { code, select } = useEnvironment()

  const [openModal, setOpenModal] = useState(false)
  const [openPopover, setOpenPopover] = useState(false)
  const { data: environments = [], isLoading } = useListEnvironments()
  const { data: account } = useGetAccount()

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

  const resolvedEnvironmentId =
    environmentOptions.length === 0
      ? null
      : environmentOptions.some((e) => e.id === environmentId)
        ? environmentId
        : environmentOptions[0].id

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
    (e) => e.id === resolvedEnvironmentId,
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
          <Button variant="ghost" className="h-auto px-1.5 py-1">
            <AccountLogo name={account?.attributes.name} className="mr-2" />

            <div className="flex max-w-32 flex-col text-left text-content-loud">
              <div className="flex items-center gap-2">
                {account ? (
                  <span className="truncate">{account.attributes.name}</span>
                ) : (
                  <Skeleton className="h-4 w-20" />
                )}
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
                  const selected = environment.id === resolvedEnvironmentId

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

export default function SidebarCombobox(): React.ReactElement {
  const { isCE } = useEdition()
  return isCE ? <CeCombobox /> : <EeCombobox />
}
