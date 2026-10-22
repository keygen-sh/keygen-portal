const UTF8_BOM = "\uFEFF"

export function downloadBlob(
  content: string,
  filename: string,
  type = "application/octet-stream",
) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadCsv(content: string, filename: string) {
  downloadBlob(`${UTF8_BOM}${content}`, filename, "text/csv;charset=utf-8")
}

export async function openDownloadUrl(getUrl: () => Promise<string>) {
  const win = window.open("about:blank", "_blank")
  if (win) win.opener = null

  try {
    const url = await getUrl()

    if (win) {
      win.location.replace(url)
    } else {
      window.location.assign(url)
    }
  } catch (error) {
    win?.close()
    throw error
  }
}
