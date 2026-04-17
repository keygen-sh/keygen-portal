import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import * as Icons from "@/icons"
import { Container, FileBox } from "lucide-react"

import { useListProducts } from "@/queries/products"

import * as Schemas from "@/schemas"
import {
  PackageEngine,
  PackageEngineLabels,
  PackageEngineDescriptions,
  PackageFormFieldDescriptions,
  PackageCreateFormFieldDescriptions,
  PackageEditFormFieldDescriptions,
} from "@/types/packages"
import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import * as Search from "@/components/search"
import KeyValueInput from "@/components/key-value-input"
import { CardSelector, CardOption } from "@/components/card-selector"

type Descriptions = typeof PackageFormFieldDescriptions

interface PackagesFormFieldsProps {
  include?: Schemas.Packages.FieldNames[]
  exclude?: Schemas.Packages.FieldNames[]
  autoFocus?: Schemas.Packages.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Packages.FieldNames[] = [
  "name",
  "key",
  "engine",
  "metadata",
  "productId",
]

export default function PackagesFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: PackagesFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? PackageCreateFormFieldDescriptions
      : schema === "edit"
        ? PackageEditFormFieldDescriptions
        : PackageFormFieldDescriptions

  const fields = include
    ? include
    : INCLUDE_DEFAULT_FIELDS.filter((field) => !exclude.includes(field))

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
          case "key":
            return (
              <KeyField
                key="key"
                autoFocus={autoFocus === "key"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "engine":
            return <EngineField key="engine" />
          case "metadata":
            return (
              <MetadataField
                key="metadata"
                autoFocus={autoFocus === "metadata"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "productId":
            return (
              <ProductIdField
                key="productId"
                autoFocus={autoFocus === "productId"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
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
  const form = useFormContext<Schemas.Packages.AllValues>()

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
                value={field.value ?? ""}
                variant="title"
                placeholder="Enter package name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus ?? (field.value ?? "").length === 0}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Package name"
              variant={fieldVariant}
              tooltip={descriptions.name}
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Enter package name..."
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

function KeyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Packages.AllValues>()

  return (
    <FormField
      control={form.control}
      name="key"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Key"
            variant={fieldVariant}
            tooltip={descriptions.key}
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="e.g. my-package"
                autoFocus={autoFocus}
                autoComplete="off"
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function EngineField() {
  const form = useFormContext<Schemas.Packages.AllValues>()

  const engineOptions: CardOption<PackageEngine>[] = [
    {
      value: PackageEngine.PyPI,
      label: PackageEngineLabels[PackageEngine.PyPI],
      icon: (
        <Icons.PyPi className="size-6 text-content-subdued transition-colors duration-150 group-hover:text-[#3775A9] md:size-5" />
      ),
      tooltip: PackageEngineDescriptions[PackageEngine.PyPI],
    },
    {
      value: PackageEngine.Tauri,
      label: PackageEngineLabels[PackageEngine.Tauri],
      icon: (
        <Icons.Tauri className="size-6 text-content-subdued transition-colors duration-150 group-hover:text-[#FFC131] md:size-5" />
      ),
      tooltip: PackageEngineDescriptions[PackageEngine.Tauri],
    },
    {
      value: PackageEngine.RubyGems,
      label: PackageEngineLabels[PackageEngine.RubyGems],
      icon: (
        <Icons.RubyGems className="size-6 text-content-subdued transition-colors duration-150 group-hover:text-[#E9573F] md:size-5" />
      ),
      tooltip: PackageEngineDescriptions[PackageEngine.RubyGems],
    },
    {
      value: PackageEngine.Npm,
      label: PackageEngineLabels[PackageEngine.Npm],
      icon: (
        <Icons.Npm className="size-6 text-content-subdued transition-colors duration-150 group-hover:text-[#CB3837] md:size-5" />
      ),
      tooltip: PackageEngineDescriptions[PackageEngine.Npm],
    },
    {
      value: PackageEngine.OCI,
      label: PackageEngineLabels[PackageEngine.OCI],
      icon: (
        <Container className="size-6 text-content-subdued transition-colors duration-150 group-hover:text-content-loud md:size-5" />
      ),
      tooltip: PackageEngineDescriptions[PackageEngine.OCI],
    },
    {
      value: PackageEngine.Raw,
      label: PackageEngineLabels[PackageEngine.Raw],
      icon: (
        <FileBox className="size-6 text-content-subdued transition-colors duration-150 group-hover:text-content-loud md:size-5" />
      ),
      tooltip: PackageEngineDescriptions[PackageEngine.Raw],
    },
  ]

  return (
    <FormField
      control={form.control}
      name="engine"
      render={({ field }) => (
        <FormItem>
          <CardSelector
            options={engineOptions}
            value={field.value}
            onChange={(value) =>
              field.onChange(field.value === value ? null : value)
            }
            columns={3}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ProductIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Packages.CreateValues>()

  const { data: products = [], isLoading: productsLoading } = useListProducts()

  if (productsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="productId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Product"
            variant={fieldVariant}
            tooltip={descriptions.product}
          >
            <FormControl>
              <Search.Select
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                options={products}
                resource="products"
                allowClear={false}
                invalid={!!fieldState.error}
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

function MetadataField({
  autoFocus,
  fieldVariant = "stacking",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Packages.AllValues>()

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
              <KeyValueInput<Schemas.Packages.AllValues>
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
