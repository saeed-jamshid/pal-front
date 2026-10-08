import type { Metadata } from "next"
import Link from "next/link"
import StatusPage from "@/components/layout/StatusPage"

export const metadata: Metadata = { title: "صفحه پیدا نشد | پَل" }

export default function NotFound() {
  return (
    <StatusPage code="404" mood="lost" title="این صفحه اینجا نیست" text="شاید نشانی اشتباه نوشته شده یا صفحه جابه‌جا شده است. از یکی از این راه‌ها ادامه دهید.">
      <Link href="/" className="btn btn--primary">صفحهٔ اصلی</Link>
      <Link href="/catalog" className="btn btn--secondary">دیدن قهوه‌ها</Link>
      <Link href="/submit" className="btn btn--secondary">ثبت‌نام رویداد</Link>
    </StatusPage>
  )
}
