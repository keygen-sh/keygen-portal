import { Button } from "@/assets/components/ui/button"

export default function App() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const signOut = () => {
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    window.location.href = "/"
  }

  console.log(token)

  return (
    <div className="mt-8 flex flex-col items-center justify-center space-y-8">
      <h1>Hello from "/app/dashboard"!</h1>

      <Button onClick={signOut}>Sign Out</Button>
    </div>
  )
}
