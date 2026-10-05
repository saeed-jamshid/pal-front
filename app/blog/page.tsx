"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { fetchPosts, type BlogPost } from "@/lib/shop"

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [error, setError] = useState("")
  const reduce = useReducedMotion()

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch(() => setError("بلاگ بارگذاری نشد."))
  }, [])

  return (
    <main dir="rtl" className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)">
      <div className="ed-shell pt-28 pb-24">
        {/* Issue-style masthead */}
        <div className="border-b-2 border-(--crp-espresso) pb-6">
          <p className="t-label font-eng text-(--crp-terracotta)">PAL Coffee — Journal</p>
          <h1 className="t-display mt-3">مجله پَل</h1>
          <p className="t-body mt-4 max-w-lg text-(--crp-dark)">
            درباره‌ی قهوه، دم‌آوری و هر چیزی بینشان.
          </p>
        </div>

        {error && <p className="mt-10 text-center text-(--crp-dark)">{error}</p>}
        {posts && posts.length === 0 && (
          <p className="py-24 text-center text-(--crp-dark)">هنوز مطلبی منتشر نشده.</p>
        )}

        <div className="ed-grid mt-0 grid-cols-1 border-t-0 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.35 }}
              className={i === 0 ? "sm:col-span-2" : ""}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col bg-(--crp-cream) transition-colors duration-200 hover:bg-(--crp-warm)"
              >
                {post.cover && (
                  <div className={`relative overflow-hidden ${i === 0 ? "h-72" : "h-48"}`}>
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 border-t border-(--crp-sand) p-5">
                  <div className="t-label flex items-center gap-2 text-(--crp-dark)">
                    <span className="ed-seq">{String(i + 1).padStart(2, "0")}</span>
                    {post.category && <span>· {post.category}</span>}
                  </div>
                  <h2 className={`font-semibold ${i === 0 ? "t-h2" : "text-xl"}`}>{post.title}</h2>
                  <p className="line-clamp-2 text-sm leading-7 text-(--crp-dark)">
                    {post.excerpt}
                  </p>
                  <span className="t-label mt-auto pt-3 text-(--crp-dark)">
                    {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
