import { useNavigate } from "@tanstack/react-router"

export const useBackNavigate = (): (() => Promise<void>) => {
  const navigate = useNavigate()

  return async () => {
    if (window.history.length > 1) {
      window.history.back()

      return
    }

    await navigate({ to: ".." })
  }
}
