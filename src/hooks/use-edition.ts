import config from "@/keygen/config"

export function useEdition(): { isCE: boolean; isEE: boolean } {
  return { isCE: config.isCE, isEE: !config.isCE }
}
