import { Suspense } from "react"
import type { Metadata } from "next"
import AdminShell from "@/components/admin/AdminShell"
import "./admin.css"

export const metadata: Metadata = {
  title: "مدیریت پَل",
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-root" data-pal-admin>
      <Suspense
        fallback={
          <div className="admin-access" role="status">
            در حال دریافت پنل…
          </div>
        }
      >
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </div>
  )
}
