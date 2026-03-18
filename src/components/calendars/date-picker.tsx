import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerCalendarProps
  extends Omit<React.ComponentProps<typeof Calendar>, "mode" | "onSelect"> {
  selected?: Date
  onApply?: (date: Date | undefined) => void
  onCancel?: () => void
}

export default function DatePickerCalendar({
  selected,
  onApply,
  onCancel,
  className,
  ...props
}: DatePickerCalendarProps) {
  const [internalDate, setInternalDate] = useState<Date | undefined>(selected)

  const handleApply = () => {
    onApply?.(internalDate)
  }

  const handleCancel = () => {
    setInternalDate(selected)
    onCancel?.()
  }

  return (
    <div
      className={cn(
        "rounded bg-background [&_[data-slot=calendar]_[data-slot=button]:not([data-selected-single=true])]:hover:bg-background-1",
        className,
      )}
    >
      <Calendar
        mode="single"
        selected={internalDate}
        onSelect={setInternalDate}
        buttonVariant="outline"
        classNames={{
          nav: "flex items-center justify-between absolute inset-x-0 h-8 px-1",
          month_caption:
            "flex items-center justify-center w-full h-8 bg-background-1 rounded-sm",
          button_previous:
            "bg-background transition-colors duration-50 hover:bg-background-2 hover:text-content-loud rounded-sm size-6 cursor-pointer flex items-center justify-center",
          button_next:
            "bg-background transition-colors duration-50 hover:bg-background-2 hover:text-content-loud rounded-sm size-6 cursor-pointer flex items-center justify-center",
          today: "bg-background-1 rounded-md data-[selected=true]:rounded-none",
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? (
              <ChevronLeftIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            ),
        }}
        {...props}
      />
      <div className="flex items-center gap-2 border-t p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="h-9 flex-1 rounded-sm font-semibold"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          className="h-9 flex-1 rounded-sm font-semibold"
        >
          Apply
        </Button>
      </div>
    </div>
  )
}
