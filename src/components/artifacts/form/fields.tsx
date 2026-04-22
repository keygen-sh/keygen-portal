import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { Info } from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"

import { useListReleases } from "@/queries/releases"

import * as Schemas from "@/schemas"
import {
  ArtifactFormFieldDescriptions,
  ArtifactCreateFormFieldDescriptions,
  ArtifactEditFormFieldDescriptions,
} from "@/types/artifacts"

import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import * as Search from "@/components/search"
import KeyValueInput from "@/components/key-value-input"

type Descriptions = typeof ArtifactFormFieldDescriptions

interface ArtifactsFormFieldsProps {
  include?: Schemas.Artifacts.FieldNames[]
  exclude?: Schemas.Artifacts.FieldNames[]
  autoFocus?: Schemas.Artifacts.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Artifacts.FieldNames[] = [
  "filename",
  "filetype",
  "filesize",
  "platform",
  "arch",
  "signature",
  "checksum",
  "metadata",
  "releaseId",
]

export default function ArtifactsFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: ArtifactsFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? ArtifactCreateFormFieldDescriptions
      : schema === "edit"
        ? ArtifactEditFormFieldDescriptions
        : ArtifactFormFieldDescriptions

  const fields = include
    ? include
    : INCLUDE_DEFAULT_FIELDS.filter((field) => !exclude.includes(field))

  return (
    <>
      {fields.map((field) => {
        switch (field) {
          case "filename":
            return (
              <FilenameField
                key="filename"
                autoFocus={autoFocus === "filename"}
                titleVariant={titleVariant}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "filetype":
            return (
              <FiletypeField
                key="filetype"
                autoFocus={autoFocus === "filetype"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "filesize":
            return (
              <FilesizeField
                key="filesize"
                autoFocus={autoFocus === "filesize"}
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
          case "arch":
            return (
              <ArchField
                key="arch"
                autoFocus={autoFocus === "arch"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "signature":
            return (
              <SignatureField
                key="signature"
                autoFocus={autoFocus === "signature"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "checksum":
            return (
              <ChecksumField
                key="checksum"
                autoFocus={autoFocus === "checksum"}
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
          case "releaseId":
            return (
              <ReleaseIdField
                key="releaseId"
                autoFocus={autoFocus === "releaseId"}
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

function FilenameField({
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
  const isMobile = useMobile()
  const [nameFocused, setNameFocused] = useState(false)
  const form = useFormContext<Schemas.Artifacts.AllValues>()

  return (
    <FormField
      control={form.control}
      name="filename"
      render={({ field }) => (
        <FormItem>
          {titleVariant ? (
            <Popover open={isMobile && nameFocused}>
              <PopoverAnchor asChild>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    variant="title"
                    placeholder="Enter filename..."
                    className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                    autoFocus={autoFocus ?? (field.value ?? "").length === 0}
                    autoComplete="off"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </FormControl>
              </PopoverAnchor>
              <PopoverContent
                side="bottom"
                align="start"
                className="m-1 w-76 bg-background-4 text-pretty text-content-muted"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <p className="flex gap-1 text-pretty">
                  <Info className="mt-1.5 h-4 w-4 shrink-0" />
                  {descriptions.filename}
                </p>
              </PopoverContent>
            </Popover>
          ) : (
            <Forms.Field.Header
              label="Filename"
              variant={fieldVariant}
              tooltip={descriptions.filename}
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. my-app-1.0.0.tar.gz"
                  autoFocus={autoFocus}
                  autoComplete="off"
                />
              </FormControl>
            </Forms.Field.Header>
          )}
          <FormMessage className={titleVariant ? "ml-2" : undefined} />
          <p className="ml-2 hidden items-center gap-1 text-sm text-content-normal md:flex">
            <Info className="mt-0.25 h-4 w-4 shrink-0" />
            {descriptions.filename}
          </p>
        </FormItem>
      )}
    />
  )
}

function FiletypeField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Artifacts.AllValues>()

  return (
    <FormField
      control={form.control}
      name="filetype"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Filetype"
            variant={fieldVariant}
            tooltip={descriptions.filetype}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="e.g. tar.gz"
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

function FilesizeField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Artifacts.AllValues>()

  return (
    <FormField
      control={form.control}
      name="filesize"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Filesize"
            variant={fieldVariant}
            tooltip={descriptions.filesize}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                type="number"
                placeholder="e.g. 3097"
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

function PlatformField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Artifacts.AllValues>()

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
                value={field.value ?? ""}
                placeholder="e.g. linux"
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

function ArchField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Artifacts.AllValues>()

  return (
    <FormField
      control={form.control}
      name="arch"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Architecture"
            variant={fieldVariant}
            tooltip={descriptions.arch}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="e.g. amd64"
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

function SignatureField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Artifacts.AllValues>()

  return (
    <FormField
      control={form.control}
      name="signature"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Signature"
            variant={fieldVariant}
            tooltip={descriptions.signature}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Ed25519ph signature (base64)"
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

function ChecksumField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Artifacts.AllValues>()

  return (
    <FormField
      control={form.control}
      name="checksum"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Checksum"
            variant={fieldVariant}
            tooltip={descriptions.checksum}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="SHA-512 checksum (base64)"
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

function ReleaseIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Artifacts.CreateValues>()

  const { data: releases = [], isLoading: releasesLoading } = useListReleases()

  if (releasesLoading) {
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
      name="releaseId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Release"
            variant={fieldVariant}
            tooltip={descriptions.releaseId}
          >
            <FormControl>
              <Search.Select
                resource="releases"
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                options={releases}
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
  const form = useFormContext<Schemas.Artifacts.AllValues>()

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
              <KeyValueInput<Schemas.Artifacts.AllValues>
                name="metadata"
                autoFocus={autoFocus}
              />
            </FormControl>
          </Forms.Field.Header>
        </FormItem>
      )}
    />
  )
}
