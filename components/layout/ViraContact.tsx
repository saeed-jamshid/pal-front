"use client"

import { IconArrowUpLeft, IconBrandLinkedin, IconBrandTelegram, IconPhone, IconX } from "@tabler/icons-react"
import { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Dialog as DialogPrimitive } from "radix-ui"

const CONTACTS = [
  { label: "تلفن", value: "+98 915 564 9881", href: "tel:+989155649881", icon: IconPhone },
  { label: "تلگرام", value: "@ViraRayaneshSepehr", href: "https://t.me/ViraRayaneshSepehr", icon: IconBrandTelegram },
  { label: "لینکدین", value: "Vira Rayanesh Sepehr", href: "https://www.linkedin.com/company/vira-rayanesh-sepehr", icon: IconBrandLinkedin },
]

export default function ViraContact() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="vira-credit" aria-label="اطلاعات تماس ویرا رایانش سپهر">
          <span className="vira-mark" aria-hidden="true" />
          <span><small>طراحی و توسعه</small><strong>ویرا رایانش سپهر</strong></span>
          <IconArrowUpLeft size={18} aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="vira-overlay" />
        <DialogPrimitive.Content className="vira-dialog" dir="rtl">
          <DialogClose asChild>
            <button type="button" className="vira-close" aria-label="بستن اطلاعات ویرا"><IconX size={20} aria-hidden="true" /></button>
          </DialogClose>
          <div className="vira-brand-panel">
            <span className="vira-logo" role="img" aria-label="لوگوی ویرا رایانش سپهر" />
            <span className="vira-brand-caption" dir="ltr">VIRA CO</span>
          </div>
          <div className="vira-contact-panel">
            <p className="vira-eyebrow">طراحی و توسعهٔ وب‌سایت</p>
            <DialogTitle className="vira-title">ویرا رایانش سپهر</DialogTitle>
            <DialogDescription className="vira-description">برای همکاری در طراحی و توسعهٔ وب‌سایت، با تیم ویرا تماس بگیرید.</DialogDescription>
            <ul className="vira-contact-list" aria-label="راه‌های ارتباط با ویرا">
              {CONTACTS.map(({ label, value, href, icon: Icon }) => (
                <li key={href}>
                  <a href={href} {...(href.startsWith("https:") && { target: "_blank", rel: "noopener noreferrer" })}>
                    <span className="vira-contact-icon"><Icon size={23} aria-hidden="true" /></span>
                    <span className="vira-contact-text"><span>{label}</span><strong dir="ltr">{value}</strong></span>
                    <IconArrowUpLeft size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="vira-contact-note">طراحی و توسعهٔ وب‌سایت پَل، توسط ویرا</p>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
