"use client"

// Replaces the root layout when it fails, so it brings its own document and styles.
import "./globals.css"
import StatusPage from "@/components/layout/StatusPage"

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <title>خطا | پَل</title>
        <StatusPage code="خطا" mood="oops" title="مشکلی پیش آمد" text="سایت الان باز نشد. دوباره تلاش کنید؛ اگر باز هم نشد، کمی بعد سر بزنید.">
          <button type="button" className="btn btn--primary" onClick={() => retry()}>تلاش دوباره</button>
          {/* Plain anchor: a full reload rebuilds the broken root layout. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="btn btn--secondary">صفحهٔ اصلی</a>
          {error.digest && <p className="status-digest">کد پیگیری: <span dir="ltr">{error.digest}</span></p>}
        </StatusPage>
      </body>
    </html>
  )
}
