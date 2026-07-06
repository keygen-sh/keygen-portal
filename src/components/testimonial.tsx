import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface TestimonialItem {
  quote: string
  name: string
  role: string
}

// https://testimonial.to/keygen/all
const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      "Licensing was planned to make up at least 25% of planned dev time for our product, so it's awesome to see that we've been able to cut it down to 2.5% with Keygen.",
    name: "Vildan S.",
    role: "Team Lead, Ranorex",
  },
  {
    quote:
      "Using Keygen saved me the trouble of building and maintaining my own licensing server and strategy. It is easy to work with, reliable, and affordable.",
    name: "Cameron M.",
    role: "Designer/Developer, GuideGuide",
  },
  {
    quote:
      "We have been using Keygen for more than two years now and it has been fantastic for us. We never worry about licensing servers, and I couldn't be happier about that.",
    name: "Santiago Montesdeoca",
    role: "CEO & Founder, Artineering",
  },
  {
    quote:
      "The simple API, dashboard, and integrations enabled us to add license validation into our product in less than a day — and at quite low cost. Strongly recommend Keygen.",
    name: "Akash Levy",
    role: "CTO, Silimate",
  },
  {
    quote:
      "Keygen is exactly what we were looking for. Our licensing model is a bit cryptic, but we didn't want to build out a whole backend. Keygen's API let us build to our spec.",
    name: "Darren Hill",
    role: "Partner, ExtendApps Inc.",
  },
]

const ROTATE_MS = 6500

export default function Testimonial({
  testimonials = TESTIMONIALS,
  className,
}: {
  testimonials?: TestimonialItem[]
  className?: string
}) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const paused = hovered || focused

  const count = testimonials.length

  function paginate(dir: number) {
    setDirection(dir)
    setIndex((prev) => (prev + dir + count) % count)
  }

  function goTo(next: number) {
    setDirection(next >= index ? 1 : -1)
    setIndex(next)
  }

  useEffect(() => {
    if (reduced || paused || count < 2) return

    const id = setInterval(() => {
      setDirection(1)
      setIndex((prev) => (prev + 1) % count)
    }, ROTATE_MS)

    return () => clearInterval(id)
  }, [reduced, paused, count])

  const current = testimonials[index]
  const offset = reduced ? 0 : 36

  const slide = {
    enter: (dir: number) => ({ x: dir * offset, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -offset, opacity: 0 }),
  }

  return (
    <figure
      className={cn("relative", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="grid min-h-28 grid-cols-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={index}
            className="col-start-1 row-start-1"
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <blockquote className="font-owners-text text-[0.95rem] leading-relaxed text-content-muted">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary font-owners-wide text-sm font-medium text-brand-neutral-900 select-none">
                {current.name.charAt(0)}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-content-loud">
                  {current.name}
                </span>
                <span className="text-xs text-content-subdued">
                  {current.role}
                </span>
              </span>
            </figcaption>
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="mt-5 flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => paginate(-1)}
            className="flex size-7 text-content-subdued"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex gap-1.5">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index
                    ? "w-6 bg-brand-primary"
                    : "w-1.5 bg-brand-border-3 hover:bg-brand-border-4",
                )}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => paginate(1)}
            className="flex size-7 text-content-subdued"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </figure>
  )
}
