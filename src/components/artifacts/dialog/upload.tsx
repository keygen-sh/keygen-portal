import { useState, useCallback, useRef } from "react"

import { Upload } from "lucide-react"

import { toast } from "@/lib/toast"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploaded = progress === 100

  const handleUpload = useCallback(
    async (selected: File) => {
      setProgress(0)

      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", url)

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100)
            toast({ message: "File uploaded successfully", variant: "success" })
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"))
        })

        xhr.send(selected)
      })
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
            disabled={progress !== null}
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
              setFile(selected)
              if (selected) void handleUpload(selected)
            }}
          />
        </div>

        {progress !== null && (
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-background-1">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-content-muted">
              {progress < 100 ? `Uploading... ${progress}%` : "Upload complete"}
            </span>
          </div>
        )}
      </div>
    </GuardModal>
  )
}
