import { toast } from "@/lib/toast"

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast({ message: "Copied to clipboard" })
  } catch (err) {
    console.error(err)
    toast({
      message: "Failed to copy",
      description: "Try again later",
      variant: "error",
    })
  }
}
