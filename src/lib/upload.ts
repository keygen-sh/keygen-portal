export function uploadFile(
  url: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error("Unable to upload to the storage bucket."))
      }
    })

    xhr.addEventListener("error", () => {
      reject(new Error("Could not reach the storage bucket."))
    })

    xhr.send(file)
  })
}
