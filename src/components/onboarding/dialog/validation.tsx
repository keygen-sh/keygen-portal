import { useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ExternalLink } from "lucide-react"

import { APIError } from "@/types/api"
import { License, LicenseValidation } from "@/types/licenses"

import { useValidateLicenseKey } from "@/queries/licenses"

import { useEnvironment } from "@/hooks/use-environment"

import * as keygen from "@/keygen"

import { cn } from "@/lib/utils"
import { DOCS_URL, DOCS_API_URL } from "@/lib/url"

import * as Motion from "@/components/motion"
import { Notice } from "@/components/notice"
import Terminal, { type TerminalHandle } from "@/components/terminal"
import GoToButton from "@/components/go-to-button"
import ClipboardCommand from "@/components/clipboard-command"

const VALIDATE_DELAY_MS = 5000

interface ValidationDialogProps {
  license: License
  open: boolean
  onOpenChange: (open: boolean) => void
  externalResult?: "succeeded" | "failed" | null
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`
}

function buildCurl(key: string, environment: string | null): string {
  const url = `https://${keygen.config.host}/v1/accounts/${keygen.config.id}/licenses/actions/validate-key`

  const lines = [
    `curl -X POST ${shellQuote(url)} \\`,
    `  -H 'Content-Type: application/vnd.api+json' \\`,
    `  -H 'Accept: application/vnd.api+json' \\`,
    `  -H ${shellQuote(`Keygen-Version: ${keygen.config.version}`)} \\`,
  ]

  if (environment) {
    lines.push(`  -H ${shellQuote(`Keygen-Environment: ${environment}`)} \\`)
  }

  lines.push(`  -d ${shellQuote(JSON.stringify({ meta: { key } }))}`)

  return lines.join("\n")
}

export default function ValidationDialog({
  license,
  open,
  onOpenChange,
  externalResult,
}: ValidationDialogProps): React.ReactElement {
  const { code } = useEnvironment()
  const validateKey = useValidateLicenseKey()

  const [validation, setValidation] = useState<LicenseValidation | null>(null)
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle")

  const openRef = useRef(open)
  const autoRanRef = useRef(false)
  const terminalRef = useRef<TerminalHandle>(null)

  useEffect(() => {
    openRef.current = open
  }, [open])

  const key = license.attributes.key
  const command = buildCurl(key, code)

  const externalValidation =
    externalResult != null || license.attributes.lastValidated != null

  const performValidation = useCallback(
    async (validationKey: string, delayMs: number): Promise<string> => {
      setValidation(null)
      setPhase("running")

      try {
        const [result] = await Promise.all([
          validateKey.mutateAsync({ key: validationKey }),
          new Promise((resolve) => setTimeout(resolve, delayMs)),
        ])

        if (openRef.current) {
          setValidation(result)
        }

        return JSON.stringify(
          { data: result.license, meta: result.meta },
          null,
          2,
        )
      } catch (error) {
        console.error(error)

        return error instanceof APIError
          ? `error: we couldn't reach the API -- ${error.detail ?? error.title}`
          : "error: we couldn't reach the API"
      } finally {
        if (openRef.current) {
          setPhase("done")
        }
      }
    },
    [validateKey],
  )

  const handleCommand = useCallback(
    (input: string): string | Promise<string> => {
      if (input.includes("halo")) {
        return "keygen: I think Halo is a pretty cool guy. Eh kills aleins and doesnt afraid of anything."
      }

      if (!input.includes("validate-key")) {
        return "keygen: command not found"
      }

      const pastedKey = input.match(/"key"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1]

      return performValidation(pastedKey || key, VALIDATE_DELAY_MS)
    },
    [performValidation, key],
  )

  const handleOpenChange = useCallback(
    (value: boolean) => {
      onOpenChange(value)

      if (!value) {
        setValidation(null)
        setPhase("idle")
        autoRanRef.current = false
      }
    },
    [onOpenChange],
  )

  useEffect(() => {
    if (
      !open ||
      autoRanRef.current ||
      phase !== "idle" ||
      !externalValidation
    ) {
      return
    }

    autoRanRef.current = true
    void performValidation(key, 0).then((output) => {
      terminalRef.current?.print(output)
    })
  }, [open, phase, externalValidation, key, performValidation])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex w-full flex-col overflow-hidden p-0 focus:outline-none md:min-w-4xl">
        <DialogHeader className="flex items-start border-b border-accent p-4 pt-3">
          <DialogTitle className="text-base">Validate your license</DialogTitle>
          <DialogDescription className="sr-only" />
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="flex flex-col p-4">
            <div
              className={cn(
                "overflow-hidden transition-[max-height] delay-200 duration-500",
                phase === "idle" ? "max-h-[32rem]" : "max-h-0",
              )}
            >
              <div
                className={cn(
                  "flex flex-col gap-4 transition-opacity duration-300",
                  phase !== "idle" && "opacity-0",
                )}
              >
                <Notice className="w-fit">
                  <Notice.Title>
                    Validate your license key against the Keygen API
                  </Notice.Title>
                  <Notice.Description>
                    Copy the snippet below and run it from your own terminal, or
                    paste it into the terminal at the bottom and press Enter to
                    run it right here.
                  </Notice.Description>
                </Notice>

                <ClipboardCommand command={command} className="mb-4" />
              </div>
            </div>

            <Terminal
              ref={terminalRef}
              onCommand={handleCommand}
              placeholder="# paste the command above and press Enter to run it"
            />

            {phase === "done" && validation?.meta.valid && (
              <Motion.Rise duration={0.3}>
                <Notice className="mt-4 w-fit">
                  <Notice.Title>
                    Congratulations — you've completed the Quickstart!
                  </Notice.Title>
                  <Notice.Description>
                    <span className="mt-1 block">
                      Your license is valid and ready. Explore the resources
                      you've created, or dive deeper into Keygen.
                    </span>
                    <div className="flex items-center gap-8">
                      <ul className="mt-2 list-disc gap-1 text-sm text-content-normal">
                        <li className="w-fit">
                          <GoToButton
                            path="/$accountId/app/products"
                            params={{ accountId: keygen.config.id }}
                            label="View Products"
                            buttonClassName="text-xs"
                          />
                        </li>
                        <li className="w-fit">
                          <GoToButton
                            path="/$accountId/app/policies"
                            params={{ accountId: keygen.config.id }}
                            label="View Policies"
                            buttonClassName="text-xs"
                          />
                        </li>
                        <li className="w-fit">
                          <GoToButton
                            path="/$accountId/app/licenses"
                            params={{ accountId: keygen.config.id }}
                            label="View Licenses"
                            buttonClassName="text-xs"
                          />
                        </li>
                      </ul>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-none bg-background-2"
                          asChild
                        >
                          <a href={DOCS_URL} target="_blank" rel="noreferrer">
                            Open documentation
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-none bg-background-2"
                          asChild
                        >
                          <a
                            href={DOCS_API_URL}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open API reference
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </Notice.Description>
                </Notice>
              </Motion.Rise>
            )}

            {phase === "done" && validation && !validation.meta.valid && (
              <Motion.Rise duration={0.3}>
                <Notice variant="warning" className="max-w-3xl">
                  <Notice.Title>The license didn't validate.</Notice.Title>
                  <Notice.Description>
                    The API returned {validation.meta.code}; the license{" "}
                    {validation.meta.detail}. Adjust your policy or license,
                    then paste the command again to re-run the validation.
                  </Notice.Description>
                </Notice>
              </Motion.Rise>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-4 border-t border-accent p-4">
          <Button onClick={() => handleOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
