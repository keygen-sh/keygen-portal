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
import { useGetCurrentUser } from "@/queries/users"
import { useEnvironment } from "@/hooks/use-environment"
import { useEdition } from "@/hooks/use-edition"

import * as keygen from "@/keygen"

import * as Auth from "@/components/auth"
import * as Environments from "@/components/environments"
import { Notice } from "@/components/notice"

import { AccountLogo } from "@/components/sidebar/account-logo"

interface EnvironmentOption {
  id: string
  code: string | null
  name: string
}

const GLOBAL_ENVIRONMENT: EnvironmentOption = {
  id: "__global",
  code: null,
  name: "Global",
}

function CeCombobox(): React.ReactElement {
  const { data: account } = useGetAccount()

  return (
    <div className="flex h-9 items-start px-1 pt-1">
      <AccountLogo name={account?.attributes.name} className="mr-2" />
      <div className="flex max-w-32 flex-col text-left text-sm text-content-loud">
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
  const { id: activeEnvironmentId, code, name, select } = useEnvironment()

  const [openModal, setOpenModal] = useState(false)
  const [openPopover, setOpenPopover] = useState(false)
  const [openReauthenticate, setOpenReauthenticate] = useState(false)
  const [pendingEnvironment, setPendingEnvironment] =
    useState<EnvironmentOption | null>(null)
  const { data: environments = [], isLoading } = useListEnvironments()
  const { data: account } = useGetAccount()
  const { data: me } = useGetCurrentUser()

  const scoped = keygen.rootEnvironment.get() != null
  const globalUser = me?.relationships.environment?.data === null
  const disabled = scoped && !globalUser

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

  const currentEnvironment =
    environmentOptions.find((option) => option.id === activeEnvironmentId) ??
    (activeEnvironmentId != null
      ? {
          id: activeEnvironmentId,
          code,
          name: name ?? code ?? activeEnvironmentId,
        }
      : GLOBAL_ENVIRONMENT)

  const selectEnvironment = async (option: EnvironmentOption) => {
    try {
      // only the global option has a null code
      await select(
        option.code == null
          ? null
          : { id: option.id, code: option.code, name: option.name },
      )
    } catch (error) {
      console.error(error)
    }
  }

  const switchEnvironment = async (option: EnvironmentOption) => {
    setOpenPopover(false)

    if (option.id === currentEnvironment.id) {
      return
    }

    if (scoped) {
      setPendingEnvironment(option)
      setOpenReauthenticate(true)
      return
    }

    await selectEnvironment(option)
  }

  if (isLoading) {
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
            className="h-auto px-1.5 py-1 disabled:opacity-100"
            disabled={disabled}
          >
            <AccountLogo name={account?.attributes.name} className="mr-2" />

            <div className="flex max-w-32 flex-col text-left text-content-loud">
              <div className="flex items-center gap-2">
                {account ? (
                  <span className="truncate">{account.attributes.name}</span>
                ) : (
                  <Skeleton className="h-4 w-20" />
                )}
                {!disabled && <ChevronsUpDown className="size-3 opacity-60" />}
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
                  const selected = environment.id === currentEnvironment.id

                  return (
                    <CommandItem
                      key={environment.id}
                      value={environment.id}
                      onSelect={() => switchEnvironment(environment)}
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
              {!scoped && (
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
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Environments.Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />

      {pendingEnvironment && (
        <Auth.Dialog.Reauthenticate
          open={openReauthenticate}
          onOpenChange={setOpenReauthenticate}
          environment={pendingEnvironment.code}
          description="Switch environment"
          notice={
            <Notice>
              <p>
                You're currently authenticated in the{" "}
                <strong>{currentEnvironment.name}</strong> environment. To
                switch to <strong>{pendingEnvironment.name}</strong>, re-enter
                your password.
              </p>
            </Notice>
          }
          onAuthenticated={async () => {
            await selectEnvironment(pendingEnvironment)
            setOpenReauthenticate(false)
          }}
        />
      )}
    </>
  )
}

export default function SidebarCombobox(): React.ReactElement {
  const { isCE } = useEdition()

  if (isCE) return <CeCombobox />
  return <EeCombobox />
}
