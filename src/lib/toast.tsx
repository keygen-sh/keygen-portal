import { CircleCheckBig, AlertCircle, Info, X } from "lucide-react"
import { toast as sonnerToast } from "sonner"
import { cn } from "@/lib/utils"

type CustomOptions = Parameters<typeof sonnerToast.custom>[1]

const variants = {
  default: {
    icon: "",
    title: "text-content-muted",
    background: "bg-background-5/40",
  },
  success: {
    icon: <CircleCheckBig className="size-4 text-brand-primary" />,
    title: "text-brand-primary",
    background: "bg-brand-primary/20",
  },
  error: {
    icon: <AlertCircle className="size-4 text-brand-destructive" />,
    title: "text-brand-destructive",
    background: "bg-brand-destructive/20",
  },
  warning: {
    icon: <Info className="size-4 text-warning" />,
    title: "text-warning",
    background: "bg-warning/20",
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
  const { icon, title, background } = variants[variant]

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
            <p className="mt-1 text-sm font-normal text-nowrap text-content-normal">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => sonnerToast.dismiss(id)}
          className="ml-2 size-4 text-content-normal transition-colors duration-200 hover:text-content-loud"
        >
          <X className="size-4" />
        </button>
      </div>
    ),
    { duration: 4000, ...options },
  )
}
