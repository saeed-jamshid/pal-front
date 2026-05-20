"use client"

import { useState, useEffect, useCallback, useRef } from "react"

const API_URL = "https://palcoffee.ir"
// ─── Types ────────────────────────────────────────────────────────────────────

type StatusChoice = "pending" | "confirmed" | "rejected"

interface User {
  id: string
  full_name: string
  phone_number: string
  age: string
  coffee_preference: string
  status_choices: StatusChoice
  payment_receipt: string
  reference_number: string
  created_at: string
  updated_at: string
}

const STORAGE_CHECKED = "dashboard_checked_users"
const STORAGE_TOKEN = "dashboard_token"
const STORAGE_AUTH = "dashboard_auth"

const DEFAULT_RECEIPT_URL = "/default-receipt.svg" // fallback handled via onError inline SVG

// Inline SVG data URI for truly missing images
const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f5ede0'/%3E%3Ctext x='200' y='160' font-family='sans-serif' font-size='52' text-anchor='middle'%3E🧾%3C/text%3E%3Ctext x='200' y='210' font-family='sans-serif' font-size='13' text-anchor='middle' fill='%23a07040'%3ENo receipt%3C/text%3E%3C/svg%3E"

// ─── Status mapping ───────────────────────────────────────────────────────────

// Persian API values → internal enum
function parseStatus(raw: string | undefined): StatusChoice {
  if (!raw) return "pending"
  if (raw.includes("تایید") || raw === "confirmed") return "confirmed"
  if (raw.includes("رد") || raw === "rejected") return "rejected"
  return "pending"
}

// Internal enum → what the API wants in PATCH body
const STATUS_TO_API: Record<StatusChoice, string> = {
  pending: "pending",
  confirmed: "confirmed",
  rejected: "rejected",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(birthDate: string): string {
  console.log(birthDate)
  if (!birthDate) return "—"
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return "—"
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const notYet =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (notYet) age--
  return `${age}`
}

function fmt(iso: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function statusColorClass(s: StatusChoice) {
  if (s === "confirmed") return "status-confirmed"
  if (s === "rejected") return "status-rejected"
  return "status-pending"
}

/** Age number → YYYY-MM-DD (approximate, using Jan 1 of birth year) */
function ageToBirthDate(age: string): string {
  const n = parseInt(age, 10)
  if (isNaN(n) || n < 1 || n > 120) return ""
  const year = new Date().getFullYear() - n
  return `${year}-01-01`
}

/** Validate and normalise a manually typed date to YYYY-MM-DD */
function normDate(val: string): string {
  // Accept YYYY-MM-DD directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  return ""
}

// ─── Auth token helper ────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(STORAGE_TOKEN) ?? ""
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(API_URL + "/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || data?.message || "Invalid credentials")
      }
      const data = await res.json()
      const token: string = data.access || data.token || data.access_token
      if (!token) throw new Error("No token in response")
      localStorage.setItem(STORAGE_TOKEN, token)
      localStorage.setItem(STORAGE_AUTH, "1")
      onLogin()
    } catch (err: any) {
      setError(err.message || "Login failed")
      setShake(true)
      setTimeout(() => setShake(false), 600)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className={`login-card ${shake ? "shake" : ""}`}>
        <div className="login-logo">☕</div>
        <h1 className="login-title">Admin Portal</h1>
        <p className="login-sub">Sign in to manage signups</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label className="field-label">Username</label>
            <input
              type="text"
              className="field-input"
              placeholder="admin"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError("")
              }}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field-input"
              placeholder="••••••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              autoComplete="current-password"
            />
            {error && <p className="field-error">{error}</p>}
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<StatusChoice, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
}

function StatusBadge({ status }: { status: StatusChoice }) {
  return (
    <span className={`badge ${statusColorClass(status)}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Authenticated image (passes Bearer token in header) ──────────────────────

function AuthImg({
  src,
  alt,
  className,
  token,
  style,
}: {
  src: string
  alt: string
  className?: string
  token: string
  style?: React.CSSProperties
}) {
  const [objectUrl, setObjectUrl] = useState<string>(PLACEHOLDER_SVG)
  const prevUrl = useRef<string>("")

  useEffect(() => {
    if (!src || src === PLACEHOLDER_SVG) {
      setObjectUrl(PLACEHOLDER_SVG)
      return
    }
    let cancelled = false
    // Revoke previous blob if any
    if (prevUrl.current.startsWith("blob:"))
      URL.revokeObjectURL(prevUrl.current)

    fetch(src, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error("img fetch failed")
        return r.blob()
      })
      .then((blob) => {
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        prevUrl.current = url
        setObjectUrl(url)
      })
      .catch(() => {
        if (!cancelled) setObjectUrl(PLACEHOLDER_SVG)
      })

    return () => {
      cancelled = true
    }
  }, [src, token])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevUrl.current.startsWith("blob:"))
        URL.revokeObjectURL(prevUrl.current)
    }
  }, [])

  return <img src={objectUrl} alt={alt} className={className} style={style} />
}

// ─── Receipt Popup ────────────────────────────────────────────────────────────

function ReceiptPopup({
  url,
  name,
  token,
  onClose,
}: {
  url: string
  name: string
  token: string
  onClose: () => void
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <span className="popup-title">🧾 Receipt — {name}</span>
          <button className="popup-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="popup-img-wrap">
          <AuthImg
            src={url}
            alt="Payment receipt"
            className="popup-img"
            token={token}
          />
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="popup-open-link"
          >
            Open original ↗
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Add User Modal ───────────────────────────────────────────────────────────

type BirthMode = "age" | "date"

function AddUserModal({
  token,
  onClose,
  onAdded,
}: {
  token: string
  onClose: () => void
  onAdded: () => void
}) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [birthMode, setBirthMode] = useState<BirthMode>("age")
  const [ageVal, setAgeVal] = useState("")
  const [dateVal, setDateVal] = useState("")
  const [coffee, setCoffee] = useState<"drip" | "espresso">("drip")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])

  // Compute the final birth_date to send
  function computeBirthDate(): string {
    if (birthMode === "age") return ageToBirthDate(ageVal)
    return normDate(dateVal)
  }

  async function handleAdd() {
    setError("")
    if (!fullName.trim()) return setError("Full name is required.")
    if (!phone.trim()) return setError("Phone number is required.")
    const birth_date = computeBirthDate()
    if (!birth_date) {
      if (birthMode === "age") return setError("Enter a valid age (1–120).")
      return setError("Enter date as YYYY-MM-DD.")
    }
    setLoading(true)
    try {
      const iconRes = await fetch("/iconA.png")
      const blob = await iconRes.blob()
      const file = new File([blob], "icon.png", { type: blob.type })

      const body = new FormData()
      body.append("full_name", fullName.trim())
      body.append("phone_number", phone.trim())
      body.append("birth_date", birth_date)
      body.append("coffee_preference", coffee)
      body.append("payment_receipt", file)

      for (const [key, value] of body.entries()) {
        console.log(key, value)
      }
      const res = await fetch(API_URL + "/api/register/", {
        method: "POST",
        body,
      })

      const err = await res.json().catch(() => ({}))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || data?.message || `Error ${res.status}`)
      }
      onAdded()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to add user.")
    } finally {
      setLoading(false)
    }
  }

  const previewDate = computeBirthDate()

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <span className="popup-title">➕ Add User Manually</span>
          <button className="popup-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {/* Full name */}
          <div className="field">
            <label className="field-label">Full Name</label>
            <input
              className="field-input"
              placeholder="e.g. علی محمدی"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                setError("")
              }}
              autoFocus
            />
          </div>

          {/* Phone */}
          <div className="field">
            <label className="field-label">Phone Number</label>
            <input
              className="field-input"
              placeholder="09xxxxxxxxx"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setError("")
              }}
              inputMode="tel"
            />
          </div>

          {/* Birth date — age or date toggle */}
          <div className="field">
            <label className="field-label">Birth Date</label>
            <div className="birth-mode-toggle">
              <button
                type="button"
                className={`birth-mode-btn ${birthMode === "age" ? "birth-mode-btn--active" : ""}`}
                onClick={() => setBirthMode("age")}
              >
                By Age
              </button>
              <button
                type="button"
                className={`birth-mode-btn ${birthMode === "date" ? "birth-mode-btn--active" : ""}`}
                onClick={() => setBirthMode("date")}
              >
                By Date
              </button>
            </div>
            {birthMode === "age" ? (
              <input
                className="field-input"
                placeholder="e.g. 25"
                value={ageVal}
                onChange={(e) => {
                  setAgeVal(e.target.value)
                  setError("")
                }}
                inputMode="numeric"
                maxLength={3}
              />
            ) : (
              <input
                className="field-input"
                placeholder="YYYY-MM-DD"
                value={dateVal}
                onChange={(e) => {
                  setDateVal(e.target.value)
                  setError("")
                }}
                maxLength={10}
              />
            )}
            {previewDate && (
              <span className="field-hint">
                → Will send: <strong>{previewDate}</strong>
              </span>
            )}
          </div>

          {/* Coffee */}
          <div className="field">
            <label className="field-label">Coffee Preference</label>
            <div className="coffee-toggle">
              {(["drip", "espresso"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`coffee-opt ${coffee === c ? "coffee-opt--active" : ""}`}
                  onClick={() => setCoffee(c)}
                >
                  {c === "drip" ? "☕ Drip" : "⚡ Espresso"}
                </button>
              ))}
            </div>
          </div>

          <p className="modal-receipt-note">
            🧾 Default receipt will be applied automatically.
          </p>

          {error && <p className="field-error">{error}</p>}

          <button
            className="btn-add-submit"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? "Adding…" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({
  user,
  checked,
  token,
  onCheck,
  onStatusChange,
  onReceiptClick,
}: {
  user: User
  checked: boolean
  token: string
  onCheck: (id: string) => void
  onStatusChange: (id: string, s: StatusChoice) => Promise<void>
  onReceiptClick: (user: User) => void
}) {
  const [copied, setCopied] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<StatusChoice | null>(
    null
  )

  const initials = user.full_name
    ? user.full_name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  function copyPhone() {
    navigator.clipboard.writeText(user.phone_number).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  async function handleStatusClick(s: StatusChoice) {
    if (s === user.status_choices) return
    setUpdatingStatus(s)
    await onStatusChange(user.id, s)
    setUpdatingStatus(null)
  }

  return (
    <div className={`user-card ${checked ? "user-card--checked" : ""}`}>
      {/* Check-in */}
      <label className="checkin-wrap">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onCheck(user.id)}
          className="checkin-input"
        />
        <span className="checkin-box">{checked && "✓"}</span>
        <span className="checkin-label">
          {checked ? "Checked in" : "Check in"}
        </span>
      </label>

      {/* Receipt thumbnail */}
      <div
        className="receipt-thumb-wrap"
        onClick={() => onReceiptClick(user)}
        title="View receipt"
      >
        <AuthImg
          src={user.payment_receipt || ""}
          alt="receipt"
          className="receipt-thumb"
          token={token}
        />
        <div className="receipt-thumb-overlay">🔍 View</div>
      </div>

      {/* Header */}
      <div className="card-header">
        <div className="avatar">{initials}</div>
        <div className="card-header-info">
          <h3 className="card-name">{user.full_name}</h3>
          <div className="phone-row">
            <p className="card-phone">{user.phone_number}</p>
            <button className="copy-btn" onClick={copyPhone} title="Copy phone">
              {copied ? "✓" : "📋"}
            </button>
          </div>
        </div>
        <StatusBadge status={user.status_choices} />
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="card-row">
          <span className="card-key">Age</span>
            <span className="card-val">
              {user.age !== "-" ? `${user.age}` : calcAge(user?.birth_date || "-")}
            </span>
        </div>
        <div className="card-row">
          <span className="card-key">Coffee</span>
          <span className="card-val">☕ {user.coffee_preference}</span>
        </div>
        <div className="card-row">
          <span className="card-key">Reference</span>
          <span className="card-val mono">{user.reference_number}</span>
        </div>
        <div className="card-row">
          <span className="card-key">Signed up</span>
          <span className="card-val">{fmt(user.created_at)}</span>
        </div>
        <div className="card-row">
          <span className="card-key">Updated</span>
          <span className="card-val">{fmt(user.updated_at)}</span>
        </div>
      </div>

      {/* Footer — status */}
      <div className="card-footer">
        <span className="card-key">Change status</span>
        <div className="status-btns">
          {(["pending", "confirmed", "rejected"] as StatusChoice[]).map((s) => {
            const isActive = user.status_choices === s
            const isLoading = updatingStatus === s
            return (
              <button
                key={s}
                className={`status-btn status-btn--${s} ${isActive ? "active" : ""}`}
                onClick={() => handleStatusClick(s)}
                disabled={!!updatingStatus}
              >
                {isLoading ? (
                  <span className="btn-spinner" />
                ) : s === "pending" ? (
                  "Pending"
                ) : s === "confirmed" ? (
                  "Confirm"
                ) : (
                  "Reject"
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  // Read token fresh on each render so it's always up-to-date
  const token = getToken()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CHECKED)
      return new Set(raw ? JSON.parse(raw) : [])
    } catch {
      return new Set()
    }
  })
  const [filter, setFilter] = useState<StatusChoice | "all">("all")
  const [search, setSearch] = useState("")
  const [receiptUser, setReceiptUser] = useState<User | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  function loadUsers() {
    const t = getToken()
    if (!t) {
      onLogout()
      return
    }
    setLoading(true)
    setFetchError("")
    fetch(API_URL + "/api/dashboard/", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          onLogout()
          return
        }
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        const raw: any[] =
          data.registrations ??
          data.results ??
          (Array.isArray(data) ? data : [])
        setUsers(
          raw.map((r: any) => ({
            id: String(r.id),
            full_name: r.full_name ?? "",
            phone_number: r.phone_number ?? "",
            age: r.age ?? "-",
            birth_date: r.birth_date ?? "-",
            coffee_preference: r.coffee_preference ?? "-",
            // Parse Persian or English status string
            status_choices: parseStatus(r.status_choices ?? r.status),
            payment_receipt: r.payment_receipt ?? r.payment_receipt_url ?? "",
            reference_number: r.reference_number ?? "—",
            created_at: r.created_at ?? r.registered_at ?? "",
            updated_at: r.updated_at ?? r.registered_at ?? "",
          }))
        )
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_CHECKED, JSON.stringify([...checked]))
  }, [checked])

  const toggleCheck = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const changeStatus = useCallback(
    async (id: string, status: StatusChoice) => {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status_choices: status,
                updated_at: new Date().toISOString(),
              }
            : u
        )
      )
      const t = getToken()
      try {
        const res = await fetch(API_URL + `/api/dashboard/${id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify({ status: STATUS_TO_API[status] }),
        })
        if (res.status === 401) onLogout()
      } catch {
        // keep optimistic
      }
    },
    [onLogout]
  )

  const filtered = users.filter((u) => {
    const matchStatus = filter === "all" || u.status_choices === filter
    const matchSearch =
      search === "" ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone_number?.includes(search)
    return matchStatus && matchSearch
  })

  const counts = {
    all: users.length,
    pending: users.filter((u) => u.status_choices === "pending").length,
    confirmed: users.filter((u) => u.status_choices === "confirmed").length,
    rejected: users.filter((u) => u.status_choices === "rejected").length,
    checkedIn: checked.size,
  }

  const FILTERS: { key: StatusChoice | "all"; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "pending", label: `⏳ Pending (${counts.pending})` },
    { key: "confirmed", label: `✅ Confirmed (${counts.confirmed})` },
    { key: "rejected", label: `❌ Rejected (${counts.rejected})` },
  ]

  return (
    <div className="dash-root">
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-logo">☕</span>
          <span className="topbar-title">Admin Dashboard</span>
        </div>
        <div className="topbar-right">
          <button className="btn-refresh" onClick={loadUsers} title="Refresh">
            ↻
          </button>
          <button
            className="btn-add-user"
            onClick={() => setShowAddModal(true)}
          >
            ➕ Add User
          </button>
          <button className="btn-logout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-label">Total</p>
          <p className="stat-val">{counts.all}</p>
        </div>
        <div className="stat-card stat-card--pending">
          <p className="stat-label">Pending</p>
          <p className="stat-val">{counts.pending}</p>
        </div>
        <div className="stat-card stat-card--confirmed">
          <p className="stat-label">Confirmed</p>
          <p className="stat-val">{counts.confirmed}</p>
        </div>
        <div className="stat-card stat-card--rejected">
          <p className="stat-label">Rejected</p>
          <p className="stat-val">{counts.rejected}</p>
        </div>
        <div className="stat-card stat-card--checkin">
          <p className="stat-label">Checked in</p>
          <p className="stat-val">{counts.checkedIn}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, phone, or ref…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-tab ${filter === f.key ? "filter-tab--active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn-reset" onClick={() => setChecked(new Set())}>
          Reset check-ins
        </button>
      </div>

      {loading && <div className="empty">Loading users…</div>}
      {fetchError && (
        <div className="empty err-text">Failed to load: {fetchError}</div>
      )}
      {!loading && !fetchError && filtered.length === 0 && (
        <div className="empty">No users found.</div>
      )}
      {!loading && filtered.length > 0 && (
        <div className="user-grid">
          {filtered.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              checked={checked.has(u.id)}
              token={token}
              onCheck={toggleCheck}
              onStatusChange={changeStatus}
              onReceiptClick={setReceiptUser}
            />
          ))}
        </div>
      )}

      {receiptUser && (
        <ReceiptPopup
          url={receiptUser.payment_receipt}
          name={receiptUser.full_name}
          token={token}
          onClose={() => setReceiptUser(null)}
        />
      )}

      {showAddModal && (
        <AddUserModal
          token={token}
          onClose={() => setShowAddModal(false)}
          onAdded={loadUsers}
        />
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const hasAuth = localStorage.getItem(STORAGE_AUTH) === "1"
    const hasToken = !!localStorage.getItem(STORAGE_TOKEN)
    setAuthed(hasAuth && hasToken)
  }, [])

  function handleLogout() {
    localStorage.removeItem(STORAGE_AUTH)
    localStorage.removeItem(STORAGE_TOKEN)
    setAuthed(false)
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:oklch(0.98 0.02 85);color:oklch(0.18 0.03 20);font-family:'DM Sans','Segoe UI',sans-serif}

        /* ── Login ── */
        .login-root{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
        .login-card{background:oklch(0.94 0.04 80);border:0.5px solid oklch(0.88 0.03 75);border-radius:1.25rem;padding:2.5rem 2rem;width:100%;max-width:400px;display:flex;flex-direction:column;align-items:center;gap:1rem}
        .login-logo{font-size:2.5rem}
        .login-title{font-size:1.5rem;font-weight:600;color:oklch(0.45 0.14 30)}
        .login-sub{font-size:13px;color:oklch(0.55 0.03 40)}
        .login-form{width:100%;display:flex;flex-direction:column;gap:.75rem}
        .btn-login{margin-top:.5rem;padding:11px;border-radius:.75rem;border:none;background:oklch(0.45 0.14 30);color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s;width:100%}
        .btn-login:hover{opacity:.88}
        .btn-login:disabled{opacity:.55;cursor:not-allowed}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .shake{animation:shake .5s ease}

        /* ── Shared field styles ── */
        .field{display:flex;flex-direction:column;gap:5px}
        .field-label{font-size:11px;font-weight:600;color:oklch(0.55 0.03 40);text-transform:uppercase;letter-spacing:.06em}
        .field-input{padding:9px 13px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);font-size:14px;color:oklch(0.18 0.03 20);outline:none;transition:border .15s;width:100%}
        .field-input:focus{border-color:oklch(0.65 0.08 180)}
        .field-error{font-size:12px;color:oklch(0.55 0.2 25);margin-top:2px}
        .field-hint{font-size:11px;color:oklch(0.45 0.1 180);margin-top:3px}

        /* ── Topbar ── */
        .dash-root{min-height:100vh;padding:0 0 3rem}
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:.8rem 1.25rem;background:oklch(0.94 0.04 80);border-bottom:0.5px solid oklch(0.88 0.03 75);position:sticky;top:0;z-index:10;gap:8px;flex-wrap:wrap}
        .topbar-left{display:flex;align-items:center;gap:10px}
        .topbar-logo{font-size:1.4rem}
        .topbar-title{font-size:15px;font-weight:600;color:oklch(0.45 0.14 30)}
        .topbar-right{display:flex;align-items:center;gap:7px}
        .btn-logout{font-size:13px;padding:6px 13px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);color:oklch(0.18 0.03 20);cursor:pointer;transition:background .15s;white-space:nowrap}
        .btn-logout:hover{background:oklch(0.88 0.03 75)}
        .btn-add-user{font-size:13px;padding:6px 13px;border-radius:.75rem;border:none;background:oklch(0.45 0.14 30);color:#fff;font-weight:600;cursor:pointer;transition:opacity .15s;white-space:nowrap}
        .btn-add-user:hover{opacity:.85}
        .btn-refresh{font-size:16px;padding:5px 10px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);color:oklch(0.45 0.14 30);cursor:pointer;transition:background .15s;line-height:1}
        .btn-refresh:hover{background:oklch(0.88 0.03 75)}

        /* ── Stats ── */
        .stats-row{display:flex;gap:10px;flex-wrap:wrap;padding:1.1rem 1.25rem .65rem}
        .stat-card{flex:1;min-width:72px;background:oklch(0.94 0.04 80);border:0.5px solid oklch(0.88 0.03 75);border-radius:.75rem;padding:.7rem .85rem;display:flex;flex-direction:column;gap:3px}
        .stat-label{font-size:10px;font-weight:500;color:oklch(0.55 0.03 40);text-transform:uppercase;letter-spacing:.05em}
        .stat-val{font-size:1.5rem;font-weight:700;color:oklch(0.18 0.03 20)}
        .stat-card--pending .stat-val{color:oklch(0.65 0.15 60)}
        .stat-card--confirmed .stat-val{color:oklch(0.39 0.13 145)}
        .stat-card--rejected .stat-val{color:oklch(0.55 0.2 25)}
        .stat-card--checkin .stat-val{color:oklch(0.65 0.08 180)}

        /* ── Toolbar ── */
        .toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:.6rem 1.25rem;border-bottom:0.5px solid oklch(0.88 0.03 75)}
        .search-input{flex:1;min-width:140px;padding:7px 13px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);font-size:13px;color:oklch(0.18 0.03 20);outline:none}
        .search-input:focus{border-color:oklch(0.65 0.08 180)}
        .filter-tabs{display:flex;gap:5px;flex-wrap:wrap}
        .filter-tab{padding:5px 11px;border-radius:.75rem;font-size:12px;font-weight:500;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);color:oklch(0.55 0.03 40);cursor:pointer;transition:all .15s;white-space:nowrap}
        .filter-tab:hover{background:oklch(0.88 0.03 75);color:oklch(0.18 0.03 20)}
        .filter-tab--active{background:oklch(0.45 0.14 30);color:#fff;border-color:oklch(0.45 0.14 30)}
        .btn-reset{padding:5px 11px;border-radius:.75rem;font-size:12px;font-weight:500;border:0.5px solid oklch(0.65 0.08 180);background:oklch(0.94 0.04 80);color:oklch(0.65 0.08 180);cursor:pointer;transition:all .15s;white-space:nowrap}
        .btn-reset:hover{background:oklch(0.65 0.08 180);color:#fff}

        /* ── Grid / empty ── */
        .user-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;padding:1.1rem 1.25rem}
        .empty{padding:3rem;text-align:center;color:oklch(0.55 0.03 40);font-size:14px}
        .err-text{color:oklch(0.55 0.2 25)}

        /* ── Card ── */
        .user-card{background:oklch(0.94 0.04 80);border:0.5px solid oklch(0.88 0.03 75);border-radius:1rem;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s}
        .user-card--checked{border-color:oklch(0.65 0.08 180)}

        .checkin-wrap{display:flex;align-items:center;gap:8px;padding:.5rem .85rem;background:oklch(0.98 0.02 85);border-bottom:0.5px solid oklch(0.88 0.03 75);cursor:pointer}
        .checkin-input{display:none}
        .checkin-box{width:17px;height:17px;border-radius:5px;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);display:flex;align-items:center;justify-content:center;font-size:10px;color:oklch(0.65 0.08 180);font-weight:700;flex-shrink:0;transition:all .15s}
        .user-card--checked .checkin-box{background:oklch(0.65 0.08 180);border-color:oklch(0.65 0.08 180);color:#fff}
        .checkin-label{font-size:12px;font-weight:500;color:oklch(0.55 0.03 40)}
        .user-card--checked .checkin-label{color:oklch(0.65 0.08 180)}

        /* ── Receipt thumbnail ── */
        .receipt-thumb-wrap{position:relative;width:100%;height:130px;overflow:hidden;cursor:pointer;background:oklch(0.91 0.03 80);flex-shrink:0}
        .receipt-thumb{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}
        .receipt-thumb-wrap:hover .receipt-thumb{transform:scale(1.05)}
        .receipt-thumb-overlay{position:absolute;inset:0;background:rgba(0,0,0,.38);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;opacity:0;transition:opacity .2s;gap:5px}
        .receipt-thumb-wrap:hover .receipt-thumb-overlay{opacity:1}

        /* ── Card header ── */
        .card-header{display:flex;align-items:center;gap:10px;padding:.7rem .85rem .5rem}
        .avatar{width:38px;height:38px;border-radius:50%;flex-shrink:0;background:oklch(0.45 0.14 30);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
        .card-header-info{flex:1;min-width:0}
        .card-name{font-size:14px;font-weight:600;color:oklch(0.18 0.03 20);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .phone-row{display:flex;align-items:center;gap:4px;margin-top:2px}
        .card-phone{font-size:12px;color:oklch(0.55 0.03 40)}
        .copy-btn{background:none;border:none;cursor:pointer;font-size:12px;padding:1px 3px;line-height:1;color:oklch(0.55 0.03 40);border-radius:4px;transition:all .1s}
        .copy-btn:hover{background:oklch(0.88 0.03 75)}

        /* ── Badge ── */
        .badge{font-size:10px;font-weight:700;padding:3px 9px;border-radius:99px;text-transform:capitalize;white-space:nowrap;flex-shrink:0}
        .status-pending{background:oklch(0.94 0.07 70);color:oklch(0.50 0.12 50)}
        .status-confirmed{background:oklch(0.88 0.08 145);color:oklch(0.33 0.13 145)}
        .status-rejected{background:oklch(0.92 0.06 20);color:oklch(0.42 0.14 30)}

        /* ── Card body ── */
        .card-body{padding:0 .85rem .5rem;display:flex;flex-direction:column}
        .card-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:0.5px solid oklch(0.91 0.03 80)}
        .card-row:last-child{border-bottom:none}
        .card-key{font-size:11px;color:oklch(0.55 0.03 40)}
        .card-val{font-size:12px;font-weight:500;color:oklch(0.18 0.03 20);text-align:right;max-width:60%}
        .mono{font-family:monospace;font-size:11px}

        /* ── Card footer / status buttons ── */
        .card-footer{padding:.5rem .85rem .75rem;border-top:0.5px solid oklch(0.88 0.03 75);display:flex;flex-direction:column;gap:6px}
        .status-btns{display:flex;gap:5px}
        .status-btn{
          flex:1;padding:6px 3px;border-radius:.5rem;font-size:11px;font-weight:600;
          border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);
          cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;
          min-height:30px;
        }
        .status-btn:disabled{cursor:not-allowed;opacity:.7}
        .status-btn--pending{color:oklch(0.50 0.12 50)}
        .status-btn--pending.active{background:oklch(0.94 0.07 70);border-color:oklch(0.72 0.1 60)}
        .status-btn--confirmed{color:oklch(0.33 0.13 145)}
        .status-btn--confirmed.active{background:oklch(0.88 0.08 145);border-color:oklch(0.48 0.13 145)}
        .status-btn--rejected{color:oklch(0.42 0.14 30)}
        .status-btn--rejected.active{background:oklch(0.92 0.06 20);border-color:oklch(0.62 0.14 30)}
        .status-btn:hover:not(.active):not(:disabled){background:oklch(0.91 0.03 80)}

        /* spinner */
        @keyframes spin{to{transform:rotate(360deg)}}
        .btn-spinner{display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite}

        /* ── Popups ── */
        .popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem}
        .popup-box{background:oklch(0.97 0.02 85);border-radius:1.25rem;overflow:hidden;width:100%;max-width:540px;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.32);max-height:90vh}
        .modal-box{background:oklch(0.97 0.02 85);border-radius:1.25rem;overflow:hidden;width:100%;max-width:420px;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.32);max-height:90vh;overflow-y:auto}
        .popup-header{display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.2rem;border-bottom:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);flex-shrink:0}
        .popup-title{font-size:13px;font-weight:600;color:oklch(0.18 0.03 20)}
        .popup-close{background:none;border:none;font-size:15px;cursor:pointer;color:oklch(0.55 0.03 40);padding:3px 7px;border-radius:6px;line-height:1}
        .popup-close:hover{background:oklch(0.88 0.03 75)}
        .popup-img-wrap{flex:1;display:flex;align-items:center;justify-content:center;background:oklch(0.90 0.03 80);overflow:hidden;min-height:200px}
        .popup-img{max-width:100%;max-height:65vh;object-fit:contain;display:block}
        .popup-open-link{display:block;text-align:center;padding:.6rem;font-size:13px;font-weight:500;color:oklch(0.42 0.12 200);border-top:0.5px solid oklch(0.88 0.03 75);text-decoration:none;background:oklch(0.94 0.04 80);flex-shrink:0}
        .popup-open-link:hover{background:oklch(0.88 0.03 75)}

        /* ── Add modal ── */
        .modal-body{padding:1.1rem;display:flex;flex-direction:column;gap:.8rem}
        .modal-receipt-note{background:oklch(0.92 0.03 80);border-radius:.6rem;padding:.5rem .75rem;font-size:12px;color:oklch(0.45 0.05 40)}
        .birth-mode-toggle{display:flex;gap:6px;margin-bottom:5px}
        .birth-mode-btn{flex:1;padding:6px;border-radius:.6rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);font-size:12px;font-weight:600;cursor:pointer;color:oklch(0.45 0.05 40);transition:all .15s}
        .birth-mode-btn--active{background:oklch(0.65 0.08 180);color:#fff;border-color:oklch(0.65 0.08 180)}
        .coffee-toggle{display:flex;gap:7px}
        .coffee-opt{flex:1;padding:8px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);font-size:13px;font-weight:500;cursor:pointer;color:oklch(0.45 0.05 40);transition:all .15s}
        .coffee-opt--active{background:oklch(0.45 0.14 30);color:#fff;border-color:oklch(0.45 0.14 30)}
        .coffee-opt:hover:not(.coffee-opt--active){background:oklch(0.92 0.03 80)}
        .btn-add-submit{padding:10px;border-radius:.75rem;border:none;background:oklch(0.45 0.14 30);color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s;margin-top:.2rem}
        .btn-add-submit:hover{opacity:.88}
        .btn-add-submit:disabled{opacity:.55;cursor:not-allowed}

        /* ── Responsive ── */
        @media(max-width:500px){
          .stats-row{gap:7px;padding:.8rem .85rem .5rem}
          .stat-val{font-size:1.25rem}
          .toolbar{padding:.55rem .85rem}
          .filter-tab{padding:4px 8px;font-size:11px}
          .user-grid{grid-template-columns:1fr;padding:.85rem}
          .topbar{padding:.65rem .85rem}
          .topbar-title{font-size:13px}
          .btn-add-user,.btn-logout,.btn-refresh{font-size:12px;padding:5px 9px}
        }
        @media(max-width:420px){
          .filter-tabs{display:grid;grid-template-columns:1fr 1fr;width:100%}
          .filter-tab{text-align:center}
          .topbar-title{display:none}
        }
      `}</style>
      {authed ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={() => setAuthed(true)} />
      )}
    </>
  )
}
