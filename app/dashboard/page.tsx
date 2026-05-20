"use client"

import { useState, useEffect, useCallback } from "react"

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

const DEFAULT_RECEIPT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f5ede0'/%3E%3Crect x='140' y='80' width='120' height='140' rx='8' fill='%23d4a96a' opacity='.4'/%3E%3Ctext x='200' y='175' font-family='sans-serif' font-size='48' text-anchor='middle'%3E🧾%3C/text%3E%3Ctext x='200' y='240' font-family='sans-serif' font-size='13' text-anchor='middle' fill='%23a07040'%3ENo receipt uploaded%3C/text%3E%3C/svg%3E"

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function statusColor(s: StatusChoice) {
  if (s === "confirmed") return "status-confirmed"
  if (s === "rejected") return "status-rejected"
  return "status-pending"
}

/** Convert age (number) to YYYY-MM-DD birth date */
function ageToBirthDate(age: string): string {
  const n = parseInt(age, 10)
  if (isNaN(n) || n < 1 || n > 120) return ""
  const d = new Date()
  d.setFullYear(d.getFullYear() - n)
  return d.toISOString().slice(0, 10)
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
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
      const res = await fetch("https://palcoffee.ir/api/token/", {
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
      onLogin(token)
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

function StatusBadge({ status }: { status: StatusChoice }) {
  const labels: Record<StatusChoice, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    rejected: "Rejected",
  }
  return (
    <span className={`badge ${statusColor(status)}`}>{labels[status]}</span>
  )
}

// ─── Receipt Popup ────────────────────────────────────────────────────────────

function ReceiptPopup({
  url,
  name,
  onClose,
}: {
  url: string
  name: string
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
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
          <img
            src={url || DEFAULT_RECEIPT}
            alt="Payment receipt"
            className="popup-img"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = DEFAULT_RECEIPT
            }}
          />
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="popup-open-link"
          >
            Open full image ↗
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Add User Modal ───────────────────────────────────────────────────────────

function AddUserModal({
  token,
  onClose,
  onAdded,
}: {
  token: string
  onClose: () => void
  onAdded: () => void
}) {
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    age: "",
    coffee_preference: "drip" as "drip" | "espresso",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  function set(key: string, val: string) {
    setForm((p) => ({ ...p, [key]: val }))
    setError("")
  }

  async function handleAdd() {
    if (!form.full_name.trim()) return setError("Full name is required.")
    if (!form.phone_number.trim()) return setError("Phone number is required.")
    const ageNum = parseInt(form.age, 10)
    if (!form.age || isNaN(ageNum) || ageNum < 1 || ageNum > 120)
      return setError("Enter a valid age (1–120).")

    const birth_date = ageToBirthDate(form.age)

    setLoading(true)
    setError("")
    try {
      const res = await fetch("https://palcoffee.ir/api/dashboard/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          phone_number: form.phone_number.trim(),
          birth_date,
          coffee_preference: form.coffee_preference,
          payment_receipt: DEFAULT_RECEIPT,
        }),
      })
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
          <div className="field">
            <label className="field-label">Full Name</label>
            <input
              className="field-input"
              placeholder="e.g. علی محمدی"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field-label">Phone Number</label>
            <input
              className="field-input"
              placeholder="09xxxxxxxxx"
              value={form.phone_number}
              onChange={(e) => set("phone_number", e.target.value)}
              inputMode="tel"
            />
          </div>
          <div className="field">
            <label className="field-label">Age</label>
            <input
              className="field-input"
              placeholder="e.g. 25"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              inputMode="numeric"
              maxLength={3}
            />
            {form.age && !isNaN(parseInt(form.age, 10)) && (
              <span className="field-hint">
                Birth date → {ageToBirthDate(form.age) || "—"}
              </span>
            )}
          </div>
          <div className="field">
            <label className="field-label">Coffee Preference</label>
            <div className="coffee-toggle">
              {(["drip", "espresso"] as const).map((c) => (
                <button
                  key={c}
                  className={`coffee-opt ${form.coffee_preference === c ? "coffee-opt--active" : ""}`}
                  onClick={() => set("coffee_preference", c)}
                  type="button"
                >
                  {c === "drip" ? "☕ Drip" : "⚡ Espresso"}
                </button>
              ))}
            </div>
          </div>
          <p className="field-hint modal-receipt-note">
            🧾 Default receipt image will be applied automatically.
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

// ─── User card ────────────────────────────────────────────────────────────────

function UserCard({
  user,
  checked,
  onCheck,
  onStatusChange,
  onReceiptClick,
}: {
  user: User
  checked: boolean
  onCheck: (id: string) => void
  onStatusChange: (id: string, s: StatusChoice) => void
  onReceiptClick: (user: User) => void
}) {
  const [copied, setCopied] = useState(false)

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

  const receiptSrc = user.payment_receipt || DEFAULT_RECEIPT

  return (
    <div className={`user-card ${checked ? "user-card--checked" : ""}`}>
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

      {/* Receipt thumbnail — click to open popup */}
      <div
        className="receipt-thumb-wrap"
        onClick={() => onReceiptClick(user)}
        title="View receipt"
      >
        <img
          src={receiptSrc}
          alt="receipt"
          className="receipt-thumb"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = DEFAULT_RECEIPT
          }}
        />
        <div className="receipt-thumb-overlay">🔍 View</div>
      </div>

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

      <div className="card-body">
        <div className="card-row">
          <span className="card-key">Age</span>
          <span className="card-val">{user.age}</span>
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
      </div>

      <div className="card-footer">
        <span className="card-key">Change status</span>
        <div className="status-btns">
          {(["pending", "confirmed", "rejected"] as StatusChoice[]).map((s) => (
            <button
              key={s}
              className={`status-btn status-btn--${s} ${user.status_choices === s ? "active" : ""}`}
              onClick={() => onStatusChange(user.id, s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({
  token,
  onLogout,
}: {
  token: string
  onLogout: () => void
}) {
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
    setLoading(true)
    setFetchError("")
    fetch("https://palcoffee.ir/api/dashboard/", {
      headers: { Authorization: `Bearer ${token}` },
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
            coffee_preference: r.coffee_preference ?? "-",
            status_choices: (r.status_choices ??
              r.status ??
              "pending") as StatusChoice,
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
  }, [token])

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
      try {
        await fetch(`https://palcoffee.ir/api/dashboard/${id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: status }),
        })
      } catch {
        // keep optimistic update
      }
    },
    [token]
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

  return (
    <div className="dash-root">
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-logo">☕</span>
          <span className="topbar-title">Admin Dashboard</span>
        </div>
        <div className="topbar-right">
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

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, phone, or ref…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {(["all", "pending", "confirmed", "rejected"] as const).map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "filter-tab--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn-reset" onClick={() => setChecked(new Set())}>
          Reset check-ins
        </button>
      </div>

      {loading && <div className="empty">Loading users…</div>}
      {fetchError && (
        <div className="empty" style={{ color: "oklch(0.55 0.2 25)" }}>
          Failed to load: {fetchError}
        </div>
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

// ─── Root page ────────────────────────────────────────────────────────────────

export default function Page() {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_AUTH) === "1"
  })

  function handleLogout() {
    localStorage.removeItem(STORAGE_AUTH)
    setAuthed(false)
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:oklch(0.98 0.02 85);color:oklch(0.18 0.03 20);font-family:'DM Sans','Segoe UI',sans-serif}

        /* ── Login ── */
        .login-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:oklch(0.98 0.02 85);padding:1rem}
        .login-card{background:oklch(0.94 0.04 80);border:0.5px solid oklch(0.88 0.03 75);border-radius:1.25rem;padding:2.5rem 2rem;width:100%;max-width:400px;display:flex;flex-direction:column;align-items:center;gap:1rem}
        .login-logo{font-size:2.5rem}
        .login-title{font-size:1.5rem;font-weight:600;color:oklch(0.45 0.14 30)}
        .login-sub{font-size:13px;color:oklch(0.55 0.03 40)}
        .login-form{width:100%;display:flex;flex-direction:column;gap:.75rem}
        .field{display:flex;flex-direction:column;gap:5px}
        .field-label{font-size:12px;font-weight:500;color:oklch(0.55 0.03 40);text-transform:uppercase;letter-spacing:.05em}
        .field-input{padding:10px 14px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);font-size:14px;color:oklch(0.18 0.03 20);outline:none;transition:border .15s;width:100%}
        .field-input:focus{border-color:oklch(0.65 0.08 180)}
        .field-error{font-size:12px;color:oklch(0.55 0.2 25);margin-top:2px}
        .field-hint{font-size:11px;color:oklch(0.55 0.08 180);margin-top:3px}
        .btn-login{margin-top:.5rem;padding:11px;border-radius:.75rem;border:none;background:oklch(0.45 0.14 30);color:oklch(0.98 0.02 85);font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s;width:100%}
        .btn-login:hover{opacity:.88}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .shake{animation:shake .5s ease}

        /* ── Topbar ── */
        .dash-root{min-height:100vh;padding:0 0 3rem}
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.25rem;background:oklch(0.94 0.04 80);border-bottom:0.5px solid oklch(0.88 0.03 75);position:sticky;top:0;z-index:10;gap:8px;flex-wrap:wrap}
        .topbar-left{display:flex;align-items:center;gap:10px}
        .topbar-logo{font-size:1.5rem}
        .topbar-title{font-size:16px;font-weight:600;color:oklch(0.45 0.14 30)}
        .topbar-right{display:flex;align-items:center;gap:8px}
        .btn-logout{font-size:13px;padding:6px 14px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);color:oklch(0.18 0.03 20);cursor:pointer;transition:background .15s;white-space:nowrap}
        .btn-logout:hover{background:oklch(0.88 0.03 75)}
        .btn-add-user{font-size:13px;padding:6px 14px;border-radius:.75rem;border:none;background:oklch(0.45 0.14 30);color:oklch(0.98 0.02 85);font-weight:600;cursor:pointer;transition:opacity .15s;white-space:nowrap}
        .btn-add-user:hover{opacity:.85}

        /* ── Stats ── */
        .stats-row{display:flex;gap:10px;flex-wrap:wrap;padding:1.25rem 1.25rem .75rem}
        .stat-card{flex:1;min-width:80px;background:oklch(0.94 0.04 80);border:0.5px solid oklch(0.88 0.03 75);border-radius:.75rem;padding:.75rem .85rem;display:flex;flex-direction:column;gap:4px}
        .stat-label{font-size:10px;font-weight:500;color:oklch(0.55 0.03 40);text-transform:uppercase;letter-spacing:.05em}
        .stat-val{font-size:1.6rem;font-weight:700;color:oklch(0.18 0.03 20)}
        .stat-card--pending .stat-val{color:oklch(0.65 0.15 60)}
        .stat-card--confirmed .stat-val{color:oklch(0.39 0.13 145)}
        .stat-card--rejected .stat-val{color:oklch(0.55 0.2 25)}
        .stat-card--checkin .stat-val{color:oklch(0.65 0.08 180)}

        /* ── Toolbar ── */
        .toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:.65rem 1.25rem;border-bottom:0.5px solid oklch(0.88 0.03 75)}
        .search-input{flex:1;min-width:160px;padding:8px 14px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);font-size:13px;color:oklch(0.18 0.03 20);outline:none}
        .search-input:focus{border-color:oklch(0.65 0.08 180)}
        .filter-tabs{display:flex;gap:5px;flex-wrap:wrap}
        .filter-tab{padding:5px 12px;border-radius:.75rem;font-size:12px;font-weight:500;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);color:oklch(0.55 0.03 40);cursor:pointer;transition:all .15s}
        .filter-tab:hover{background:oklch(0.88 0.03 75);color:oklch(0.18 0.03 20)}
        .filter-tab--active{background:oklch(0.45 0.14 30);color:oklch(0.98 0.02 85);border-color:oklch(0.45 0.14 30)}
        .btn-reset{padding:5px 12px;border-radius:.75rem;font-size:12px;font-weight:500;border:0.5px solid oklch(0.65 0.08 180);background:oklch(0.94 0.04 80);color:oklch(0.65 0.08 180);cursor:pointer;transition:all .15s;white-space:nowrap}
        .btn-reset:hover{background:oklch(0.65 0.08 180);color:#fff}

        /* ── Grid ── */
        .user-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;padding:1.25rem}
        .empty{padding:3rem;text-align:center;color:oklch(0.55 0.03 40);font-size:14px}

        /* ── Card ── */
        .user-card{background:oklch(0.94 0.04 80);border:0.5px solid oklch(0.88 0.03 75);border-radius:1rem;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s}
        .user-card--checked{border-color:oklch(0.65 0.08 180)}

        .checkin-wrap{display:flex;align-items:center;gap:8px;padding:.55rem .85rem;background:oklch(0.98 0.02 85);border-bottom:0.5px solid oklch(0.88 0.03 75);cursor:pointer}
        .checkin-input{display:none}
        .checkin-box{width:18px;height:18px;border-radius:5px;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);display:flex;align-items:center;justify-content:center;font-size:11px;color:oklch(0.65 0.08 180);font-weight:700;flex-shrink:0;transition:all .15s}
        .user-card--checked .checkin-box{background:oklch(0.65 0.08 180);border-color:oklch(0.65 0.08 180);color:#fff}
        .checkin-label{font-size:12px;font-weight:500;color:oklch(0.55 0.03 40)}
        .user-card--checked .checkin-label{color:oklch(0.65 0.08 180)}

        /* ── Receipt thumbnail ── */
        .receipt-thumb-wrap{position:relative;width:100%;height:120px;overflow:hidden;cursor:pointer;background:oklch(0.90 0.04 80)}
        .receipt-thumb{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s}
        .receipt-thumb-wrap:hover .receipt-thumb{transform:scale(1.04)}
        .receipt-thumb-overlay{position:absolute;inset:0;background:rgba(0,0,0,.35);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;opacity:0;transition:opacity .2s;letter-spacing:.02em}
        .receipt-thumb-wrap:hover .receipt-thumb-overlay{opacity:1}

        .card-header{display:flex;align-items:center;gap:10px;padding:.75rem .85rem .55rem}
        .avatar{width:40px;height:40px;border-radius:50%;flex-shrink:0;background:oklch(0.45 0.14 30);color:oklch(0.98 0.02 85);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
        .card-header-info{flex:1;min-width:0}
        .card-name{font-size:14px;font-weight:600;color:oklch(0.18 0.03 20);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .phone-row{display:flex;align-items:center;gap:5px;margin-top:2px}
        .card-phone{font-size:12px;color:oklch(0.55 0.03 40)}
        .copy-btn{background:none;border:none;cursor:pointer;font-size:13px;padding:0 2px;line-height:1;color:oklch(0.55 0.03 40);transition:transform .1s}
        .copy-btn:hover{transform:scale(1.2)}

        .badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;text-transform:capitalize;white-space:nowrap}
        .status-pending{background:oklch(0.94 0.07 70);color:oklch(0.55 0.12 50)}
        .status-confirmed{background:oklch(0.88 0.08 145);color:oklch(0.35 0.13 145)}
        .status-rejected{background:oklch(0.92 0.06 20);color:oklch(0.45 0.14 30)}

        .card-body{padding:0 .85rem .55rem;display:flex;flex-direction:column;gap:1px}
        .card-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:0.5px solid oklch(0.92 0.03 80)}
        .card-row:last-child{border-bottom:none}
        .card-key{font-size:12px;color:oklch(0.55 0.03 40)}
        .card-val{font-size:12px;font-weight:500;color:oklch(0.18 0.03 20)}
        .mono{font-family:monospace;font-size:11px}

        .card-footer{padding:.55rem .85rem .75rem;border-top:0.5px solid oklch(0.88 0.03 75);display:flex;flex-direction:column;gap:7px}
        .status-btns{display:flex;gap:5px}
        .status-btn{flex:1;padding:5px 4px;border-radius:.5rem;font-size:11px;font-weight:600;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);cursor:pointer;transition:all .15s;text-transform:capitalize}
        .status-btn--pending{color:oklch(0.55 0.12 50)}
        .status-btn--pending.active{background:oklch(0.94 0.07 70);border-color:oklch(0.75 0.1 60)}
        .status-btn--confirmed{color:oklch(0.35 0.13 145)}
        .status-btn--confirmed.active{background:oklch(0.88 0.08 145);border-color:oklch(0.5 0.13 145)}
        .status-btn--rejected{color:oklch(0.45 0.14 30)}
        .status-btn--rejected.active{background:oklch(0.92 0.06 20);border-color:oklch(0.65 0.14 30)}
        .status-btn:hover:not(.active){background:oklch(0.92 0.03 80)}

        /* ── Popups / Modals ── */
        .popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem}
        .popup-box{background:oklch(0.97 0.02 85);border-radius:1.25rem;overflow:hidden;width:100%;max-width:520px;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.3)}
        .modal-box{background:oklch(0.97 0.02 85);border-radius:1.25rem;overflow:hidden;width:100%;max-width:420px;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.3)}
        .popup-header{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.25rem;border-bottom:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80)}
        .popup-title{font-size:14px;font-weight:600;color:oklch(0.18 0.03 20)}
        .popup-close{background:none;border:none;font-size:16px;cursor:pointer;color:oklch(0.55 0.03 40);padding:2px 6px;border-radius:6px;line-height:1}
        .popup-close:hover{background:oklch(0.88 0.03 75)}
        .popup-img-wrap{display:flex;align-items:center;justify-content:center;background:oklch(0.90 0.03 80);max-height:70vh;overflow:hidden}
        .popup-img{max-width:100%;max-height:70vh;object-fit:contain;display:block}
        .popup-open-link{display:block;text-align:center;padding:.65rem;font-size:13px;font-weight:500;color:oklch(0.45 0.12 200);border-top:0.5px solid oklch(0.88 0.03 75);text-decoration:none;background:oklch(0.94 0.04 80)}
        .popup-open-link:hover{background:oklch(0.88 0.03 75)}

        .modal-body{padding:1.25rem;display:flex;flex-direction:column;gap:.85rem}
        .modal-receipt-note{background:oklch(0.92 0.04 80);border-radius:.6rem;padding:.55rem .75rem;font-size:12px;color:oklch(0.45 0.05 40)}
        .coffee-toggle{display:flex;gap:8px}
        .coffee-opt{flex:1;padding:8px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;color:oklch(0.45 0.05 40)}
        .coffee-opt--active{background:oklch(0.45 0.14 30);color:oklch(0.98 0.02 85);border-color:oklch(0.45 0.14 30)}
        .coffee-opt:hover:not(.coffee-opt--active){background:oklch(0.92 0.03 80)}
        .btn-add-submit{padding:11px;border-radius:.75rem;border:none;background:oklch(0.45 0.14 30);color:oklch(0.98 0.02 85);font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s}
        .btn-add-submit:hover{opacity:.88}
        .btn-add-submit:disabled{opacity:.55;cursor:not-allowed}

        /* ── Responsive ── */
        @media(max-width:500px){
          .stats-row{gap:7px;padding:.85rem .85rem .5rem}
          .stat-val{font-size:1.3rem}
          .toolbar{padding:.55rem .85rem;gap:6px}
          .filter-tabs{gap:4px}
          .filter-tab{padding:4px 9px;font-size:11px}
          .user-grid{grid-template-columns:1fr;padding:.85rem}
          .topbar{padding:.7rem .85rem}
          .topbar-title{font-size:14px}
          .btn-add-user,.btn-logout{font-size:12px;padding:5px 10px}
        }
        @media(max-width:400px){
          .filter-tabs{display:grid;grid-template-columns:1fr 1fr;width:100%}
          .filter-tab{text-align:center}
        }
      `}</style>
      {authed ? (
        <Dashboard
          token={localStorage.getItem(STORAGE_TOKEN) ?? ""}
          onLogout={handleLogout}
        />
      ) : (
        <LoginPage onLogin={() => setAuthed(true)} />
      )}
    </>
  )
}
