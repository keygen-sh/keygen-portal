import { notify } from "@/lib/toast"

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify({ message: "Copied to clipboard" })
  } catch (err) {
    console.error(err)
    notify({
      message: "Failed to copy",
      description: "Try again later",
      variant: "error",
    })
  }
}
