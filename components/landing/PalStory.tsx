"use client"

import { useEffect, useId, useRef } from "react"

export default function PalStory() {
  const ref = useRef<HTMLElement>(null)
  const clip = useId()
  useEffect(() => {
    const section = ref.current
    if (!section) return
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const stop = () => section.classList.remove("story-entering")
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      if (!media.matches) section.classList.add("story-entering")
      observer.disconnect()
    }, { threshold: .15 })
    observer.observe(section)
    media.addEventListener("change", stop)
    return () => { observer.disconnect(); media.removeEventListener("change", stop) }
  }, [])

  return (
    <section ref={ref} className="pal-story" aria-labelledby="story-title">
      <div className="ed-shell section story-layout">
        {/* Supplied چکیدن vector from newDesign's updated Industrial demo. */}
        <svg viewBox="0 0 120 120" className="story-drip" aria-hidden="true">
          <defs><clipPath id={clip}><path d="M42 74L32 98Q30 108 40 108H80Q90 108 88 98L78 74Z" /></clipPath></defs>
          <circle cx="60" cy="64" r="56" fill="var(--surface-300)" />
          <path d="M42 74L32 98Q30 108 40 108H80Q90 108 88 98L78 74Z" fill="#ffffff" />
          <g clipPath={`url(#${clip})`}><rect className="story-level" x="26" y="88" width="68" height="24" fill="var(--pal-navy)" /></g>
          <g fill="none" stroke="var(--pal-navy)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 74L32 98Q30 108 40 108H80Q90 108 88 98L78 74" />
            <path d="M82 80H92L98 96" />
            <rect x="38" y="68" width="44" height="6" rx="2" fill="#ffffff" />
            <path d="M82 26Q96 26 93 36Q90 42 74 42" />
            <path d="M38 22H82L68 50H52Z" fill="#ffffff" />
            <path d="M48 28L56 46M60 27V48M72 28L64 46" strokeWidth="2" />
            <path d="M34 22H86" />
            <ellipse cx="60" cy="54" rx="24" ry="4" fill="#ffffff" />
            <path d="M56 58H64L62 62H58Z" fill="var(--pal-navy)" />
          </g>
          <path className="story-drop story-drop--first" d="M60 64C60 64 57.5 67.5 57.5 69.5A2.5 2.5 0 0 0 62.5 69.5C62.5 67.5 60 64 60 64Z" fill="var(--pal-navy)" />
          <path className="story-drop" d="M60 64C60 64 57.5 67.5 57.5 69.5A2.5 2.5 0 0 0 62.5 69.5C62.5 67.5 60 64 60 64Z" fill="var(--pal-navy)" />
        </svg>
        <div className="story-copy">
          <h2 id="story-title" className="fa-h1">برای باهم بودن</h2>
          <p>این دورهمی یک بهونه‌ست برای باهم بودن، حرف زدن، چشیدن و تجربه کردن یه حس تازه. برای اینکه بدونیم قهوه‌ای که توی فنجونمونه، از کجا اومده، چه مسیری رو طی کرده و چرا هرکدومش یه حس خاص داره.</p>
          <p>توی دنیایی که جنگ و تورم هر روز قیمت قهوه رو بالا می‌بره؛ ما ترجیح می‌دیم به‌جای کم کردن کیفیت و فراموشی فرهنگ قهوه، دست به دست هم بدیم تا با ساده درست کردن قهوه فرهنگ قهوه رو زنده نگه داریم</p>
          <blockquote>قهوه فقط یک نوشیدنی نیست؛ یک صنعت است، یک فرهنگ است، و برای بسیاری، تمام زندگی‌شان…</blockquote>
        </div>
      </div>
    </section>
  )
}
