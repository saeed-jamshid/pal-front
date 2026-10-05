const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "")
const API = `${BASE}/api/v1`

const ACCESS_KEY = "pal_access_token"
const REFRESH_KEY = "pal_refresh_token"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string> = {}
  ) {
    super(message)
  }
}

export function getAccessToken() {
  return typeof window === "undefined"
    ? ""
    : (localStorage.getItem(ACCESS_KEY) ?? "")
}
export function isAuthed() {
  return !!getAccessToken()
}
export function safeNextPath(next: string | null) {
  return next?.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !/[\u0000-\u001f]/.test(next)
    ? next
    : "/catalog"
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

async function rawFetch<T>(
  path: string,
  init: RequestInit = {},
  auth = false,
  retried = false
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData))
    headers.set("Content-Type", "application/json")
  if (auth) {
    const token = getAccessToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })
  if (res.status === 401 && auth) {
    if (!retried && (await tryRefresh()))
      return rawFetch(path, init, auth, true)
    clearTokens()
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const fields = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join("، ") : String(value),
      ])
    )
    throw new ApiError(
      res.status,
      fields.detail ??
        fields.non_field_errors ??
        (Object.values(fields).join("، ") || `API ${res.status}: ${path}`),
      fields
    )
  }
  if (res.status === 204) return undefined as T
  return (
    init.headers &&
    new Headers(init.headers).get("Accept") === "application/octet-stream"
      ? res.blob()
      : res.json()
  ) as Promise<T>
}

async function tryRefresh(): Promise<boolean> {
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!refresh) return false
  try {
    const res = await fetch(`${API}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) return false
    const data = await res.json()
    localStorage.setItem(ACCESS_KEY, data.access)
    return true
  } catch {
    return false
  }
}

export const api = {
  get: <T>(path: string, auth = false) => rawFetch<T>(path, {}, auth),
  post: <T>(path: string, body?: unknown, auth = false) =>
    rawFetch<T>(
      path,
      { method: "POST", body: JSON.stringify(body ?? {}) },
      auth
    ),
  upload: <T>(path: string, body: FormData) =>
    rawFetch<T>(path, { method: "POST", body }, true),
  blob: (path: string) =>
    rawFetch<Blob>(
      path,
      { headers: { Accept: "application/octet-stream" } },
      true
    ),
  patch: <T>(path: string, body: unknown) =>
    rawFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }, true),
  delete: <T>(path: string) => rawFetch<T>(path, { method: "DELETE" }, true),
}

export function normalizePhone(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[\s-]/g, "")
}

export type Profile = { id: number; phone_number: string; full_name: string }
export const fetchProfile = () => api.get<Profile>("/auth/me/", true)
export const updateProfile = (full_name: string) =>
  api.patch<Profile>("/auth/me/", { full_name })

// ─── OTP auth ────────────────────────────────────────────────────────────────
export async function requestOtp(phone: string) {
  return api.post("/auth/otp/request/", { phone_number: normalizePhone(phone) })
}
export async function verifyOtp(phone: string, code: string) {
  const data = await api.post<{ access: string; refresh: string }>(
    "/auth/otp/verify/",
    {
      phone_number: normalizePhone(phone),
      code: normalizePhone(code),
    }
  )
  localStorage.setItem(ACCESS_KEY, data.access)
  localStorage.setItem(REFRESH_KEY, data.refresh)
  return data
}
