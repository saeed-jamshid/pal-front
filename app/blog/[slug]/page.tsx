"use client"

import Image from "next/image"
import { Suspense, use, useEffect, useState } from "react"
import { fetchPost, type BlogPost } from "@/lib/shop"

// Per-post HERO treatment only — article body always stays cream/espresso
// so long-form Persian text keeps its 4.5:1 measure. DESIGN.md §Blog.
const HERO = {
  dark: { bg: "var(--crp-espresso)", fg: "var(--crp-cream)", meta: "var(--crp-sand)" },
  light: { bg: "var(--crp-warm)", fg: "var(--crp-espresso)", meta: "var(--crp-dark)" },
  accent: { bg: "var(--crp-terracotta)", fg: "var(--crp-cream)", meta: "var(--crp-warm)" },
} as const

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<main dir="rtl" className="min-h-screen bg-(--crp-cream) pt-32"><div className="ed-shell h-48 animate-pulse bg-(--crp-warm)" /></main>}><BlogPostPageContent params={params} /></Suspense>
}

function BlogPostPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPost(slug)
      .then(setPost)
      .catch(() => setError("مطلب پیدا نشد."))
  }, [slug])

  const hero = HERO[post?.theme ?? "light"]
  // ponytail: 200 wpm word-count estimate, swap for API field if backend adds one
  const readingMinutes = post
    ? Math.max(1, Math.round(post.content.trim().split(/\s+/).length / 200))
    : 0

  return (
    <main dir="rtl" className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)">
      {error && <p className="pt-40 text-center text-(--crp-dark)">{error}</p>}

      {post && (
        <article>
          {/* Hero — color-blocked, type may break the grid */}
          <header
            className="pt-28 pb-12"
            style={{ background: hero.bg, color: hero.fg }}
          >
            <div className="ed-shell max-w-4xl">
              {post.category && <p className="t-label">{post.category}</p>}
              <h1 className="t-h1 mt-4">{post.title}</h1>
              <p className="t-label mt-5" style={{ color: hero.meta }}>
                {post.publishedAt &&
                  new Date(post.publishedAt).toLocaleDateString("fa-IR")}
                {` · ${readingMinutes} دقیقه مطالعه`}
              </p>
            </div>
          </header>

          {post.cover && (
            <div className="ed-shell max-w-4xl">
              <div className="relative -mt-8 aspect-video overflow-hidden border border-(--crp-espresso)">
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Body — narrow readable measure */}
          <div className="ed-shell max-w-2xl py-14">
            <div className="t-body flex flex-col gap-6 text-justify">
              {post.content.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </article>
      )}
    </main>
  )
}
