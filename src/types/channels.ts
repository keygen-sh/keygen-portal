import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export type ChannelAttributes = {
  name: string
  key: string
  created: string
  updated: string
}

export type ChannelRelationships = {
  account: Relationship<Linkage<"accounts">>
}

export type Channel = Resource<
  "channels",
  ChannelAttributes,
  ChannelRelationships
>

export type ChannelResponse = APIResponse<Channel>
export type ChannelsListResponse = APIResponse<Channel[]>
