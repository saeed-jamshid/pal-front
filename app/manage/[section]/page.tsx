"use client"

import { Suspense, use } from "react"
import { notFound } from "next/navigation"
import ManagementPage from "@/components/admin/ManagementPage"
import { resources } from "@/lib/admin"

function Content({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params)
  const resource = resources.find((r) => r.key === section)
  if (!resource) notFound()
  return <ManagementPage key={section} resource={resource} />
}
export default function Page({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  return (
    <Suspense fallback={<p role="status">در حال دریافت بخش…</p>}>
      <Content params={params} />
    </Suspense>
  )
}
