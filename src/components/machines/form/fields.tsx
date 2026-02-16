import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import * as Schemas from "@/schemas"

import { useListGroups } from "@/queries/groups"
import { useListLicenses } from "@/queries/licenses"

import {
  MachineFormFieldDescriptions,
  MachineCreateFormFieldDescriptions,
  MachineEditFormFieldDescriptions,
} from "@/types/machines"

import * as Forms from "@/components/forms"
import SearchSelect from "@/components/search-select"
import KeyValueInput from "@/components/key-value-input"


type FieldVariant = "row" | "stacking" | "inline" | "none"
type Descriptions = typeof MachineFormFieldDescriptions

interface MachinesFormFieldsProps {
  include?: Schemas.Machines.FieldNames[]
  exclude?: Schemas.Machines.FieldNames[]
  autoFocus?: Schemas.Machines.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const DefaultFieldSort: Schemas.Machines.FieldNames[] = [
  "name",
  "fingerprint",
  "licenseId",
  "platform",
  "hostname",
  "ip",
  "cores",
  "memory",
  "disk",
  "metadata",
  "groupId",
  "ownerId",
]

export default function MachinesFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: MachinesFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? MachineCreateFormFieldDescriptions
      : schema === "edit"
        ? MachineEditFormFieldDescriptions
        : MachineFormFieldDescriptions

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
          case "fingerprint":
            return (
              <FingerprintField
                key="fingerprint"
                autoFocus={autoFocus === "fingerprint"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "licenseId":
            return (
              <LicenseIdField
                key="licenseId"
                autoFocus={autoFocus === "licenseId"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "platform":
            return (
              <PlatformField
                key="platform"
                autoFocus={autoFocus === "platform"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "hostname":
            return (
              <HostnameField
                key="hostname"
                autoFocus={autoFocus === "hostname"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "ip":
            return (
              <IpField
                key="ip"
                autoFocus={autoFocus === "ip"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "cores":
            return (
              <CoresField
                key="cores"
                autoFocus={autoFocus === "cores"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "memory":
            return (
              <MemoryField
                key="memory"
                autoFocus={autoFocus === "memory"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "disk":
            return (
              <DiskField
                key="disk"
                autoFocus={autoFocus === "disk"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
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
          case "groupId":
            return (
              <GroupIdField
                key="groupId"
                autoFocus={autoFocus === "groupId"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "ownerId":
            return (
              <OwnerIdField
                key="ownerId"
                autoFocus={autoFocus === "ownerId"}
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
  const form = useFormContext<Schemas.Machines.BaseValues>()

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
                value={field.value || ""}
                variant="title"
                placeholder="Enter machine name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Machine name"
              variant={fieldVariant}
              tooltip={descriptions.name}
              optional
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter machine name..."
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

function FingerprintField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.CreateValues>()

  return (
    <FormField
      control={form.control}
      name="fingerprint"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Fingerprint"
            variant={fieldVariant}
            tooltip={descriptions.fingerprint}
          >
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                placeholder="Enter machine fingerprint..."
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

function LicenseIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.CreateValues>()

  const { data: licenses = [] } = useListLicenses()

  return (
    <FormField
      control={form.control}
      name="licenseId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="License"
            variant={fieldVariant}
            tooltip={descriptions.license}
          >
            <SearchSelect
              resource="license"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={licenses}
              allowClear={false}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function PlatformField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="platform"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Platform"
            variant={fieldVariant}
            tooltip={descriptions.platform}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                placeholder="Enter platform..."
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

function HostnameField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="hostname"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Hostname"
            variant={fieldVariant}
            tooltip={descriptions.hostname}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                placeholder="Enter hostname..."
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

function IpField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="ip"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="IP address"
            variant={fieldVariant}
            tooltip={descriptions.ip}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                placeholder="Enter IP address..."
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

function CoresField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="cores"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Cores"
            variant={fieldVariant}
            tooltip={descriptions.cores}
            optional
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 4"
                {...field}
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? null : Number(value))
                }}
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MemoryField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="memory"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Memory"
            variant={fieldVariant}
            tooltip={descriptions.memory}
            optional
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 8"
                {...field}
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? null : Number(value))
                }}
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function DiskField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="disk"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Disk"
            variant={fieldVariant}
            tooltip={descriptions.disk}
            optional
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 256"
                {...field}
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? null : Number(value))
                }}
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
  const form = useFormContext<Schemas.Machines.BaseValues>()

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
          >
            <FormControl>
              <KeyValueInput<Schemas.Machines.BaseValues>
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

function GroupIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.BaseValues>()
  const { data: groups = [] } = useListGroups()

  return (
    <FormField
      control={form.control}
      name="groupId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Group"
            variant={fieldVariant}
            tooltip={descriptions.group}
            optional
          >
            <SearchSelect
              resource="group"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={groups}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function OwnerIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Machines.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="ownerId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Owner"
            variant={fieldVariant}
            tooltip={descriptions.owner}
            optional
          >
            <SearchSelect
              resource="user"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={[]}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
