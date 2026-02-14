import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum EnvironmentErrorCode {
  CodeTaken = "CODE_TAKEN",
}

export enum EnvironmentMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum EnvironmentView {
  List = "list",
  Details = "details",
}

export enum IsolationStrategy {
  Isolated = "ISOLATED",
  Shared = "SHARED",
}

export type EnvironmentAttributes = {
  name: string
  code: string
  isolationStrategy: IsolationStrategy
  created: string
  updated: string
}

export type EnvironmentRelationships = {
  account: Relationship<Linkage<"accounts">>
}

export type Environment = Resource<
  "environments",
  EnvironmentAttributes,
  EnvironmentRelationships
>

export type EnvironmentResponse = APIResponse<Environment>
export type EnvironmentsListResponse = APIResponse<Environment[]>

export const EnvironmentAttributeDescriptions: Readonly<
  Record<keyof Writable<EnvironmentAttributes>, string>
> = {
  name: "Environment name.",
  code: "The unique code for the environment. The code cannot collide with any environments that already exist.",
  isolationStrategy:
    "The isolation strategy used for isolating the environment from other environments.",
} as const

export const EnvironmentFormFieldDescriptions: typeof EnvironmentAttributeDescriptions =
  {
    ...EnvironmentAttributeDescriptions,
  }

export const EnvironmentCreateFormFieldDescriptions: typeof EnvironmentFormFieldDescriptions =
  {
    ...EnvironmentFormFieldDescriptions,
  }

export const EnvironmentEditFormFieldDescriptions: typeof EnvironmentFormFieldDescriptions =
  {
    ...EnvironmentFormFieldDescriptions,
  }

export const IsolationStrategyDescriptions: Readonly<
  Record<IsolationStrategy, string>
> = {
  [IsolationStrategy.Isolated]:
    "The environment will be isolated from all other resources in other environments.",
  [IsolationStrategy.Shared]:
    "The environment will be shared with the global environment. Resources in the global environment will be available as read-only resources.",
} as const
