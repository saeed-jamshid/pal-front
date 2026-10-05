"use client"

import { motion, useReducedMotion } from "framer-motion"

// A small coffee-bean trail, not a confetti frame around the wordmark.
const beans = [
  [475, 56, 18, 1], [505, 89, -30, .8], [462, 104, 34, .68],
  [528, 133, 20, .58], [486, 149, -28, .5], [543, 185, 35, .4],
] as const

export default function PalBeans() {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 600 400" role="img" aria-label="PAL، قهوه‌دانه‌های پَل" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <path d="M55 72h120" stroke="var(--crp-sand)" strokeWidth="1" />
      <text x="55" y="260" fontFamily="Arial, Helvetica, sans-serif" fontSize="212" fontWeight="900" letterSpacing="-17" fill="var(--crp-espresso)">PAL</text>
      <path d="M55 286h490" stroke="var(--crp-espresso)" strokeWidth="1" />
      <text x="55" y="319" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="600" letterSpacing="5" fill="var(--crp-dark)">COFFEE · BIRJAND</text>
      {beans.map(([x, y, angle, scale], i) => (
        <motion.g
          key={i}
          transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}
          initial={reduced ? false : { opacity: 0, y: -35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: .55, ease: "easeOut", delay: .2 + i * .12 }}
        >
          <ellipse rx="13" ry="19" fill="var(--crp-terracotta)" />
          <path d="M 2 -15 C -8 -7, 8 0, -2 15" fill="none" stroke="var(--crp-surface)" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      ))}
    </svg>
  )
}
