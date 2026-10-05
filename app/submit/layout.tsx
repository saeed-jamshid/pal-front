// app/submit/layout.tsx
// Toaster is mounted globally in app/layout.tsx
export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center bg-(--crp-cream)"
      dir="rtl"
    >
      {children}
    </div>
  )
}
