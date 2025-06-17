import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

export const Toaster = (props: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          toast: "flex w-full justify-center",
        },
      }}
      className="toaster group"
      position="top-center"
      {...props}
    />
  )
}
