import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = { key: string; label: string }

type StepProgressProps = {
  steps: Step[]
  currentIndex: number
  completedSteps?: Set<string> | string[]
  orientation?: "horizontal" | "vertical"
  showLabels?: boolean
  className?: string
}

export default function StepProgress({
  steps,
  currentIndex,
  completedSteps,
  orientation = "horizontal",
  className,
}: StepProgressProps): React.ReactElement | null {
  const completed = new Set(
    Array.isArray(completedSteps)
      ? completedSteps
      : completedSteps
        ? Array.from(completedSteps)
        : [],
  )

  const isHorizontal = orientation === "horizontal"

  if (!steps || steps.length <= 1) return null

  return (
    <div className={cn(isHorizontal ? "w-full" : "w-auto", className)}>
      <ol
        className={cn(
          "relative flex min-w-0",
          isHorizontal ? "w-full items-center" : "flex-col items-start",
        )}
      >
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex
          const isDone = completed.has(step.key)
          const showConnector = i < steps.length - 1

          return (
            <li
              key={step.key}
              className={cn(
                isHorizontal
                  ? "flex min-w-0 items-center"
                  : "flex flex-col items-start",
                isHorizontal && showConnector ? "flex-1" : "flex-none",
              )}
            >
              {isHorizontal ? (
                <>
                  <div className="relative">
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
                        isDone
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary bg-transparent text-transparent"
                            : "border-accent bg-transparent text-transparent",
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 transform transition-all duration-200 ease-out",
                          isDone
                            ? "scale-100 opacity-100"
                            : "scale-50 opacity-0",
                        )}
                      />
                    </span>
                  </div>

                  {showConnector && (
                    <div className="relative mx-1 h-0.5 min-w-0 flex-1 overflow-hidden">
                      <div className="absolute inset-0 rounded bg-accent" />
                      <div
                        className="absolute inset-0 origin-left rounded bg-primary transition-transform duration-300 ease-out"
                        style={{
                          transform: `translateZ(0) scaleX(${i < currentIndex ? 1 : 0})`,
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                        isDone
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary bg-transparent text-transparent"
                            : "border-accent bg-transparent text-transparent",
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 transform transition-all duration-200 ease-out",
                          isDone
                            ? "scale-100 opacity-100"
                            : "scale-50 opacity-0",
                        )}
                      />
                    </span>
                  </div>

                  {showConnector && (
                    <div className="relative my-1 h-6 w-0.5 overflow-hidden">
                      <div className="absolute inset-0 rounded bg-accent" />
                      <div
                        className="absolute inset-0 origin-top rounded bg-primary transition-transform duration-300 ease-out"
                        style={{
                          transform: `translateZ(0) scaleY(${i < currentIndex ? 1 : 0})`,
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
