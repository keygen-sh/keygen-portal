import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import { Award, Lock, Unlock } from "lucide-react"

import * as Forms from "@/forms"
import {
  Product,
  KnownPlatforms,
  Permissions,
  DistributionStrategy,
  ProductAttributeDescriptions,
} from "@/types/products"

import * as Field from "@/components/field"
import * as Loading from "@/components/loading"
import TagInput from "@/components/tag-input"
import MultiSelect from "@/components/multi-select"
import SectionCard from "@/components/section-card"
import KeyValueInput from "@/components/key-value-input"
import DocumentationLink from "@/components/documentation-link"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"

interface EditFormProps {
  product: Product | null
  loading?: boolean
  onSubmit: (values: Forms.Products.UpdateValues) => void
  onCancel: () => void
}

export default function EditForm({
  product,
  loading,
  onSubmit,
  onCancel,
}: EditFormProps) {
  const form = useForm<Forms.Products.UpdateValues>({
    resolver: zodResolver(Forms.Products.UpdateSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: product?.attributes.name ?? "",
      code: product?.attributes.code ?? "",
      url: product?.attributes.url ?? "",
      distributionStrategy:
        product?.attributes.distributionStrategy ??
        DistributionStrategy.Licensed,
      platforms: product?.attributes.platforms ?? [],
      permissions: product?.attributes.permissions ?? [],
      metadata: product?.attributes.metadata ?? {},
    },
  })

  const strategy = form.watch("distributionStrategy")

  const handleSubmit = useCallback(
    (values: Forms.Products.UpdateValues) => {
      onSubmit(values)
    },
    [onSubmit],
  )

  return (
    <>
      <DialogHeader className="h-fit border-b border-accent p-2">
        <DialogDescription className="flex h-5 items-center text-xs">
          <BadgeGroup prefix="Updating a" suffix="product">
            {strategy === DistributionStrategy.Licensed && (
              <BadgeGroupItem>
                <Award />
                Licensed
              </BadgeGroupItem>
            )}
            {strategy === DistributionStrategy.Open && (
              <BadgeGroupItem>
                <Unlock />
                Open
              </BadgeGroupItem>
            )}
            {strategy === DistributionStrategy.Closed && (
              <BadgeGroupItem>
                <Lock />
                Closed
              </BadgeGroupItem>
            )}
          </BadgeGroup>
        </DialogDescription>

        <DialogTitle>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Update product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <ScrollArea className="h-[60vh] md:h-fit md:w-3xl">
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
                          <FormMessage />
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="distributionStrategy"
                      render={({ field }) => (
                        <FormItem>
                          <Field.Header
                            label="Distribution Strategy"
                            tooltip={
                              ProductAttributeDescriptions.distributionStrategy
                            }
                            variant="stacking"
                          >
                            <Select
                              value={field.value}
                              disabled={loading}
                              onValueChange={(value) => {
                                field.onChange(value as DistributionStrategy)
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectItem
                                  value={DistributionStrategy.Licensed}
                                >
                                  Licensed
                                </SelectItem>
                                <SelectItem value={DistributionStrategy.Open}>
                                  Open
                                </SelectItem>
                                <SelectItem value={DistributionStrategy.Closed}>
                                  Closed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </Field.Header>
                          <FormMessage />
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

                          <FormMessage />
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
                          <FormMessage />
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
    </>
  )
}
