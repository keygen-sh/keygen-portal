import BackButton from "@/components/back-button"

export default function Sent() {
  return (
    <section className="flex w-80 flex-col justify-center">
      <div className="flex flex-col space-y-4">
        <BackButton label="Return to Login" className="justify-start md:hidden" />
        <h1 className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none">
          Check your inbox
        </h1>
        <p className="text-sm text-content-muted">
          We sent you a link to set a new password.
        </p>
      </div>
    </section>
  )
}
