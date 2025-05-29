import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff } from "lucide-react"

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
        default: "",
        destructive:
          "text-destructive border-brand-destructive ring-2 ring-destructive/20 focus-visible:ring-destructive/40",
        outline: "bg-background",
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
  ...props
}: React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants> & {
    asChild?: boolean
  }) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

  const inputClasses = inputVariants({ variant, fieldSize, toggle, className })

  const isToggleable = toggle === true && type === "password"
  if (!isToggleable) {
    return <input type={type} className={cn(inputClasses)} {...props} />
  }

  return (
    <div className="relative">
      <input
        {...props}
        type={isPasswordVisible ? "text" : "password"}
        className={cn(inputClasses)}
      />
      <button
        type="button"
        onClick={() => setIsPasswordVisible((prev) => !prev)}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
      >
        {isPasswordVisible ? (
          <EyeOff className="h-4 w-4 text-content-subdued" />
        ) : (
          <Eye className="h-4 w-4 text-content-subdued" />
        )}
      </button>
    </div>
  )
}

export { Input }
