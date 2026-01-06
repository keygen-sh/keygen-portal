import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import * as Forms from "@/forms"
import {
  KnownPlatforms,
  Permissions,
  ProductAttributeDescriptions,
} from "@/types/products"

import * as Field from "@/components/field"
import * as Loading from "@/components/loading"
import TagInput from "@/components/tag-input"
import MultiSelect from "@/components/multi-select"
import SectionCard from "@/components/section-card"
import KeyValueInput from "@/components/key-value-input"
import DocumentationLink from "@/components/documentation-link"

interface AttributesFormProps {
  loading?: boolean
  error?: string | null
  onSubmit: (values: Forms.Products.AttributesValues) => void
  onCancel: () => void
}

export default function AttributesForm({
  loading,
  error,
  onSubmit,
  onCancel,
}: AttributesFormProps) {
  const form = useForm<Forms.Products.AttributesValues>({
    resolver: zodResolver(Forms.Products.AttributesSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      url: "",
      platforms: [],
      permissions: [],
      metadata: {},
    },
  })

  const handleSubmit = useCallback(
    (values: Forms.Products.AttributesValues) => {
      onSubmit(values)
    },
    [onSubmit],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ScrollArea className="h-[60vh] md:h-[45vh]">
          <div className="flex h-full flex-col justify-between p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      variant="title"
                      placeholder="Enter product name..."
                      className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                      autoFocus
                      autoComplete="off"
                      disabled={loading}
                      onChange={(e) => {
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SectionCard title="Attributes" className="mt-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <Field.Header
                          label="Code"
                          tooltip={ProductAttributeDescriptions.code}
                          variant="stacking"
                        >
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="example"
                              disabled={loading}
                              onChange={(e) => {
                                field.onChange(e)
                              }}
                            />
                          </FormControl>
                        </Field.Header>
                        <FormMessage>{error || ""}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <Field.Header
                          label="URL"
                          tooltip={ProductAttributeDescriptions.url}
                          variant="stacking"
                          optional
                        >
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://example.com"
                              disabled={loading}
                              onChange={(e) => {
                                field.onChange(e)
                              }}
                            />
                          </FormControl>
                        </Field.Header>
                        <FormMessage>{error || ""}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platforms"
                    render={() => (
                      <FormItem>
                        <Field.Header
                          label="Platforms"
                          tooltip={ProductAttributeDescriptions.platforms}
                          variant="stacking"
                          optional
                        >
                          <TagInput
                            name="platforms"
                            placeholder=""
                            options={KnownPlatforms}
                            disabled={loading}
                          />
                        </Field.Header>
                        <FormMessage>{error || ""}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mx-4 hidden md:block">
                  <Separator orientation="vertical" dashed={true} />
                </div>
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                      <FormItem>
                        <Field.Header
                          label="Permissions"
                          tooltip={ProductAttributeDescriptions.permissions}
                          variant="stacking"
                        >
                          <MultiSelect
                            value={field.value ?? []}
                            onChange={field.onChange}
                            options={Permissions.map((p) => ({
                              label: p === "*" ? "*" : p,
                              value: p,
                            }))}
                            wildcard="*"
                            placeholder=""
                            disabled={loading}
                          />
                        </Field.Header>

                        <FormMessage>{error || ""}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metadata"
                    render={() => (
                      <FormItem>
                        <Field.Header
                          label="Metadata"
                          tooltip={ProductAttributeDescriptions.metadata}
                          variant="stacking"
                          optional
                        >
                          <FormControl>
                            <KeyValueInput<Forms.Products.AttributesValues>
                              name="metadata"
                              disabled={loading}
                            />
                          </FormControl>
                        </Field.Header>
                        <FormMessage>{error || ""}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        </ScrollArea>

        <DocumentationLink page="products" />

        <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="max-w-48 flex-1 basis-1/2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="max-w-48 flex-1 basis-1/2"
            disabled={!form.formState.isValid || loading}
          >
            {loading ? <Loading.Dots className="bg-background" /> : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
