import { useGetAccount } from "@/queries/accounts"

export function useCloud(): { isCloud: boolean; isLoading: boolean } {
  const { data: account, isLoading } = useGetAccount()

  const isCloud = !!(
    account?.relationships.plan?.data?.id ??
    account?.relationships.billing?.data?.id
  )

  return { isCloud, isLoading }
}
