import { useMemo, useCallback, useState } from "react"
import { useForm, FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import * as Forms from "@/forms"

import { User, UserRole, UserStatus, MockUsers } from "@/types/users"

import { toast } from "@/lib/toast"

import { useSlide } from "@/hooks/use-slide"
import { useMobile } from "@/hooks/use-mobile"

import * as Motion from "@/components/motion"
import * as Users from "@/components/users"
import * as Loading from "@/components/loading"
import StepProgress from "@/components/step-progress"
import DocumentationLink from "@/components/documentation-link"
import CollapsedBreadcrumb from "@/components/collapsed-breadcrumb"

enum Steps {
  Account = "account",
  Profile = "profile",
  Additional = "additional",
}

type StepKey = (typeof Steps)[keyof typeof Steps]

type Step = {
  key: StepKey
  title: string
  fields?: FieldPath<Forms.Users.CreateValues>[]
  render: () => React.ReactElement
}

interface UsersCreateModalProps {
  onSelectUser: (user: User | null) => void
  onClose: () => void
}

export default function UsersCreateModal({
  onSelectUser,
  onClose,
}: UsersCreateModalProps) {
  const isMobile = useMobile()

  const [loading, setLoading] = useState(false)
  const [completedStep, setCompletedStep] = useState<Set<string>>(new Set())

  const form = useForm<Forms.Users.CreateValues>({
    resolver: zodResolver(Forms.Users.CreateSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      firstName: null,
      lastName: null,
      password: null,
      role: UserRole.User,
      permissions: [],
      groupId: null,
      metadata: {},
    },
  })

  const steps: Step[] = useMemo(
    () => [
      {
        key: Steps.Account,
        title: "Account configuration",
        fields: ["email", "password", "permissions"],
        render: () => <Users.Fields.Account />,
      },
      {
        key: Steps.Profile,
        title: "User profile",
        fields: ["firstName", "lastName", "role"],
        render: () => <Users.Fields.Profile />,
      },
      {
        key: Steps.Additional,
        title: "Additional configuration",
        fields: ["groupId", "metadata"],
        render: () => <Users.Fields.Additional />,
      },
    ],
    [],
  )

  const [step, direction, goTo] = useSlide(steps.map((_, i) => i))

  const current = steps[step]
  const last = step === steps.length - 1

  const next = useCallback(async () => {
    if (current.fields?.length) {
      const ok = await form.trigger(current.fields)

      if (!ok) return
    }

    if (step < steps.length - 1) {
      setCompletedStep((prev) => {
        const next = new Set(prev)
        next.add(steps[step].key)

        return next
      })

      goTo(step + 1)
    }
  }, [current, step, steps, goTo, form])

  const back = useCallback(() => {
    if (step > 0) goTo(step - 1)
  }, [step, goTo])

  const handleCreateUser = useCallback(
    (values: Forms.Users.CreateValues) => {
      setLoading(true)

      const firstName = values.firstName ?? null
      const lastName = values.lastName ?? null
      const fullName =
        firstName || lastName
          ? [firstName, lastName].filter(Boolean).join(" ")
          : null

      const newUser: User = {
        id: crypto.randomUUID(),
        type: "users",
        links: {
          self: `/v1/accounts/{ACCOUNT}/users/${crypto.randomUUID()}`,
        },
        attributes: {
          email: values.email,
          firstName,
          lastName,
          fullName,
          status: UserStatus.Active,
          role: values.role ?? UserRole.User,
          permissions: values.permissions ?? [],
          metadata: values.metadata ?? {},
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        relationships: {
          account: {
            links: { related: "/v1/accounts/{ACCOUNT}" },
            data: { type: "accounts", id: "{ACCOUNT}" },
          },
          environment: {
            links: { related: null },
            data: null,
          },
          group: {
            links: {
              related: values.groupId
                ? `/v1/accounts/{ACCOUNT}/groups/${values.groupId}`
                : null,
            },
            data: values.groupId
              ? { type: "groups", id: values.groupId }
              : null,
          },
          products: {
            links: { related: null },
            data: [],
          },
          licenses: {
            links: { related: null },
            data: [],
          },
          machines: {
            links: { related: null },
            data: [],
          },
          tokens: {
            links: { related: null },
            data: [],
          },
        },
      }

      MockUsers.push(newUser)
      setLoading(false)
      toast({ message: "User created", variant: "success" })
      onSelectUser(newUser)
      onClose()
    },
    [onSelectUser, onClose],
  )

  return (
    <DialogContent className="min-w-fit">
      <DialogHeader className="h-fit items-start border-b border-accent p-2">
        <DialogDescription className="text-xs">
          Creating a new user
        </DialogDescription>
        <DialogTitle className="w-full">
          {!isMobile && (
            <CollapsedBreadcrumb
              crumb={steps}
              step={step}
              goTo={goTo}
              className="mt-1"
              visibleSteps={4}
            />
          )}
          {isMobile && (
            <div className="mt-2 w-full px-2">
              <StepProgress
                steps={steps.map((step) => ({
                  key: step.key,
                  label: step.title,
                }))}
                currentIndex={step}
                completedSteps={completedStep}
                orientation="horizontal"
              />
            </div>
          )}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Motion.Slide direction={direction}>
            <ScrollArea
              key={current?.key ?? Steps.Profile}
              className="flex h-[calc(100vh-11rem)] flex-col justify-between md:h-[50vh] md:w-4xl"
            >
              {current && <current.render />}

              <DocumentationLink page="users" />
            </ScrollArea>
          </Motion.Slide>

          <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
            <Button
              variant="outline"
              type="button"
              onClick={step === 0 ? onClose : back}
              disabled={loading}
              className="max-w-48 flex-1 basis-1/2"
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            <Button
              key={last ? "create" : "next"}
              type="button"
              onClick={last ? form.handleSubmit(handleCreateUser) : next}
              disabled={loading}
              className="max-w-48 flex-1 basis-1/2"
            >
              {loading ? (
                <Loading.Dots className="bg-background" />
              ) : last ? (
                "Create"
              ) : (
                "Next step"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
