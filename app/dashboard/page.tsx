"use client"

import { useState, useEffect, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusChoice = "pending" | "confirmed" | "rejected"

interface User {
  id: string
  full_name: string
  phone_number: string
  age: number
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
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

// ─── User card ────────────────────────────────────────────────────────────────

function UserCard({
  user,
  checked,
  onCheck,
  onStatusChange,
}: {
  user: User
  checked: boolean
  onCheck: (id: string) => void
  onStatusChange: (id: string, s: StatusChoice) => void
}) {
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

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

      <div className="card-header">
        <div className="avatar">{initials}</div>
        <div className="card-header-info">
          <h3 className="card-name">{user.full_name}</h3>
          <p className="card-phone">{user.phone_number}</p>
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
          <span className="card-key">Receipt</span>
          <span className="card-val mono">{user.payment_receipt}</span>
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

  useEffect(() => {
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
        console.log(data)
        function mapStatus(status: string): StatusChoice {
          if (status.includes("تایید")) return "confirmed"
          if (status.includes("رد")) return "rejected"
          return "pending"
        }

        setUsers(
          (data.registrations ?? []).map((r: any) => ({
            id: String(r.id),
            full_name: r.full_name,
            phone_number: r.phone_number,
            age: "-", // or compute if needed
            coffee_preference: "-", // placeholder
            status_choices: mapStatus(r.status),
            payment_receipt: r.payment_receipt_url,
            reference_number: r.reference_number,
            created_at: r.registered_at,
            updated_at: r.registered_at,
          }))
        )
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false))
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
      try {
        await fetch(`https://palcoffee.ir/api/dashboard/${id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status_choices: status }),
        })
      } catch {
        // silently keep optimistic update; add toast here if desired
      }
    },
    [token]
  )

  const filtered = users.filter((u) => {
    console.log(u)
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
        <button className="btn-logout" onClick={onLogout}>
          Sign out
        </button>
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
      {!loading && filtered.length > 0 && (
        <div className="user-grid">
          {filtered.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              checked={checked.has(u.id)}
              onCheck={toggleCheck}
              onStatusChange={changeStatus}
            />
          ))}
        </div>
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

        .login-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:oklch(0.98 0.02 85)}
        .login-card{background:oklch(0.94 0.04 80);border:0.5px solid oklch(0.88 0.03 75);border-radius:1.25rem;padding:2.5rem 2rem;width:100%;max-width:400px;display:flex;flex-direction:column;align-items:center;gap:1rem}
        .login-logo{font-size:2.5rem}
        .login-title{font-size:1.5rem;font-weight:600;color:oklch(0.45 0.14 30)}
        .login-sub{font-size:13px;color:oklch(0.55 0.03 40)}
        .login-form{width:100%;display:flex;flex-direction:column;gap:.75rem}
        .field{display:flex;flex-direction:column;gap:5px}
        .field-label{font-size:12px;font-weight:500;color:oklch(0.55 0.03 40);text-transform:uppercase;letter-spacing:.05em}
        .field-input{padding:10px 14px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);font-size:14px;color:oklch(0.18 0.03 20);outline:none;transition:border .15s}
        .field-input:focus{border-color:oklch(0.65 0.08 180)}
        .field-error{font-size:12px;color:oklch(0.55 0.2 25)}
        .btn-login{margin-top:.5rem;padding:11px;border-radius:.75rem;border:none;background:oklch(0.45 0.14 30);color:oklch(0.98 0.02 85);font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s}
        .btn-login:hover{opacity:.88}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .shake{animation:shake .5s ease}

        .dash-root{min-height:100vh;padding:0 0 3rem}
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;background:oklch(0.94 0.04 80);border-bottom:0.5px solid oklch(0.88 0.03 75);position:sticky;top:0;z-index:10}
        .topbar-left{display:flex;align-items:center;gap:10px}
        .topbar-logo{font-size:1.5rem}
        .topbar-title{font-size:16px;font-weight:600;color:oklch(0.45 0.14 30)}
        .btn-logout{font-size:13px;padding:6px 14px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);color:oklch(0.18 0.03 20);cursor:pointer;transition:background .15s}
        .btn-logout:hover{background:oklch(0.88 0.03 75)}

        .stats-row{display:flex;gap:12px;flex-wrap:wrap;padding:1.25rem 1.5rem}
        .stat-card{flex:1;min-width:100px;background:oklch(0.94 0.04 80);border:0.5px solid oklch(0.88 0.03 75);border-radius:.75rem;padding:.85rem 1rem;display:flex;flex-direction:column;gap:4px}
        .stat-label{font-size:11px;font-weight:500;color:oklch(0.55 0.03 40);text-transform:uppercase;letter-spacing:.05em}
        .stat-val{font-size:1.75rem;font-weight:700;color:oklch(0.18 0.03 20)}
        .stat-card--pending .stat-val{color:oklch(0.65 0.15 60)}
        .stat-card--confirmed .stat-val{color:oklch(0.39 0.13 145)}
        .stat-card--rejected .stat-val{color:oklch(0.55 0.2 25)}
        .stat-card--checkin .stat-val{color:oklch(0.65 0.08 180)}

        .toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:.75rem 1.5rem;border-bottom:0.5px solid oklch(0.88 0.03 75)}
        .search-input{flex:1;min-width:200px;padding:8px 14px;border-radius:.75rem;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);font-size:13px;color:oklch(0.18 0.03 20);outline:none}
        .search-input:focus{border-color:oklch(0.65 0.08 180)}
        .filter-tabs{display:flex;gap:6px}
        .filter-tab{padding:6px 14px;border-radius:.75rem;font-size:12px;font-weight:500;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);color:oklch(0.55 0.03 40);cursor:pointer;transition:all .15s}
        .filter-tab:hover{background:oklch(0.88 0.03 75);color:oklch(0.18 0.03 20)}
        .filter-tab--active{background:oklch(0.45 0.14 30);color:oklch(0.98 0.02 85);border-color:oklch(0.45 0.14 30)}
        .btn-reset{padding:6px 14px;border-radius:.75rem;font-size:12px;font-weight:500;border:0.5px solid oklch(0.65 0.08 180);background:oklch(0.94 0.04 80);color:oklch(0.65 0.08 180);cursor:pointer;transition:all .15s;white-space:nowrap}
        .btn-reset:hover{background:oklch(0.65 0.08 180);color:#fff}

        .user-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;padding:1.5rem}
        .empty{padding:3rem;text-align:center;color:oklch(0.55 0.03 40);font-size:14px}

        .user-card{background:oklch(0.94 0.04 80);border:0.5px solid oklch(0.88 0.03 75);border-radius:1rem;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s}
        .user-card--checked{border-color:oklch(0.65 0.08 180)}

        .checkin-wrap{display:flex;align-items:center;gap:8px;padding:.6rem .85rem;background:oklch(0.98 0.02 85);border-bottom:0.5px solid oklch(0.88 0.03 75);cursor:pointer}
        .checkin-input{display:none}
        .checkin-box{width:18px;height:18px;border-radius:5px;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.94 0.04 80);display:flex;align-items:center;justify-content:center;font-size:11px;color:oklch(0.65 0.08 180);font-weight:700;flex-shrink:0;transition:all .15s}
        .user-card--checked .checkin-box{background:oklch(0.65 0.08 180);border-color:oklch(0.65 0.08 180);color:#fff}
        .checkin-label{font-size:12px;font-weight:500;color:oklch(0.55 0.03 40)}
        .user-card--checked .checkin-label{color:oklch(0.65 0.08 180)}

        .card-header{display:flex;align-items:center;gap:12px;padding:.85rem .85rem .65rem}
        .avatar{width:44px;height:44px;border-radius:50%;flex-shrink:0;background:oklch(0.45 0.14 30);color:oklch(0.98 0.02 85);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700}
        .card-header-info{flex:1;min-width:0}
        .card-name{font-size:15px;font-weight:600;color:oklch(0.18 0.03 20);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .card-phone{font-size:12px;color:oklch(0.55 0.03 40);margin-top:2px}

        .badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;text-transform:capitalize;white-space:nowrap}
        .status-pending{background:oklch(0.94 0.07 70);color:oklch(0.55 0.12 50)}
        .status-confirmed{background:oklch(0.88 0.08 145);color:oklch(0.35 0.13 145)}
        .status-rejected{background:oklch(0.92 0.06 20);color:oklch(0.45 0.14 30)}

        .card-body{padding:0 .85rem .65rem;display:flex;flex-direction:column;gap:2px}
        .card-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:0.5px solid oklch(0.92 0.03 80)}
        .card-row:last-child{border-bottom:none}
        .card-key{font-size:12px;color:oklch(0.55 0.03 40)}
        .card-val{font-size:13px;font-weight:500;color:oklch(0.18 0.03 20)}
        .mono{font-family:monospace;font-size:12px}

        .card-footer{padding:.65rem .85rem .85rem;border-top:0.5px solid oklch(0.88 0.03 75);display:flex;flex-direction:column;gap:8px}
        .status-btns{display:flex;gap:6px}
        .status-btn{flex:1;padding:6px 4px;border-radius:.5rem;font-size:11px;font-weight:600;border:0.5px solid oklch(0.88 0.03 75);background:oklch(0.98 0.02 85);cursor:pointer;transition:all .15s;text-transform:capitalize}
        .status-btn--pending{color:oklch(0.55 0.12 50)}
        .status-btn--pending.active{background:oklch(0.94 0.07 70);border-color:oklch(0.75 0.1 60)}
        .status-btn--confirmed{color:oklch(0.35 0.13 145)}
        .status-btn--confirmed.active{background:oklch(0.88 0.08 145);border-color:oklch(0.5 0.13 145)}
        .status-btn--rejected{color:oklch(0.45 0.14 30)}
        .status-btn--rejected.active{background:oklch(0.92 0.06 20);border-color:oklch(0.65 0.14 30)}
        .status-btn:hover:not(.active){background:oklch(0.92 0.03 80)}
      `}</style>
      {authed ? (
        <Dashboard
          token={localStorage.getItem(STORAGE_TOKEN)}
          onLogout={handleLogout}
        />
      ) : (
        <LoginPage onLogin={() => setAuthed(true)} />
      )}
    </>
  )
}
