import { CircleCheckBig, AlertCircle, Info, X } from "lucide-react"
import { toast as sonnerToast } from "sonner"
import { cn } from "@/lib/utils"

type CustomOptions = Parameters<typeof sonnerToast.custom>[1]

const variants = {
  default: {
    icon: "",
    title: "text-content-loud dark:text-content-muted",
    background: "bg-background-1 dark:bg-background-5/40",
    foreground: "text-content-muted dark:text-content-normal",
  },
  success: {
    icon: <CircleCheckBig className="size-4 text-white dark:text-primary" />,
    title: "text-white dark:text-primary",
    background: "bg-primary dark:bg-primary/20",
    foreground: "text-white/90 dark:text-content-normal",
  },
  error: {
    icon: <AlertCircle className="size-4 text-white dark:text-destructive" />,
    title: "text-white dark:text-destructive",
    background: "bg-destructive dark:bg-destructive/20",
    foreground: "text-white/90 dark:text-content-normal",
  },
  warning: {
    icon: <Info className="size-4 text-white dark:text-warning" />,
    title: "text-white dark:text-warning",
    background: "bg-warning dark:bg-warning/20",
    foreground: "text-white/90 dark:text-content-normal",
  },
}

type Variant = keyof typeof variants

interface NotifyOptions {
  message: string
  description?: string
  variant?: Variant
  options?: CustomOptions
}

export function toast({
  message,
  description,
  variant = "default",
  ...options
}: NotifyOptions) {
  if (!variant || !variants[variant]) {
    variant = "default"
  }
  const { icon, title, background, foreground } = variants[variant]

  return sonnerToast.custom(
    (id) => (
      <div
        className={cn(
          "flex min-w-60 items-start gap-2 rounded-md px-4 py-3 shadow-lg backdrop-blur",
          background,
        )}
      >
        {icon}
        <div className="w-full flex-1">
          <p className={cn("text-sm leading-none font-medium", title)}>
            {message}
          </p>
          {description && (
            <p
              className={cn("mt-1 text-sm font-normal text-nowrap", foreground)}
            >
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => sonnerToast.dismiss(id)}
          className={cn(
            "ml-2 size-4 transition-colors duration-200 hover:text-content-loud dark:hover:text-content-loud",
            foreground,
          )}
        >
          <X className="size-4" />
        </button>
      </div>
    ),
    { duration: 4000, ...options },
  )
}
