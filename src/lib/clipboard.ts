import { notify } from "@/lib/toast"

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify("Copied to clipboard")
  } catch (err) {
    console.error(err)
    notify("Failed to copy", "Try again later", "error")
  }
}
