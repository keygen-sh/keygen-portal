import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"

import { useListProducts } from "@/queries/products"

import {
  PolicyFormValues,
  PolicyAttributeDescriptions,
  PolicyOptionLabels,
  AuthenticationStrategy,
} from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import KeyValueInput from "@/components/key-value-input"

type Layout = "default" | "advanced"

interface GeneralFieldsProps {
  layout?: Layout
  title?: string
  includeMeta?: boolean
  includeAuthStrategy?: boolean
  className?: string
}

export default function GeneralFields({
  layout = "default",
  title,
  includeMeta = true,
  includeAuthStrategy = true,
  className,
}: GeneralFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout
      includeAuthStrategy={includeAuthStrategy}
      includeMeta={includeMeta}
      className={className}
    />
  ) : (
    <DefaultLayout
      title={title}
      includeAuthStrategy={includeAuthStrategy}
      includeMeta={includeMeta}
      className={className}
    />
  )
}

function DefaultLayout({
  title,
  includeMeta = true,
  includeAuthStrategy = true,
  className,
}: Omit<GeneralFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  const { data: products = [], isLoading: productsLoading } = useListProducts()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <Field.Header label="Policy name" variant="stacking">
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter policy name..."
                  autoComplete="off"
                />
              </FormControl>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="product.attach"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Product relationship"
              variant="stacking"
              tooltip="The product to which this policy belongs."
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(value === "" ? undefined : value)
                }
                disabled={productsLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select product..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.length === 0 ? (
                    <SelectItem value="" disabled>
                      {productsLoading ? "Loading…" : "No products found"}
                    </SelectItem>
                  ) : (
                    products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.attributes.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      {includeAuthStrategy && (
        <FormField
          control={form.control}
          name="authenticationStrategy"
          render={({ field }) => (
            <FormItem>
              <Field.Header
                label="Authentication strategy"
                variant="stacking"
                tooltip={PolicyAttributeDescriptions.authenticationStrategy}
              >
                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) =>
                    field.onChange(
                      value === ""
                        ? undefined
                        : (value as AuthenticationStrategy),
                    )
                  }
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select one..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(AuthenticationStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.authenticationStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field.Header>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {includeMeta && (
        <FormField
          control={form.control}
          name="metadata"
          render={() => (
            <FormItem>
              <Field.Header label="Metadata" variant="stacking">
                <FormControl>
                  <KeyValueInput<PolicyFormValues> name="metadata" />
                </FormControl>
              </Field.Header>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

function AdvancedLayout({
  includeMeta = true,
  includeAuthStrategy = true,
  className,
}: Omit<GeneralFieldsProps, "layout" | "title">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  const { data: products = [], isLoading: productsLoading } = useListProducts()

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="m-4 md:my-6">
            <FormControl>
              <Input
                {...field}
                variant="title"
                placeholder="Enter policy name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={field.value.length === 0}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage className="ml-2" />
          </FormItem>
        )}
      />

      <SectionCard title="General policy attributes">
        <>
          <FormField
            control={form.control}
            name="product.attach"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Product relationship"
                  variant="stacking"
                  tooltip="The product to which this policy belongs."
                >
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(value === "" ? undefined : value)
                    }
                    disabled={productsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select product..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="" disabled>
                          {productsLoading ? "Loading..." : "No products found"}
                        </SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.attributes.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          {includeAuthStrategy && (
            <FormField
              control={form.control}
              name="authenticationStrategy"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Authentication strategy"
                    variant="stacking"
                    tooltip={PolicyAttributeDescriptions.authenticationStrategy}
                  >
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value) =>
                        field.onChange(
                          value === ""
                            ? undefined
                            : (value as AuthenticationStrategy),
                        )
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select one..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AuthenticationStrategy).map(
                          (strategy) => (
                            <SelectItem key={strategy} value={strategy}>
                              {
                                PolicyOptionLabels.authenticationStrategy[
                                  strategy
                                ]
                              }
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {includeMeta && (
            <FormField
              control={form.control}
              name="metadata"
              render={() => (
                <FormItem>
                  <Field.Header label="Metadata" variant="stacking">
                    <FormControl>
                      <KeyValueInput<PolicyFormValues> name="metadata" />
                    </FormControl>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      </SectionCard>
    </div>
  )
}
