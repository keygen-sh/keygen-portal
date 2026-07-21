import { useEffect, useState, useMemo } from "react"
import { useMatches } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"

import { RecentUser, getRecentUser } from "@/lib/users"
import { HeroVariant, heroVariantFromRouteId } from "@/lib/hero"

import * as keygen from "@/keygen"

import * as Mock from "@/components/mock"
import Testimonial from "@/components/testimonial"

interface HeroContent {
  headline: string | ((user: RecentUser | null) => string)
  subtitle?: string | React.ReactNode
  testimonials?: boolean
}

const CONTENT: Record<HeroVariant, HeroContent> = {
  login: {
    headline: (user) => {
      const greeting =
        new Date().getHours() < 9 ? "Good morning" : "Welcome back"

      return user ? `${greeting}, ${user.firstName}` : greeting
    },
    subtitle: "Let's get back to licensing with Keygen.",
  },
  register: {
    headline: "Ship licensing today",
    subtitle: "Join the teams building fast, flexible licensing with Keygen.",
    testimonials: true,
  },
  reset: {
    headline: "Let's get you back in",
    subtitle: keygen.config.supportEmail ? (
      <span>
        Still having issues? Reach out to{" "}
        <Button
          size="link"
          variant="link"
          onClick={() => {
            window.location.href = `mailto:${keygen.config.supportEmail}`
          }}
          className="pointer-events-auto font-normal"
        >
          {keygen.config.supportEmail}
        </Button>
        .
      </span>
    ) : undefined,
  },
}

let hasEntered = false

export default function AuthHero() {
  const matches = useMatches()
  const currentRoute = matches[matches.length - 1]
  const variant = heroVariantFromRouteId(currentRoute?.routeId ?? "")
  const content = CONTENT[variant]
  const reduced = useReducedMotion()
  const user = useMemo(getRecentUser, [])

  const headline =
    typeof content.headline === "function"
      ? content.headline(user)
      : content.headline

  // prevent replaying entrance animation on auth navigations
  const [entering] = useState(() => !hasEntered)
  useEffect(() => {
    hasEntered = true
  }, [])
  const animateIn = entering && !reduced

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 z-10">
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center pr-8 pl-16">
          <AnimatePresence mode="wait" initial={animateIn}>
            <motion.div
              key={headline}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: reduced ? 0 : 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <h2 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-3xl leading-tight font-medium text-transparent drop-shadow-[0_2px_12px_var(--color-background)] select-none lg:text-4xl">
                {headline}
              </h2>
              {content.subtitle && (
                <p className="mt-2 max-w-md font-owners-text text-sm leading-relaxed text-content-normal [text-shadow:0_1px_3px_var(--color-background),0_2px_14px_var(--color-background)]">
                  {content.subtitle}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 z-20">
          <motion.div
            className="h-full"
            initial={animateIn ? { opacity: 0, y: 26 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={
              animateIn
                ? { duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0 }
            }
          >
            <div className="relative h-full">
              <Mock.Dashboard className="absolute top-[25%] left-[25%] w-screen origin-top-left scale-[1.5] rotate-x-55 rotate-z-45 shadow-2xl/50 2xl:top-[20%] 2xl:w-[125%] 2xl:max-w-7xl 2xl:min-w-6xl" />
            </div>
          </motion.div>
        </div>

        {/* scrim over the mock dashboard so the heading stays readable */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-full bg-linear-to-t from-background/80 from-25% to-transparent" />

        <AnimatePresence>
          {content.testimonials && (
            <motion.div
              key="testimonials"
              className="pointer-events-none absolute inset-x-0 top-0 z-30 h-2/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }}
            >
              <div className="pointer-events-auto absolute top-10 right-8 left-16 max-w-2xl">
                <Testimonial className="[text-shadow:none]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
