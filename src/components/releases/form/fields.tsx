import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { format, parseISO } from "date-fns"
import {
  X,
  Binary,
  Package,
  TestTube,
  PackageOpen,
  FlaskConical,
  CalendarIcon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

import { useListProducts } from "@/queries/products"
import { useListEntitlements } from "@/queries/entitlements"

import * as Schemas from "@/schemas"
import {
  ReleaseChannel,
  ReleaseChannelLabels,
  ReleaseChannelDescriptions,
  ReleaseFormFieldDescriptions,
  ReleaseCreateFormFieldDescriptions,
  ReleaseEditFormFieldDescriptions,
} from "@/types/releases"
import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import * as Search from "@/components/search"
import * as Calendars from "@/components/calendars"
import KeyValueInput from "@/components/key-value-input"
import { CardSelector, CardOption } from "@/components/card-selector"
import VersionInput from "@/components/version-input"
import { recomposeVersion } from "@/lib/releases"

type Descriptions = typeof ReleaseFormFieldDescriptions

interface ReleasesFormFieldsProps {
  include?: Schemas.Releases.FieldNames[]
  exclude?: Schemas.Releases.FieldNames[]
  autoFocus?: Schemas.Releases.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const IncludeDefaultFields: Schemas.Releases.FieldNames[] = [
  "name",
  "version",
  "tag",
  "channel",
  "description",
  "backdated",
  "metadata",
  "productId",
  "constraints.attach",
  "packages.attach",
]

export default function ReleasesFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: ReleasesFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? ReleaseCreateFormFieldDescriptions
      : schema === "edit"
        ? ReleaseEditFormFieldDescriptions
        : ReleaseFormFieldDescriptions

  const fields = include
    ? include
    : IncludeDefaultFields.filter((field) => !exclude.includes(field))

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
          case "version":
            return (
              <VersionField
                key="version"
                autoFocus={autoFocus === "version"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "tag":
            return (
              <TagField
                key="tag"
                autoFocus={autoFocus === "tag"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "channel":
            return <ChannelField key="channel" />
          case "description":
            return (
              <DescriptionField
                key="description"
                autoFocus={autoFocus === "description"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "backdated":
            return (
              <BackdateField
                key="backdated"
                autoFocus={autoFocus === "backdated"}
                fieldVariant={fieldVariant}
                schema={schema}
              />
            )
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
          case "constraints.attach":
            return (
              <ConstraintsAttachField
                key="constraints.attach"
                autoFocus={autoFocus === "constraints.attach"}
                descriptions={descriptions}
              />
            )
          case "packages.attach":
            return (
              <PackagesAttachField
                key="packages.attach"
                autoFocus={autoFocus === "packages.attach"}
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
  const form = useFormContext<Schemas.Releases.AllValues>()

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
                placeholder="Enter release name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus ?? (field.value ?? "").length === 0}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Release name"
              variant={fieldVariant}
              tooltip={descriptions.name}
              optional
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Enter release name..."
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

function VersionField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Releases.AllValues>()
  const channel = useWatch({
    control: form.control,
    name: "channel",
  }) as ReleaseChannel

  return (
    <FormField
      control={form.control}
      name="version"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Version"
            variant={fieldVariant}
            tooltip={descriptions.version}
            hint="Must be a valid semver"
          >
            <FormControl>
              <VersionInput
                value={field.value}
                onChange={field.onChange}
                channel={channel}
                onChannelChange={(ch) => form.setValue("channel", ch)}
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

function TagField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Releases.AllValues>()

  return (
    <FormField
      control={form.control}
      name="tag"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Tag"
            variant={fieldVariant}
            tooltip={descriptions.tag}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="e.g. v1.0.0 or a commit SHA"
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

function ChannelField() {
  const form = useFormContext<Schemas.Releases.AllValues>()

  const channelOptions: CardOption<ReleaseChannel>[] = [
    {
      value: ReleaseChannel.Stable,
      label: ReleaseChannelLabels[ReleaseChannel.Stable],
      icon: <Package className="size-6 text-content-subdued md:size-5" />,
      tooltip: ReleaseChannelDescriptions[ReleaseChannel.Stable],
    },
    {
      value: ReleaseChannel.Rc,
      label: ReleaseChannelLabels[ReleaseChannel.Rc],
      icon: <PackageOpen className="size-6 text-content-subdued md:size-5" />,
      tooltip: ReleaseChannelDescriptions[ReleaseChannel.Rc],
    },
    {
      value: ReleaseChannel.Beta,
      label: ReleaseChannelLabels[ReleaseChannel.Beta],
      icon: <FlaskConical className="size-6 text-content-subdued md:size-5" />,
      tooltip: ReleaseChannelDescriptions[ReleaseChannel.Beta],
    },
    {
      value: ReleaseChannel.Alpha,
      label: ReleaseChannelLabels[ReleaseChannel.Alpha],
      icon: <TestTube className="size-6 text-content-subdued md:size-5" />,
      tooltip: ReleaseChannelDescriptions[ReleaseChannel.Alpha],
    },
    {
      value: ReleaseChannel.Dev,
      label: ReleaseChannelLabels[ReleaseChannel.Dev],
      icon: <Binary className="size-6 text-content-subdued md:size-5" />,
      tooltip: ReleaseChannelDescriptions[ReleaseChannel.Dev],
    },
  ]

  return (
    <FormField
      control={form.control}
      name="channel"
      render={({ field }) => (
        <FormItem>
          <CardSelector
            options={channelOptions}
            value={field.value}
            onChange={(channel: ReleaseChannel) => {
              const prevChannel = field.value as ReleaseChannel
              const currentVersion = form.getValues("version")

              form.setValue("channel", channel)

              if (currentVersion) {
                const recomposed = recomposeVersion(
                  currentVersion,
                  prevChannel,
                  channel,
                )

                form.setValue("version", recomposed, { shouldValidate: true })
              }
            }}
            columns={5}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function DescriptionField({
  autoFocus,
  fieldVariant = "stacking",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Releases.AllValues>()

  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Description"
            variant={fieldVariant}
            tooltip={descriptions.description}
            optional
          >
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="Release notes, changelog, etc."
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

function BackdateField({
  autoFocus,
  fieldVariant = "row",
  schema,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}) {
  const form = useFormContext<Schemas.Releases.AllValues>()
  const [open, setOpen] = useState(false)
  const allowClear = schema !== "edit"

  return (
    <FormField
      control={form.control}
      name="backdated"
      render={({ field, fieldState }) => {
        const selectedDate = field.value ? parseISO(field.value) : undefined

        return (
          <FormItem>
            <Forms.Field.Header
              label="Backdate"
              variant={fieldVariant}
              optional={allowClear}
              tooltip={ReleaseFormFieldDescriptions.backdated}
            >
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      autoFocus={autoFocus}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                        !!fieldState.error && "border-destructive",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-content-normal" />
                      {field.value ? (
                        format(selectedDate!, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                      {allowClear && field.value && (
                        <span
                          role="button"
                          tabIndex={0}
                          className="ml-auto flex h-6 w-6 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            field.onChange(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              e.stopPropagation()
                              field.onChange(null)
                            }
                          }}
                        >
                          <X className="size-4" />
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendars.DatePicker
                      key={selectedDate?.toISOString()}
                      selected={selectedDate}
                      onApply={(date) => {
                        field.onChange(date ? date.toISOString() : null)
                        setOpen(false)
                      }}
                      onCancel={() => setOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
            </Forms.Field.Header>
            <FormMessage />
          </FormItem>
        )
      }}
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
  const form = useFormContext<Schemas.Releases.CreateValues>()

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

function ConstraintsAttachField({
  autoFocus,
  descriptions,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Releases.AllValues>()
  const { data: entitlements = [], isLoading: entitlementsLoading } =
    useListEntitlements()

  if (entitlementsLoading) {
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
      name="constraints.attach"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Constraints"
            variant="stacking"
            tooltip={descriptions.constraints}
          >
            <FormControl>
              <Search.MultiSelect
                value={field.value ?? []}
                onChange={field.onChange}
                options={entitlements}
                resource="entitlements"
                placeholder="Search entitlements"
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

// TODO(cazden) implement after packages resource is built
function PackagesAttachField({
  autoFocus,
  descriptions,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
}) {
  void autoFocus

  const form = useFormContext<Schemas.Releases.AllValues>()
  // const { data: packages = [], isLoading: packagesLoading } = useListPackages()

  // if (packagesLoading) {
  //   return (
  //     <div className="space-y-2">
  //       <Skeleton className="h-5 w-48 rounded-sm" />
  //       <Skeleton className="h-8 w-3/4" />
  //     </div>
  //   )
  // }

  return (
    <FormField
      control={form.control}
      name="packages.attach"
      render={() => (
        <FormItem>
          <Forms.Field.Header
            label="Packages"
            variant="stacking"
            tooltip={descriptions.packages}
          >
            <FormControl>
              {/* <Search.MultiSelect
                value={field.value ?? []}
                onChange={field.onChange}
                options={packages}
                resource="packages"
                placeholder="Search packages"
                invalid={!!fieldState.error}
                autoFocus={autoFocus}
              /> */}
              <span className="text-xs text-content-subdued">TODO</span>
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
  const form = useFormContext<Schemas.Releases.AllValues>()

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
              <KeyValueInput<Schemas.Releases.AllValues>
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
