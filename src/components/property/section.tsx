interface PropertySectionProps {
  title: string
  children?: React.ReactNode
}

export default function PropertySection({
  title,
  children,
}: PropertySectionProps): React.ReactElement {
  return (
    <section className="w-full">
      <h3 className="text-xs font-semibold text-content-muted">{title}</h3>
      <div className="flex flex-col gap-3 pt-3">{children}</div>
    </section>
  )
}
