import { cn } from "@/lib/utils"

type PropertyFieldVariant = "default" | "reverse"
type EmptyCase = (value: React.ReactNode) => boolean

interface PropertyFieldProps {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  variant?: PropertyFieldVariant
  value: React.ReactNode
  isEmpty?: EmptyCase
  emptyLabel?: string
  className?: string
}

const defaultIsEmpty: EmptyCase = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "")

export default function PropertyField({
  icon: Icon,
  label,
  variant = "default",
  value,
  isEmpty = defaultIsEmpty,
  emptyLabel = "--",
  className,
}: PropertyFieldProps): React.ReactElement {
  const renderVariant = () => {
    switch (variant) {
      case "reverse":
        return (
          <div className="flex items-center">
            {Icon && (
              <Icon className="mt-1 mr-2 size-3.5 text-content-normal" />
            )}
            {isEmpty(value) ? (
              <>
                <p className="text-sm text-content-normal">{emptyLabel}</p>
              </>
            ) : (
              <>
                <span
                  className={cn("mr-1 text-sm text-content-loud", className)}
                >
                  {value}
                </span>
                <p className="text-sm text-content-muted">{label}</p>
              </>
            )}
          </div>
        )
      default:
        return (
          <div className="flex items-center">
            {Icon && (
              <Icon className="mt-1 mr-2 size-3.5 text-content-normal" />
            )}
            {isEmpty(value) ? (
              <>
                <p className="text-sm text-content-muted">{label}</p>
                <span
                  className={cn("ml-1 text-sm text-content-loud", className)}
                >
                  {value}
                </span>
              </>
            ) : (
              <>
                <p className="text-sm text-content-muted">{label}</p>
                <span
                  className={cn("ml-1 text-sm text-content-loud", className)}
                >
                  {value}
                </span>
              </>
            )}
          </div>
        )
    }
  }

  return renderVariant()
}
