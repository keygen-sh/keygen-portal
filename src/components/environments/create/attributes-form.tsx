import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import * as Forms from "@/forms"
import { EnvironmentAttributeDescriptions } from "@/types/environments"

import * as Field from "@/components/field"
import * as Loading from "@/components/loading"
import SectionCard from "@/components/section-card"
import DocumentationLink from "@/components/documentation-link"

interface AttributesFormProps {
  loading?: boolean
  error?: string | null
  onSubmit: (values: Forms.Environments.AttributesValues) => void
  onCancel: () => void
}

export default function AttributesForm({
  loading,
  error,
  onSubmit,
  onCancel,
}: AttributesFormProps) {
  const form = useForm<Forms.Environments.AttributesValues>({
    resolver: zodResolver(Forms.Environments.AttributesSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
    },
  })

  const handleSubmit = useCallback(
    (values: Forms.Environments.AttributesValues) => {
      onSubmit(values)
    },
    [onSubmit],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ScrollArea className="h-[60vh] md:h-[30vh]">
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
                      placeholder="Enter environment name..."
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

            <SectionCard title="Environment attributes" className="mt-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Code"
                      tooltip={EnvironmentAttributeDescriptions.code}
                      variant="stacking"
                    >
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. sandbox"
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
            </SectionCard>
          </div>
        </ScrollArea>

        <DocumentationLink page="environments" />

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
            {loading ? <Loading.Dots className="bg-background" /> : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
