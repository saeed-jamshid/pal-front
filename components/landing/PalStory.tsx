"use client"

import { useEffect, useRef } from "react"
import CoffeeBranch from "./CoffeeBranch"

export default function PalStory() {
  const ref = useRef<HTMLElement>(null)
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
        <svg viewBox="0 0 300 240" className="story-branch" aria-hidden="true">
          <g transform="translate(50 205) scale(1.9)"><CoffeeBranch /></g>
          <g transform="translate(247 219) scale(.75)"><CoffeeBranch flip /></g>
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
