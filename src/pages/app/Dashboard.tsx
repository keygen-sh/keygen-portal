export default function App() {
  const token = localStorage.getItem("token")

  console.log(token)

  return (
    <div>
      <h1>Hello from "/app/dashboard"!</h1>
    </div>
  )
}
