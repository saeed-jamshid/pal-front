export default function Loading() {
  return (
    <main aria-busy="true" aria-label="در حال بارگذاری صفحه" className="min-h-screen bg-(--crp-cream) pt-28">
      <div className="ed-shell space-y-6">
        <div className="page-loading-bar h-1 w-24 bg-(--crp-terracotta)" />
        <div className="h-8 w-48 bg-(--crp-warm)" />
        <div className="h-40 bg-(--crp-warm)" />
      </div>
    </main>
  )
}
