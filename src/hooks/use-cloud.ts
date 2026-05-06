import config from "@/keygen/config"

export function useCloud(): { isCloud: boolean } {
  return { isCloud: config.isCloud }
}
