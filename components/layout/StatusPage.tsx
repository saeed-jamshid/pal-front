// Shared 404 / error layout with the PAL house cat (same drawing as the scenes).
export default function StatusPage({
  code,
  title,
  text,
  mood,
  children,
}: {
  code: string
  title: string
  text: string
  mood: "lost" | "oops"
  children: React.ReactNode
}) {
  return (
    <main className="status-page ed-shell">
      <svg viewBox="240 200 200 240" className="status-cat" aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M200 432 H460" stroke="var(--ink)" strokeWidth="2" />
        <path d="M384 426 C416 426 428 402 414 388 C406 380 396 386 402 394" stroke="var(--ink)" strokeWidth="2" />
        <path d="M268 432 C260 382 284 342 330 340 C376 342 400 382 392 432 Z" fill="var(--surface-100)" />
        <path d="M272 396 C282 368 316 374 312 404 C308 428 286 434 274 420 Z" fill="#ff8030" opacity=".9" />
        <path d="M352 346 C380 356 394 392 388 420 C374 404 362 378 352 346 Z" fill="var(--roast)" opacity=".85" />
        <path d="M268 432 C260 382 284 342 330 340 C376 342 400 382 392 432 M312 432 V412 M348 432 V412" stroke="var(--ink)" strokeWidth="2" />
        <g transform={mood === "lost" ? "rotate(-8 330 330)" : undefined}>
          <path d="M298 296 L300 260 L320 280 Z" fill="var(--surface-100)" stroke="var(--ink)" strokeWidth="2" />
          <path d="M340 280 L360 260 L362 296 Z" fill="var(--brick)" stroke="var(--ink)" strokeWidth="2" />
          <path d="M290 312 C290 290 308 276 330 276 C352 276 370 290 370 312 C370 332 352 346 330 346 C308 346 290 332 290 312 Z" fill="var(--surface-100)" stroke="var(--ink)" strokeWidth="2" />
          {mood === "lost" ? (
            <path d="M308 310 q6 5.5 12 0 M340 310 q6 5.5 12 0" stroke="var(--ink)" strokeWidth="1.8" />
          ) : (
            <>
              <circle cx="314" cy="310" r="3.2" fill="var(--ink)" />
              <circle cx="346" cy="310" r="3.2" fill="var(--ink)" />
              <ellipse cx="330" cy="331" rx="3" ry="3.8" stroke="var(--ink)" strokeWidth="1.6" />
            </>
          )}
          <path d="M327 320 H333 L330 323.5 Z" fill="var(--brick)" />
          <path d="M292 316 H276 M293 322 L278 328 M368 316 H384 M367 322 L382 328" stroke="var(--ink)" strokeWidth="1.2" opacity=".55" />
        </g>
        {mood === "lost" ? (
          <text x="384" y="262" fill="var(--brick)" fontSize="40" fontFamily="var(--font-fa-display)">؟</text>
        ) : (
          <path d="M386 238 v22 M386 270 v1" stroke="var(--brick)" strokeWidth="5" />
        )}
      </svg>
      <p className="status-code" dir="ltr">{code}</p>
      <h1 className="fa-h1">{title}</h1>
      <p className="lead">{text}</p>
      <div className="status-actions">{children}</div>
    </main>
  )
}
