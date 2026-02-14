import { useFormContext } from "react-hook-form"

import { Award, Unlock, Lock } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import * as Schemas from "@/schemas"
import {
  DistributionStrategy,
  DistributionStrategyDescriptions,
  KnownPlatforms,
  Permissions,
  ProductFormFieldDescriptions,
  ProductCreateFormFieldDescriptions,
  ProductEditFormFieldDescriptions,
} from "@/types/products"

import * as Forms from "@/components/forms"
import TagInput from "@/components/tag-input"
import MultiSelect from "@/components/multi-select"
import KeyValueInput from "@/components/key-value-input"
import { CardSelector, CardOption } from "@/components/card-selector"

type FieldVariant = "row" | "stacking" | "inline" | "none"
type Descriptions = typeof ProductFormFieldDescriptions

interface ProductsFormFieldsProps {
  include?: Schemas.Products.FieldNames[]
  exclude?: Schemas.Products.FieldNames[]
  autoFocus?: Schemas.Products.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const DefaultFieldSort: Schemas.Products.FieldNames[] = [
  "name",
  "code",
  "url",
  "distributionStrategy",
  "permissions",
  "platforms",
  "metadata",
]

export default function ProductsFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: ProductsFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? ProductCreateFormFieldDescriptions
      : schema === "edit"
        ? ProductEditFormFieldDescriptions
        : ProductFormFieldDescriptions

  const fieldMap: Record<Schemas.Products.FieldNames, React.ReactNode> = {
    name: (
      <NameField
        key="name"
        autoFocus={autoFocus === "name"}
        titleVariant={titleVariant}
        fieldVariant={fieldVariant}
        descriptions={descriptions}
      />
    ),
    code: (
      <CodeField
        key="code"
        autoFocus={autoFocus === "code"}
        fieldVariant={fieldVariant}
        descriptions={descriptions}
      />
    ),
    url: (
      <UrlField
        key="url"
        autoFocus={autoFocus === "url"}
        fieldVariant={fieldVariant}
        descriptions={descriptions}
      />
    ),
    distributionStrategy: (
      <DistributionStrategyField key="distributionStrategy" />
    ),
    permissions: (
      <PermissionsField
        key="permissions"
        autoFocus={autoFocus === "permissions"}
        fieldVariant={fieldVariant}
        descriptions={descriptions}
      />
    ),
    platforms: (
      <PlatformsField
        key="platforms"
        autoFocus={autoFocus === "platforms"}
        fieldVariant={fieldVariant}
        descriptions={descriptions}
      />
    ),
    metadata: (
      <MetadataField
        key="metadata"
        autoFocus={autoFocus === "metadata"}
        fieldVariant={fieldVariant}
        descriptions={descriptions}
      />
    ),
  }

  const fields = include
    ? include
    : DefaultFieldSort.filter((field) => !exclude.includes(field))

  return <>{fields.map((fieldName) => fieldMap[fieldName])}</>
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
  const form = useFormContext<Schemas.Products.AllValues>()

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
                placeholder="Enter product name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus ?? field.value.length === 0}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Product name"
              variant={fieldVariant}
              tooltip={descriptions.name}
            >
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter product name..."
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
  const form = useFormContext<Schemas.Products.AllValues>()

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
              <Input {...field} placeholder="example" autoFocus={autoFocus} />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function UrlField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Products.AllValues>()

  return (
    <FormField
      control={form.control}
      name="url"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="URL"
            variant={fieldVariant}
            tooltip={descriptions.url}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="https://example.com"
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

function DistributionStrategyField() {
  const form = useFormContext<Schemas.Products.AllValues>()

  const strategyOptions: CardOption<DistributionStrategy>[] = [
    {
      value: DistributionStrategy.Licensed,
      label: "Licensed",
      icon: <Award className="size-6 text-content-subdued md:size-5" />,
      tooltip: DistributionStrategyDescriptions[DistributionStrategy.Licensed],
    },
    {
      value: DistributionStrategy.Open,
      label: "Open",
      icon: <Unlock className="size-6 text-content-subdued md:size-5" />,
      tooltip: DistributionStrategyDescriptions[DistributionStrategy.Open],
    },
    {
      value: DistributionStrategy.Closed,
      label: "Closed",
      icon: <Lock className="size-6 text-content-subdued md:size-5" />,
      tooltip: DistributionStrategyDescriptions[DistributionStrategy.Closed],
    },
  ]

  return (
    <FormField
      control={form.control}
      name="distributionStrategy"
      render={({ field }) => (
        <FormItem>
          <CardSelector
            options={strategyOptions}
            value={field.value}
            onChange={(value: DistributionStrategy) => {
              field.onChange(value)
            }}
            columns={3}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function PermissionsField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Products.AllValues>()

  return (
    <FormField
      control={form.control}
      name="permissions"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Permissions"
            variant={fieldVariant}
            tooltip={descriptions.permissions}
            optional
          >
            <MultiSelect
              value={field.value ?? []}
              onChange={field.onChange}
              options={Permissions.map((p) => ({
                label: p === "*" ? "*" : p,
                value: p,
              }))}
              wildcard="*"
              placeholder="Leave blank to use defaults"
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function PlatformsField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Products.AllValues>()

  return (
    <FormField
      control={form.control}
      name="platforms"
      render={() => (
        <FormItem>
          <Forms.Field.Header
            label="Platforms"
            variant={fieldVariant}
            tooltip={descriptions.platforms}
            optional
          >
            <TagInput
              name="platforms"
              placeholder="e.g. Windows, macOS, Linux"
              options={KnownPlatforms}
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MetadataField({
  autoFocus,
  fieldVariant = "stacking",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Products.AllValues>()

  return (
    <FormField
      control={form.control}
      name="metadata"
      render={() => (
        <FormItem>
          <Forms.Field.Header
            label="Metadata"
            variant={fieldVariant}
            tooltip={descriptions.metadata}
            optional
          >
            <FormControl>
              <KeyValueInput<Schemas.Products.AllValues>
                name="metadata"
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
