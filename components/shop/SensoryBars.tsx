const SENSORY = [
  ["acidity", "اسیدیته"],
  ["sweetness", "شیرینی"],
  ["bitterness", "تلخی"],
  ["body", "بادی"],
] as const

export default function SensoryBars({
  values,
  accent = "var(--crp-terracotta)",
}: {
  values: Record<(typeof SENSORY)[number][0], number>
  accent?: string
}) {
  return (
    <div className="flex flex-col">
      {SENSORY.map(([key, label]) => {
        const v = Math.max(0, Math.min(values[key] ?? 0, 10))
        return (
          <div
            key={key}
            className="flex items-center gap-4 border-b border-(--crp-sand) py-3 last:border-b-0"
          >
            <span className="w-16 shrink-0 text-sm font-bold">{label}</span>
            {/* 10 discrete blocks — readable without relying on color alone */}
            <div className="flex flex-1 gap-1" role="img" aria-label={`${label} ${v} از ۱۰`}>
              {[...Array(10)].map((_, i) => (
                <span
                  key={i}
                  className="h-4 flex-1 border border-(--crp-sand) transition-colors duration-200"
                  style={i < v ? { background: accent, borderColor: accent } : undefined}
                />
              ))}
            </div>
            <span className="ed-seq w-6 text-left tabular-nums">{v}</span>
          </div>
        )
      })}
    </div>
  )
}
