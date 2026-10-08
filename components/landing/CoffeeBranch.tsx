// Coffee leaves and cherries from pal-bag-mockup.html, shared by bags and story.
export default function CoffeeBranch({ flip = false }: { flip?: boolean }) {
  return (
    <g transform={flip ? "scale(-1 1)" : undefined}>
      <path className="branch-line" pathLength="1" d="M0 0C18-30 40-52 76-70" fill="none" stroke="var(--roast)" strokeWidth="2.2" strokeLinecap="round" />
      {[[6, -6, -62, 1.05], [30, -36, -18, .9], [46, -50, -92, .62]].map(([x, y, r, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
          <path className="branch-leaf" d="M0 0C18-26 58-32 84-8C58 10 22 12 0 0Z" fill={i === 2 ? "var(--cistern)" : "var(--ink-muted)"} />
          <path className="branch-line" pathLength="1" d="M4-1C30-10 54-12 78-8M20-6l10-9M20-6l9 6M36-6l10-9M36-6l9 6M52-6l10-9M52-6l9 6" fill="none" stroke="var(--surface-100)" strokeWidth="1.3" />
        </g>
      ))}
      <path className="branch-line" pathLength="1" d="M50-50l-4 18M56-54l6 16" fill="none" stroke="var(--roast)" strokeWidth="1.4" />
      {[[44, -28, 9], [63, -34, 8]].map(([x, y, r]) => (
        <g className="branch-leaf" key={x}>
          <circle cx={x} cy={y} r={r} fill="var(--brick)" />
          <circle cx={x - r * .35} cy={y - r * .35} r={r * .28} fill="var(--on-brick)" />
        </g>
      ))}
    </g>
  )
}
