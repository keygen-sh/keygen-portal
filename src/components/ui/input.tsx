import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff } from "lucide-react"

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full min-w-0 rounded-md border border-accent bg-transparent selection:bg-primary selection:text-primary-foreground caret-white " +
    "shadow-xs transition-colors duration-300 outline-none select-none " +
    "placeholder:text-muted-foreground " +
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 " +
    "focus-visible:border-content-subdued " +
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 " +
    "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground " +
    "dark:bg-input/30",
  {
    variants: {
      variant: {
        default: "placeholder:text-content-subdued!",
        destructive:
          "text-destructive border-brand-destructive ring-2 ring-destructive/20 focus-visible:ring-destructive/40",
        outline: "bg-background",
        title: "font-owners-wide font-medium placeholder:text-content-normal",
      },
      fieldSize: {
        default: "h-9 px-3 py-1 text-sm",
        sm: "h-8 px-2 py-1 text-sm",
        lg: "h-10 px-4 py-2 text-base",
        xl: "text-xl",
      },
      toggle: {
        true: "pr-10",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      fieldSize: "default",
      toggle: false,
    },
  },
)

function Input({
  variant,
  fieldSize,
  toggle = false,
  type = "text",
  className,
  disabled,
  disabledTooltip,
  ...props
}: React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants> & {
    asChild?: boolean
    disabledTooltip?: string
  }) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

  const inputClasses = inputVariants({ variant, fieldSize, toggle, className })

  const isToggleable = toggle === true && type === "password"

  const input = (inputType: string) => (
    <input
      type={inputType}
      className={cn(inputClasses)}
      disabled={disabled}
      {...props}
    />
  )

  const tooltip = (element: React.ReactElement) => {
    if (disabled && disabledTooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="block">
              {element}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
            {disabledTooltip}
          </TooltipContent>
        </Tooltip>
      )
    }
    return element
  }

  if (!isToggleable) {
    return tooltip(input(type))
  }

  return tooltip(
    <div className="relative">
      <input
        {...props}
        type={isPasswordVisible ? "text" : "password"}
        className={cn(inputClasses)}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setIsPasswordVisible((prev) => !prev)}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
        disabled={disabled}
      >
        {isPasswordVisible ? (
          <EyeOff className="h-4 w-4 text-content-subdued" />
        ) : (
          <Eye className="h-4 w-4 text-content-subdued" />
        )}
      </button>
    </div>,
  )
}

export { Input }
