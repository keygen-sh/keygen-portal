import { FormPageGuard } from "@/components/forms/guard"

interface FormsContainerPageProps {
  children: React.ReactNode
}

export default function FormsContainerPage({
  children,
}: FormsContainerPageProps) {
  return <FormPageGuard>{children}</FormPageGuard>
}
