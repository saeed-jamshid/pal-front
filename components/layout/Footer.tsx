import Link from "next/link"
import ViraContact from "./ViraContact"
import { IconBrandInstagram, IconBrandTelegram, IconPhone } from "@tabler/icons-react"

const LINKS = [
  { href: "/about", label: "دربارهٔ ما" },
  { href: "/submit", label: "ثبت‌نام رویداد" },
  { href: "/catalog", label: "قهوه‌ها" },
  { href: "/gallery", label: "گالری" },
]

const CONTACT = [
  { href: "https://instagram.com/palcoffee.ir", label: "اینستاگرام", value: "@palcoffee.ir", icon: IconBrandInstagram },
  { href: "https://t.me/pooriya_mqdm", label: "تلگرام", value: "@pooriya_mqdm", icon: IconBrandTelegram },
  { href: "tel:+989393258985", label: "تلفن", value: "۰۹۳۹۳۲۵۸۹۸۵", icon: IconPhone },
]

export default function Footer() {
  return (
    <footer className="site-footer bg-(--roast) text-(--on-roast)">
      <div className="ed-shell footer-compact">
        <div className="footer-grid">
          <div>
            <span className="font-(family-name:--font-display) text-[28px] leading-none font-extrabold" dir="ltr">PAL</span>
            <p className="mt-2 text-sm opacity-80">قهوه و دورهمی در بیرجند</p>
          </div>
          <nav aria-label="پیوندهای پَل" className="footer-links">
            {LINKS.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
          <ul className="footer-contact" aria-label="راه‌های ارتباط">
            {CONTACT.map(({ href, label, value, icon: Icon }) => (
              <li key={href}>
                <a href={href} {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })} aria-label={`${label}: ${value}`}>
                  <Icon size={20} aria-hidden />
                  <span dir="ltr">{value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--on-roast)/20 pt-3">
          <small className="opacity-80">© پَل · همهٔ حقوق محفوظ است.</small>
          <ViraContact />
          <a referrerPolicy="origin" target="_blank" rel="noopener"
            href="https://trustseal.enamad.ir/?id=8054802&Code=TBHSRCM6WIwIhBy88yaDKGyR66p06qAj"
            aria-label="بررسی نماد اعتماد الکترونیکی پَل" className="inline-flex rounded-(--radius-sm) bg-white p-2 text-(--ink)">
            {/* eslint-disable-next-line @next/next/no-img-element -- Enamad requires its own live seal URL and origin referrer. */}
            <img referrerPolicy="origin" src="https://trustseal.enamad.ir/logo.aspx?id=8054802&Code=TBHSRCM6WIwIhBy88yaDKGyR66p06qAj"
              alt="نماد اعتماد الکترونیکی پَل" width={125} height={136} loading="lazy" style={{ cursor: "pointer" }}
              {...{ code: "TBHSRCM6WIwIhBy88yaDKGyR66p06qAj" }} />
          </a>
        </div>
      </div>
    </footer>
  )
}
