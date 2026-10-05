import Link from "next/link"
import EventArtwork from "@/components/event/EventArtwork"

export const metadata = { title: "دربارهٔ پَل | قهوه و دورهمی" }

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)">
      <div className="ed-shell max-w-6xl pt-28 pb-20">
        <p className="mb-3 text-sm font-semibold text-(--crp-terracotta)">
          پَل · بیرجند
        </p>
        <h1 className="t-h1 border-b border-(--crp-sand) pb-7">دربارهٔ ما</h1>
        <div className="mt-8 grid items-center gap-10 md:grid-cols-2">
          <div className="max-w-xl">
            <p className="text-lg leading-9">
              در پَل می‌توانید قهوه بخرید و برای دورهمی‌های بیرجند ثبت‌نام کنید.
            </p>
            <p className="mt-5 leading-8">
              عکس‌های دورهمی‌های قبلی در گالری هستند. زمان و هزینهٔ هر برنامه را
              در صفحهٔ رویدادها ببینید.
            </p>
            <div className="mt-7 flex flex-wrap gap-6">
              <Link
                href="/gallery"
                className="inline-flex min-h-11 items-center underline underline-offset-4"
              >
                عکس‌های دورهمی‌های قبل
              </Link>
              <Link
                href="/submit"
                className="inline-flex min-h-11 items-center underline underline-offset-4"
              >
                رویدادهای پَل
              </Link>
            </div>
          </div>
          <EventArtwork variant="about" />
        </div>
      </div>
    </main>
  )
}
