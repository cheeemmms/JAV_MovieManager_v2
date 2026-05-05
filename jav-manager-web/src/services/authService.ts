import { fetchJson } from "./api"

const TOKEN_KEY = "jav-manager-auth-token"
const EXPIRES_KEY = "jav-manager-auth-expires"

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

function safeRemove(key: string) {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

export function getToken(): string | null {
  return safeGet(TOKEN_KEY)
}

export function setToken(token: string, expiresAt: string) {
  safeSet(TOKEN_KEY, token)
  safeSet(EXPIRES_KEY, expiresAt)
}

export function clearToken() {
  safeRemove(TOKEN_KEY)
  safeRemove(EXPIRES_KEY)
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  const expires = safeGet(EXPIRES_KEY)
  if (expires && new Date(expires) < new Date()) {
    clearToken()
    return false
  }
  return true
}

export async function login(password: string): Promise<{ token: string; expiresAt: string }> {
  const res = await fetchJson<{ token: string; expiresAt: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  })
  setToken(res.token, res.expiresAt)
  return res
}

export async function logout(): Promise<void> {
  try {
    await fetchJson("/auth/logout", { method: "POST" })
  } catch {
    // ignore errors on logout
  }
  clearToken()
}

export async function getAuthStatus(): Promise<{ hasPassword: boolean; activeSessions: number }> {
  return fetchJson("/auth/status")
}

export async function setPassword(password: string): Promise<void> {
  await fetchJson("/auth/set-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  })
}

export async function setPasswordViaSettings(password: string): Promise<void> {
  await fetchJson("/settings/password", {
    method: "PUT",
    body: JSON.stringify({ password }),
  })
}

export async function getRemoteAccessConfig(): Promise<{ enabled: boolean; localIPs: string[] }> {
  return fetchJson("/settings/remote-access")
}

export async function getNetworkInfo(): Promise<{
  localIPs: string[]
  port: number
  portForwardingDetected: boolean
}> {
  return fetchJson("/settings/network-info")
}

export async function getSessions(): Promise<{
  id: number
  deviceType: string
  createdAt: string
  expiresAt: string
  lastActiveAt: string
}[]> {
  return fetchJson("/settings/sessions")
}

export async function revokeSession(id: number): Promise<void> {
  await fetchJson(`/settings/sessions/${id}`, { method: "DELETE" })
}

export async function revokeAllSessions(): Promise<void> {
  await fetchJson("/settings/sessions", { method: "DELETE" })
}
