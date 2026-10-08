// Runtime token data streams only on this route, not around static public pages.
export default function Loading() {
  return (
    <main className="min-h-screen bg-(--surface-100) pt-24">
      <p className="ed-shell" role="status">در حال دریافت وضعیت ثبت‌نام…</p>
    </main>
  )
}
