import Link from "next/link"
import EventArtwork from "@/components/event/EventArtwork"

export const metadata = { title: "دربارهٔ پَل | قهوه و دورهمی" }

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-(--surface-100) pt-24 text-(--ink)">
      <div className="ed-shell section">
        <p className="text-sm font-bold text-(--brick)">پَل · بیرجند</p>
        <h1 className="fa-h1 mt-2 border-b border-(--outline) pb-6">دربارهٔ ما</h1>
        <div className="mt-8 grid items-center gap-10 min-[1001px]:grid-cols-[2fr_3fr]">
          <div className="max-w-xl">
            <p className="lead">
              ما قهوه را از دانهٔ سبز تا فنجان دنبال می‌کنیم و دورهمی‌هایمان را
              در بیرجند برگزار می‌کنیم.
            </p>
            <p className="mt-5 leading-8">
              عکس‌های دورهمی‌های قبلی در گالری هستند. زمان و هزینهٔ هر برنامه را
              در صفحهٔ رویدادها ببینید.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/submit" className="btn btn--primary">
                ثبت‌نام رویداد
              </Link>
              <Link href="/gallery" className="btn btn--secondary">
                دیدن گالری
              </Link>
            </div>
          </div>
          <div className="order-first min-[1001px]:order-last">
            <EventArtwork variant="about" />
          </div>
        </div>
      </div>
    </main>
  )
}
