export default function AbAnbarIllustration() {
  return (
    <svg viewBox="0 0 560 380" className="h-auto w-full" role="img" aria-label="تصویر کارتونی آب‌انبار و فنجان قهوه">
      <rect width="560" height="380" rx="10" fill="var(--crp-surface)" />
      <circle cx="468" cy="73" r="27" fill="var(--crp-warm)" />
      <g className="anbar-wind" fill="none" stroke="var(--crp-sand)" strokeWidth="3" strokeLinecap="round">
        <path d="M40 86h72q14 0 14-12t-14-12" />
        <path d="M24 108h95" />
        <path d="M329 89h72q14 0 14-12t-14-12" />
      </g>
      <path d="M26 318h508" stroke="var(--crp-sand)" strokeWidth="2" />
      {/* Windcatchers and dome: Birjand-inspired silhouette, not a specific venue. */}
      <path d="M78 136h54v182H78zM405 117h51v201h-51z" fill="var(--crp-sand)" stroke="var(--crp-espresso)" strokeWidth="3" />
      <path d="M87 156h36m-36 12h36m327-30h32m-32 12h32" stroke="var(--crp-dark)" strokeWidth="2" />
      <path d="M132 230c12-69 62-109 131-109s119 40 131 109v88H132z" fill="var(--crp-warm)" stroke="var(--crp-espresso)" strokeWidth="3" />
      <path d="M155 236c12-54 51-90 108-90s96 36 108 90" fill="none" stroke="var(--crp-sand)" strokeWidth="3" />
      <path d="M204 318v-53c0-33 25-58 59-58s59 25 59 58v53z" fill="var(--crp-espresso)" />
      <path d="M221 318v-52c0-25 17-42 42-42s42 17 42 42v52z" fill="var(--crp-surface)" />
      <path d="M232 292h62m-51-13h40m-28-13h16" stroke="var(--crp-sand)" strokeWidth="3" strokeLinecap="round" />
      {/* Cup foreground */}
      <ellipse cx="402" cy="330" rx="84" ry="9" fill="var(--crp-sand)" />
      <path d="M354 266h88l-8 54c-2 10-13 13-36 13s-34-3-36-13z" fill="var(--crp-surface)" stroke="var(--crp-espresso)" strokeWidth="3" />
      <path d="M441 276h14c19 0 19 35-15 35" fill="none" stroke="var(--crp-espresso)" strokeWidth="3" />
      <ellipse cx="398" cy="267" rx="44" ry="9" fill="var(--crp-terracotta)" stroke="var(--crp-espresso)" strokeWidth="3" />
      <g fill="none" stroke="var(--crp-terracotta)" strokeWidth="3" strokeLinecap="round">
        <path className="anbar-steam" d="M382 249c-11-15 11-19 0-34" />
        <path className="anbar-steam anbar-steam-late" d="M404 249c-11-15 11-19 0-34" />
      </g>
    </svg>
  )
}
