import config from "@/keygen/config"

const ENDPOINT = "https://img.logo.dev/name"

export function logoDevImageUrl(
  name: string,
  theme: "light" | "dark" = "dark",
): string | null {
  const token = config.logoDevToken
  if (!token) return null

  const params = new URLSearchParams({
    token,
    size: "64",
    format: "webp",
    theme,
    fallback: "404", // we use our own monogram
  })

  return `${ENDPOINT}/${encodeURIComponent(name)}?${params}`
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase()

  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
