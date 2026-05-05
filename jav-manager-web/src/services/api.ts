import { API_BASE } from "@/lib/constants"

const TOKEN_KEY = "jav-manager-auth-token"

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeRemove(key: string) {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

function getToken(): string | null {
  return safeGet(TOKEN_KEY)
}

function clearToken() {
  safeRemove(TOKEN_KEY)
  safeRemove("jav-manager-auth-expires")
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (token) {
    reqHeaders["X-Auth-Token"] = token
  }

  if (options?.headers) {
    Object.assign(reqHeaders, options.headers)
    delete options.headers
  }

  const res = await fetch(`${API_BASE}${url}`, {
    headers: reqHeaders,
    ...options,
  })

  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new CustomEvent("auth:required"))
    throw new Error("Authentication required")
  }

  if (!res.ok) {
    const text = await res.text()
    try {
      const body = JSON.parse(text)
      throw new Error(body.error || `API error: ${res.status}`)
    } catch (e) {
      if (e instanceof Error && e.message !== `API error: ${res.status}`) throw e
      throw new Error(`API error: ${res.status}`, { cause: e })
    }
  }

  return res.json()
}

export function getMediaUrl(path: string): string {
  const token = getToken()
  const base = getMediaBase()
  if (token) {
    const sep = path.includes("?") ? "&" : "?"
    return `${base}${path}${sep}token=${encodeURIComponent(token)}`
  }
  return `${base}${path}`
}

function getMediaBase(): string {
  const { protocol, hostname } = window.location
  if (protocol === "https:" && /Android/i.test(navigator.userAgent)) {
    const port = parseInt(window.location.port || "5000") + 1
    return `http://${hostname}:${port}/api`
  }
  return API_BASE
}

export const api = { fetch: fetchJson }
export { fetchJson }
