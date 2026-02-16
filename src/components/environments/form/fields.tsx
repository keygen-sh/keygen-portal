import { useFormContext } from "react-hook-form"

import { Globe, GlobeLock } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import * as Schemas from "@/schemas"
import {
  IsolationStrategy,
  IsolationStrategyDescriptions,
  EnvironmentFormFieldDescriptions,
  EnvironmentCreateFormFieldDescriptions,
  EnvironmentEditFormFieldDescriptions,
} from "@/types/environments"

import * as Forms from "@/components/forms"
import { CardSelector, CardOption } from "@/components/card-selector"

type EnvironmentFieldName = "name" | "code" | "isolationStrategy"

type FieldVariant = "row" | "stacking" | "inline" | "none"
type Descriptions = typeof EnvironmentFormFieldDescriptions

interface EnvironmentsFormFieldsProps {
  include?: EnvironmentFieldName[]
  exclude?: EnvironmentFieldName[]
  autoFocus?: EnvironmentFieldName
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const DefaultFieldSort: EnvironmentFieldName[] = [
  "name",
  "code",
  "isolationStrategy",
]

export default function EnvironmentsFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: EnvironmentsFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? EnvironmentCreateFormFieldDescriptions
      : schema === "edit"
        ? EnvironmentEditFormFieldDescriptions
        : EnvironmentFormFieldDescriptions

  const fields = include
    ? include
    : DefaultFieldSort.filter((field) => !exclude.includes(field))

  return (
    <>
      {fields.map((field) => {
        switch (field) {
          case "name":
            return (
              <NameField
                key="name"
                autoFocus={autoFocus === "name"}
                titleVariant={titleVariant}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "code":
            return (
              <CodeField
                key="code"
                autoFocus={autoFocus === "code"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "isolationStrategy":
            return <IsolationStrategyField key="isolationStrategy" />
          default:
            return null
        }
      })}
    </>
  )
}

function NameField({
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Environments.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          {titleVariant ? (
            <FormControl>
              <Input
                {...field}
                variant="title"
                placeholder="Enter environment name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus ?? field.value.length === 0}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Environment name"
              variant={fieldVariant}
              tooltip={descriptions.name}
            >
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter environment name..."
                  autoFocus={autoFocus}
                  autoComplete="off"
                />
              </FormControl>
            </Forms.Field.Header>
          )}
          <FormMessage className={titleVariant ? "ml-2" : undefined} />
        </FormItem>
      )}
    />
  )
}

function CodeField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Environments.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Code"
            variant={fieldVariant}
            tooltip={descriptions.code}
          >
            <FormControl>
              <Input
                {...field}
                placeholder="e.g. sandbox"
                autoFocus={autoFocus}
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

const strategyOptions: CardOption<IsolationStrategy>[] = [
  {
    value: IsolationStrategy.Isolated,
    label: "Isolated",
    icon: <GlobeLock className="size-6 text-content-subdued md:size-5" />,
    tooltip: IsolationStrategyDescriptions[IsolationStrategy.Isolated],
  },
  {
    value: IsolationStrategy.Shared,
    label: "Shared",
    icon: <Globe className="size-6 text-content-subdued md:size-5" />,
    tooltip: IsolationStrategyDescriptions[IsolationStrategy.Shared],
  },
]

function IsolationStrategyField() {
  const form = useFormContext<Schemas.Environments.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="isolationStrategy"
      render={({ field }) => (
        <FormItem>
          <CardSelector
            options={strategyOptions}
            value={field.value}
            onChange={(value: IsolationStrategy) => {
              field.onChange(value)
            }}
            columns={2}
            className="max-w-128"
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
