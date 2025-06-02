import { toast } from "sonner"

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  } catch (err) {
    console.error("Failed to copy: ", err)
    toast.error("Failed to copy to clipboard")
  }
}
