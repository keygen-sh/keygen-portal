import config from "@/keygen/config"

const STORAGE_KEYS = ["token", "tokenId"]

export function logout() {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }

  window.location.replace(`/${config.id}/auth/login`)
}
