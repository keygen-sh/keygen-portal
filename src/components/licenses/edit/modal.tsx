import { useParams } from "@tanstack/react-router"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import * as Forms from "@/forms"

import { useGetLicense, useUpdateLicense } from "@/queries/licenses"

import EditForm from "./edit-form"
import * as Loading from "@/components/loading"

interface LicensesEditModalProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export default function LicensesEditModal({
  open,
  onOpenChange,
}: LicensesEditModalProps) {
  const { licenseId } = useParams({ from: "/$id/app/licenses/$licenseId" })
  const {
    data: license,
    isLoading: licenseLoading,
    isError: licenseError,
  } = useGetLicense(licenseId)
  const updateLicense = useUpdateLicense(licenseId)

  const handleUpdateLicense = (values: Forms.Licenses.UpdateValues) => {
    if (!license) return
    updateLicense.mutate(values, {
      onSuccess: () => {
        toast({ message: "License updated", variant: "success" })
        onOpenChange(false)
      },
      onError: () =>
        toast({ message: "Failed to update license", variant: "error" }),
      onSettled() {
        if (!updateLicense.isError) {
          onOpenChange(false)
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="min-h-screen min-w-screen rounded-none border-none"
      >
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-8 items-center space-x-1 text-xs">
            Updating an existing license
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {licenseLoading ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : licenseError ? (
          <p className="text-center text-sm text-red-500">
            Failed to load policy.
          </p>
        ) : (
          open &&
          license && (
            <EditForm
              license={license}
              onUpdate={handleUpdateLicense}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
