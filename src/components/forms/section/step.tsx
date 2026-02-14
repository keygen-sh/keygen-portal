export interface FormsSectionStepProps {
  crumb: string
  fields?: string[]
  children: React.ReactNode
}

// This component doesn't render anything itself but serves as a step marker for the form layout
export default function FormsSectionStep(props: FormsSectionStepProps) {
  // Props aren't used directly here; they're consumed by the form layout
  void props

  return null
}
