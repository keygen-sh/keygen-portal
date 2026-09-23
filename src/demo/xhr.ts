export const MOCK_UPLOAD_ORIGIN = "https://uploads.demo.keygen.invalid"

const UPLOAD_STEPS = 6
const UPLOAD_STEP_DELAY = 120

type UploadBody = Document | XMLHttpRequestBodyInit | null
type UploadListener = (url: string, body: UploadBody) => void

interface DemoUploadState {
  url: string
  status: number
  readyState: number
}

const uploadListeners = new Set<UploadListener>()
const uploads = new WeakMap<XMLHttpRequest, DemoUploadState>()

export function onMockUpload(listener: UploadListener): () => void {
  uploadListeners.add(listener)
  return () => uploadListeners.delete(listener)
}

function bodySize(body: UploadBody | undefined): number {
  if (body instanceof Blob) return body.size
  if (typeof body === "string") return body.length
  return 1
}

export function installMockUploadShim(): void {
  const Original = window.XMLHttpRequest
  const prototype = Original.prototype

  class DemoXMLHttpRequest extends Original {
    override open(
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null,
    ): void {
      const target = String(url)
      if (target.startsWith(MOCK_UPLOAD_ORIGIN)) {
        uploads.set(this, { url: target, status: 0, readyState: 1 })
        return
      }
      super.open(method, url, async, username, password)
    }

    override setRequestHeader(name: string, value: string): void {
      if (uploads.has(this)) return
      super.setRequestHeader(name, value)
    }

    override send(body?: UploadBody): void {
      const state = uploads.get(this)
      if (!state) {
        super.send(body)
        return
      }

      const total = bodySize(body)
      let step = 0

      const tick = (): void => {
        step += 1
        const loaded = Math.round((total * step) / UPLOAD_STEPS)
        this.upload.dispatchEvent(
          new ProgressEvent("progress", {
            lengthComputable: true,
            loaded,
            total,
          }),
        )

        if (step < UPLOAD_STEPS) {
          window.setTimeout(tick, UPLOAD_STEP_DELAY)
          return
        }

        state.status = 200
        state.readyState = 4
        for (const listener of uploadListeners)
          listener(state.url, body ?? null)

        this.dispatchEvent(new Event("readystatechange"))
        this.dispatchEvent(
          new ProgressEvent("load", {
            lengthComputable: true,
            loaded: total,
            total,
          }),
        )
        this.dispatchEvent(
          new ProgressEvent("loadend", {
            lengthComputable: true,
            loaded: total,
            total,
          }),
        )
      }

      window.setTimeout(tick, UPLOAD_STEP_DELAY)
    }
  }

  function native<T>(self: XMLHttpRequest, name: string): T {
    return Reflect.get(prototype, name, self) as T
  }

  Object.defineProperties(DemoXMLHttpRequest.prototype, {
    status: {
      configurable: true,
      get(this: XMLHttpRequest) {
        return uploads.get(this)?.status ?? native<number>(this, "status")
      },
    },
    readyState: {
      configurable: true,
      get(this: XMLHttpRequest) {
        return (
          uploads.get(this)?.readyState ?? native<number>(this, "readyState")
        )
      },
    },
    responseText: {
      configurable: true,
      get(this: XMLHttpRequest) {
        return uploads.has(this) ? "" : native<string>(this, "responseText")
      },
    },
  })

  window.XMLHttpRequest = DemoXMLHttpRequest
}
