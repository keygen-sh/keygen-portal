import { useEffect, useState } from "react"
import { useMatches } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { HeroVariant, heroVariantFromRouteId } from "@/lib/hero"

import * as Mock from "@/components/mock"
import DotGrid from "@/components/dot-grid"
import Testimonial from "@/components/testimonial"

interface HeroContent {
  headline: string
  subtitle: string
  testimonials?: boolean
}

const CONTENT: Record<HeroVariant, HeroContent> = {
  login: {
    headline: "Licensing made simple",
    subtitle:
      "Distribute, license and monetize your software with a platform built for developers, by developers.",
  },
  register: {
    headline: "Ship licensing today",
    subtitle:
      "Join the teams building fast, flexible licensing on top of Keygen.",
    testimonials: true,
  },
  recovery: {
    headline: "Licensing made simple",
    subtitle:
      "Distribute, license and monetize your software with a platform built for developers, by developers.",
  },
}

const FADE_MASK = "linear-gradient(to bottom, #000 54%, transparent 90%)"

let hasEntered = false

export default function AuthHero() {
  const matches = useMatches()
  const currentRoute = matches[matches.length - 1]
  const variant = heroVariantFromRouteId(currentRoute?.routeId ?? "")
  const content = CONTENT[variant]
  const isRegister = variant === "register"
  const reduced = useReducedMotion()

  // prevent replaying entrance animation on auth navigations
  const [entering] = useState(() => !hasEntered)
  useEffect(() => {
    hasEntered = true
  }, [])
  const animateIn = entering && !reduced

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_70%_0%,#1b2127_0%,#12171c_45%,#070c11_100%)]" />
        <DotGrid />
        <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_45%,transparent_58%,#050a0f_100%)]" />
      </div>

      <div className="absolute inset-0 z-10">
        <div className="z-30 flex justify-center pt-8">
          <AnimatePresence mode="wait" initial={animateIn}>
            <motion.div
              key={content.headline}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: reduced ? 0 : 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <h2 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl leading-tight font-medium text-transparent select-none lg:text-3xl">
                {content.headline}
              </h2>
              <p className="mt-2 max-w-md font-owners-text text-sm leading-relaxed text-content-normal [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
                {content.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="absolute inset-0 z-20"
          style={{
            maskImage: isRegister ? FADE_MASK : undefined,
            WebkitMaskImage: isRegister ? FADE_MASK : undefined,
          }}
        >
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
            <div className="[ h-full perspective-distant">
              <div className="relative h-full scale-[1.05] rotate-x-8 -rotate-y-20 rotate-z-4">
                <Mock.Dashboard className="absolute top-36 left-0 w-full" />
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {content.testimonials && (
            <motion.div
              key="testimonials"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-2/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
              <div className="pointer-events-auto absolute right-8 bottom-10 left-[16%]">
                <Testimonial />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
