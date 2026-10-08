"use client"

import Link from "next/link"
import StatusPage from "@/components/layout/StatusPage"

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <StatusPage code="خطا" mood="oops" title="مشکلی پیش آمد" text="این بخش الان باز نشد. دوباره تلاش کنید؛ اگر باز هم نشد، کمی بعد سر بزنید.">
      <button type="button" className="btn btn--primary" onClick={() => retry()}>تلاش دوباره</button>
      <Link href="/" className="btn btn--secondary">صفحهٔ اصلی</Link>
      {error.digest && <p className="status-digest">کد پیگیری: <span dir="ltr">{error.digest}</span></p>}
    </StatusPage>
  )
}
