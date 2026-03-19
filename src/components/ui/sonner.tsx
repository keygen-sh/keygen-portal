import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

export const Toaster = (props: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <div
      // NB(ezekg) we may be within a dialog context and we don't want
      //           any "clicked outside" events to propagate up
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <Sonner
        theme={theme as ToasterProps["theme"]}
        toastOptions={{
          classNames: {
            toast: "flex w-full justify-center pointer-events-auto",
          },
        }}
        className="toaster group"
        position="top-center"
        {...props}
      />
    </div>
  )
}
