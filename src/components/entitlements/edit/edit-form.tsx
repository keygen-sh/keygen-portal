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
  Entitlement,
  EntitlementAttributeDescriptions,
} from "@/types/entitlements"

import * as Field from "@/components/field"
import * as Loading from "@/components/loading"
import SectionCard from "@/components/section-card"
import KeyValueInput from "@/components/key-value-input"
import DocumentationLink from "@/components/documentation-link"

interface EditFormProps {
  entitlement: Entitlement | null
  loading?: boolean
  onSubmit: (values: Forms.Entitlements.UpdateValues) => void
  onCancel: () => void
}

export default function EditForm({
  entitlement,
  loading,
  onSubmit,
  onCancel,
}: EditFormProps) {
  const form = useForm<Forms.Entitlements.UpdateValues>({
    resolver: zodResolver(Forms.Entitlements.UpdateSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: entitlement?.attributes.name ?? "",
      code: entitlement?.attributes.code ?? "",
      metadata: entitlement?.attributes.metadata ?? {},
    },
  })

  const handleSubmit = useCallback(
    (values: Forms.Entitlements.UpdateValues) => {
      onSubmit(values)
    },
    [onSubmit],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ScrollArea className="h-[calc(100dvh-8.5rem)] md:h-[45vh]">
          <div className="flex h-full flex-col justify-between px-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      variant="title"
                      placeholder="Enter entitlement name..."
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
                          tooltip={EntitlementAttributeDescriptions.code}
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
                        <FormMessage />
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
                    name="metadata"
                    render={() => (
                      <FormItem>
                        <Field.Header
                          label="Metadata"
                          variant="stacking"
                          optional
                          tooltip={EntitlementAttributeDescriptions.metadata}
                        >
                          <FormControl>
                            <KeyValueInput<Forms.Entitlements.BaseValues> name="metadata" />
                          </FormControl>
                        </Field.Header>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </SectionCard>
          </div>
          <DocumentationLink page="entitlements" />
        </ScrollArea>

        <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="max-w-[12rem] flex-1 basis-1/2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="max-w-[12rem] flex-1 basis-1/2"
            disabled={!form.formState.isValid || loading}
          >
            {loading ? <Loading.Dots className="bg-background" /> : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
