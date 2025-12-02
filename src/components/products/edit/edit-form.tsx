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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import { Info, Award, Lock, Unlock } from "lucide-react"

import * as Forms from "@/forms"
import {
  Product,
  KnownPlatforms,
  Permissions,
  DistributionStrategy,
} from "@/types/products"

import { useMobile } from "@/hooks/use-mobile"

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
  onSubmit: (values: Forms.Products.BaseValues) => void
  onCancel: () => void
}

export default function EditForm({
  product,
  loading,
  onSubmit,
  onCancel,
}: EditFormProps) {
  const isMobile = useMobile()

  const form = useForm<Forms.Products.BaseValues>({
    resolver: zodResolver(Forms.Products.BaseSchema),
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
    (values: Forms.Products.BaseValues) => {
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
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              <SelectItem value={DistributionStrategy.Licensed}>
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
                                  The permissions for the product. Leave blank
                                  to use defaults.
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="size-4 pt-0.5 text-content-subdued" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-52 bg-background-4 text-content-muted">
                                  The permissions for the product. Leave blank
                                  to use defaults.
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
                                    Store arbitrary key/value data on the
                                    product for book keeping purposes,
                                    additional product info, etc.
                                  </PopoverContent>
                                </Popover>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="size-4 pt-0.5 text-content-subdued" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-80 bg-background-4 text-content-muted">
                                    Store arbitrary key/value data on the
                                    product for book keeping purposes,
                                    additional product info, etc.
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <span className="text-xs text-content-subdued">
                              Optional
                            </span>
                          </div>
                          <FormControl>
                            <KeyValueInput<Forms.Products.BaseValues>
                              name="metadata"
                              disabled={loading}
                            />
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
