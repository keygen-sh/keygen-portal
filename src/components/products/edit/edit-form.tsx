import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

import { Info } from "lucide-react"

import {
  Product,
  KnownPlatforms,
  Permissions,
  DistributionStrategy,
  ProductDescription,
} from "@/types/products"

import { useMobile } from "@/hooks/use-mobile"
import SectionCard from "@/components/section-card"
import * as Loading from "@/components/loading"
import TagInput from "@/components/tag-input"
import MetaInput from "@/components/meta-input"
import MultiSelect from "@/components/multi-select"

export const editSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  code: z.string().optional(),
  url: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => !v || z.string().url().safeParse(v).success, {
      message: "Must be a valid URL",
    }),
  distributionStrategy: z.nativeEnum(DistributionStrategy),
  platforms: z.array(z.string()).default([]).optional(),
  permissions: z.array(z.string()).default([]).optional(),
  metadata: z.record(z.string()).default({}).optional(),
})

export type EditFormValues = z.infer<typeof editSchema>

interface EditFormProps {
  product: Product | null
  loading?: boolean
  onDescriptionChange?: (description: ProductDescription) => void
  onSubmit: (values: EditFormValues) => void
  onCancel: () => void
}

export default function EditForm({
  product,
  loading,
  onDescriptionChange,
  onSubmit,
  onCancel,
}: EditFormProps) {
  const isMobile = useMobile()

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: product?.attributes.name ?? "",
      code: product?.attributes.code ?? "",
      url: product?.attributes.url ?? "",
      distributionStrategy:
        product?.attributes.distributionStrategy ??
        DistributionStrategy.LICENSED,
      platforms: product?.attributes.platforms ?? [],
      permissions: product?.attributes.permissions ?? [],
      metadata: product?.attributes.metadata ?? {},
    },
  })

  const handleSubmit = useCallback(
    (values: EditFormValues) => {
      onSubmit(values)
    },
    [onSubmit],
  )

  return (
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Code</FormLabel>
                          {isMobile ? (
                            <Popover>
                              <PopoverTrigger
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="size-5 text-content-subdued" />
                              </PopoverTrigger>
                              <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                                This can be used to lookup the product by a
                                human-readable identifier.
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-4 pt-0.5 text-content-subdued" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-80 bg-background-4 text-content-muted">
                                This can be used to lookup the product by a
                                human-readable identifier.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-2">
                          <FormLabel>URL</FormLabel>
                          <span className="text-xs text-content-subdued">
                            Optional
                          </span>
                        </div>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="distributionStrategy"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Distribution Strategy</FormLabel>
                          {isMobile ? (
                            <Popover>
                              <PopoverTrigger
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="size-5 text-content-subdued" />
                              </PopoverTrigger>
                              <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                                The distribution strategy for releases.
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-4 pt-0.5 text-content-subdued" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-80 bg-background-4 text-content-muted">
                                The distribution strategy for releases.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>

                        <Select
                          value={field.value}
                          disabled={loading}
                          onValueChange={(value) => {
                            field.onChange(value as DistributionStrategy)

                            switch (value) {
                              case DistributionStrategy.LICENSED:
                                onDescriptionChange?.(
                                  ProductDescription.LICENSED_UPDATE,
                                )
                                break
                              case DistributionStrategy.OPEN:
                                onDescriptionChange?.(
                                  ProductDescription.OPEN_UPDATE,
                                )
                                break
                              case DistributionStrategy.CLOSED:
                                onDescriptionChange?.(
                                  ProductDescription.CLOSED_UPDATE,
                                )
                                break
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectItem value={DistributionStrategy.LICENSED}>
                              Licensed
                            </SelectItem>
                            <SelectItem value={DistributionStrategy.OPEN}>
                              Open
                            </SelectItem>
                            <SelectItem value={DistributionStrategy.CLOSED}>
                              Closed
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platforms"
                    render={() => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-2">
                          <FormLabel>Platforms</FormLabel>
                          <span className="text-xs text-content-subdued">
                            Optional
                          </span>
                        </div>
                        <TagInput
                          name="platforms"
                          placeholder=""
                          options={KnownPlatforms}
                        />
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
                        <div className="flex items-center gap-2">
                          <FormLabel>Permissions</FormLabel>
                          {isMobile ? (
                            <Popover>
                              <PopoverTrigger
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="size-5 text-content-subdued" />
                              </PopoverTrigger>
                              <PopoverContent className="ml-2 max-w-72 bg-background-4 text-content-muted">
                                The permissions for the product. Leave blank to
                                use defaults.
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-4 pt-0.5 text-content-subdued" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-52 bg-background-4 text-content-muted">
                                The permissions for the product. Leave blank to
                                use defaults.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metadata"
                    render={() => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <FormLabel>Metadata</FormLabel>

                            {isMobile ? (
                              <Popover>
                                <PopoverTrigger
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Info className="size-5 text-content-subdued" />
                                </PopoverTrigger>
                                <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                                  Store arbitrary key/value data on the product
                                  for book keeping purposes, additional product
                                  info, etc.
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="size-4 pt-0.5 text-content-subdued" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 bg-background-4 text-content-muted">
                                  Store arbitrary key/value data on the product
                                  for book keeping purposes, additional product
                                  info, etc.
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <span className="text-xs text-content-subdued">
                            Optional
                          </span>
                        </div>
                        <FormControl>
                          <MetaInput disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        </ScrollArea>

        <p className="hidden flex-wrap items-center gap-1 p-4 text-sm text-content-subdued md:flex">
          To learn more about products, see the{" "}
          <Button asChild variant="link" size="link">
            <a
              href="https://keygen.sh/docs/api/products/"
              target="_blank"
              rel="noreferrer"
            >
              documentation
            </a>
          </Button>{" "}
          for more information.
        </p>

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
