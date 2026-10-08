"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { IconHome, IconCoffee, IconInfoCircle, IconPhoto, IconLogout, IconLogin, IconUser, IconMenu2, IconX } from "@tabler/icons-react"
import { clearTokens, isAuthed, subscribeAuth } from "@/lib/api"

const NAV = [
  { href: "/", label: "خانه", icon: IconHome },
  { href: "/catalog", label: "قهوه‌ها", icon: IconCoffee },
  { href: "/about", label: "دربارهٔ ما", icon: IconInfoCircle },
  { href: "/gallery", label: "گالری", icon: IconPhoto },
]

// Pathname is runtime data: prerender the bar without the current-page mark, stream it in.
export default function ShopHeader() {
  return <Suspense fallback={<Header path="" />}><CurrentHeader /></Suspense>
}

function CurrentHeader() {
  return <Header path={usePathname()} />
}

function Header({ path }: { path: string }) {
  const menu = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const authed = useSyncExternalStore(subscribeAuth, isAuthed, () => false)
  const router = useRouter()
  const current = (href: string) => (href === "/" ? path === "/" : path.startsWith(href)) ? "page" : undefined
  const close = () => menu.current?.hidePopover()
  const logout = () => {
    clearTokens()
    close()
    router.refresh()
  }
  const account = (e: React.MouseEvent) => {
    close()
    if (!authed) {
      e.preventDefault()
      router.push(`/login?next=${encodeURIComponent(location.pathname)}`)
    }
  }
  const accountHref = authed ? "/submit#my-registrations" : "/login"
  const accountLabel = authed ? "حساب من" : "ورود"

  useEffect(() => {
    const desktop = matchMedia("(min-width: 1001px)")
    const closeOnDesktop = () => { if (desktop.matches) menu.current?.hidePopover() }
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])

  return (
    <header className="public-navigation">
      <div className="navigation-shell ed-shell">
        <Link href="/" className="nav-brand" aria-label="پَل، خانه" dir="ltr">PAL</Link>
        <nav className="desktop-nav" aria-label="ناوبری دسکتاپ">
          {NAV.map(({ href, label }) => <Link key={href} href={href} aria-current={current(href)}>{label}</Link>)}
        </nav>
        <div className="navigation-actions">
          <Link href="/submit" className="nav-cta btn btn--primary" aria-current={current("/submit")}>ثبت‌نام رویداد</Link>
          <Link href={accountHref} className="desktop-account btn btn--secondary" onClick={account}>{accountLabel}</Link>
          {authed && <button type="button" className="desktop-logout" onClick={logout}>خروج</button>}
          <button
            type="button"
            className="navigation-trigger"
            popoverTarget="public-menu"
            aria-controls="public-menu"
            aria-expanded={open}
            aria-label={open ? "بستن منو" : "باز کردن منو"}
          >
            {open ? <IconX size={24} aria-hidden /> : <IconMenu2 size={24} aria-hidden />}
          </button>
        </div>
      </div>
      <div
        ref={menu}
        id="public-menu"
        popover="auto"
        className="navigation-panel"
        onToggle={(e) => setOpen(e.currentTarget.matches(":popover-open"))}
      >
        <nav aria-label="ناوبری اصلی">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={close} aria-current={current(href)}>
              <Icon size={18} aria-hidden />{label}
            </Link>
          ))}
          <Link href={accountHref} onClick={account}>
            {authed ? <IconUser size={18} aria-hidden /> : <IconLogin size={18} aria-hidden />}{accountLabel}
          </Link>
          {authed && (
            <button type="button" onClick={logout}>
              <IconLogout size={18} aria-hidden />خروج
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
