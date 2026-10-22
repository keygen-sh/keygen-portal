import { useState, useCallback, useRef } from "react"

import { Upload } from "lucide-react"

import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { uploadFile } from "@/lib/upload"

import { Button } from "@/components/ui/button"
import GuardModal from "@/components/guard-modal"

interface ArtifactUploadDialogProps {
  url: string
  open: boolean
  onClose: () => void
}

export default function ArtifactUploadDialog({
  url,
  open,
  onClose,
}: ArtifactUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploaded = progress === 100 && error === null
  const uploading = progress !== null && error === null

  const handleUpload = useCallback(
    async (selected: File) => {
      setProgress(0)
      setError(null)

      try {
        await uploadFile(url, selected, setProgress)
        setProgress(100)
        toast({ message: "File uploaded successfully", variant: "success" })
      } catch (e) {
        const message = e instanceof Error ? e.message : "Upload failed"
        setError(message)
        toast({
          message: "Failed to upload artifact",
          description: message,
          variant: "error",
        })
      }
    },
    [url],
  )

  return (
    <GuardModal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Upload artifact file"
      warning="The artifact will not be available to download until after a file has been uploaded."
      acknowledgment="I understand and/or I have uploaded a file."
      isAcknowledged={uploaded}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-3 rounded border border-accent p-4">
          <span className="truncate text-sm text-content-muted">
            {file ? (
              file.name
            ) : (
              <span className="text-content-subdued italic">
                No file selected.
              </span>
            )}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload />
            Choose file
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null
              e.target.value = ""
              setFile(selected)
              if (selected) void handleUpload(selected)
            }}
          />
        </div>

        {progress !== null && (
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-background-1">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-200 ease-out",
                  error ? "bg-destructive" : "bg-primary",
                )}
                style={{ width: `${error ? 100 : progress}%` }}
              />
            </div>
            <span
              className={cn(
                "text-xs",
                error ? "text-destructive" : "text-content-muted",
              )}
            >
              {error
                ? error
                : progress < 100
                  ? `Uploading... ${progress}%`
                  : "Upload complete"}
            </span>
          </div>
        )}
      </div>
    </GuardModal>
  )
}
