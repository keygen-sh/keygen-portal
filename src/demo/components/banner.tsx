import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { ChevronRight, EllipsisVertical, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import * as fathom from "@/fathom"

import { toast } from "@/lib/toast"
import { PRICING_URL } from "@/lib/url"

import { onDemoEngagement, recordDemoSection } from "@/demo/engagement"
import { resetMockData } from "@/demo"

type BannerMode = "info" | "cta"

const OFFSET = "1.75rem"

let mode: BannerMode = "info"

export default function DemoBanner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState<BannerMode>(() => mode)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    const root = document.documentElement

    root.style.setProperty("--demo-offset", OFFSET)

    return () => {
      root.style.removeProperty("--demo-offset")
    }
  }, [])

  useEffect(() => {
    recordDemoSection(router.state.location.pathname)

    return router.subscribe("onResolved", ({ toLocation }) => {
      recordDemoSection(toLocation.pathname)
    })
  }, [router])

  useEffect(() => {
    return onDemoEngagement(() => {
      mode = "cta"
      setMessage("cta")

      fathom.track("engaged")
    })
  }, [])

  async function reset(): Promise<void> {
    setWorking(true)

    try {
      resetMockData()
      queryClient.removeQueries({ type: "inactive" })
      await Promise.all([queryClient.invalidateQueries(), router.invalidate()])

      fathom.track("data reset")
      toast({ message: "Demo records reset", variant: "success" })
    } catch (error) {
      console.error(error)
      toast({ message: "Demo reset failed", variant: "error" })
    } finally {
      setWorking(false)
    }
  }

  return (
    <motion.aside
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 flex h-(--demo-offset) items-center justify-center gap-2 bg-primary px-10 text-white dark:text-background"
    >
      <p className="text-center text-xs font-semibold">
        {message === "cta"
          ? "Enjoying the demo? Keygen is free to start."
          : "You are exploring a demo. Ready to start using Keygen?"}
      </p>
      <a
        href={PRICING_URL}
        target="_blank"
        rel="noreferrer"
        onClick={() => fathom.track(`cta clicked (${message})`)}
        className="group flex items-center gap-1 text-xs font-semibold underline underline-offset-2"
      >
        Create an account
        <ChevronRight className="size-3 transition-transform group-hover:translate-x-2" />
      </a>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 size-6 text-white hover:bg-black/10 hover:text-white dark:text-background dark:hover:text-background"
          >
            <EllipsisVertical className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={reset} disabled={working}>
            <RotateCcw />
            Reset demo data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.aside>
  )
}
