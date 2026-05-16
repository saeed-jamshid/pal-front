// app/submit/layout.tsx
import { Toaster } from "sonner"

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center bg-[#fff9f0]"
      dir="rtl"
    >
      {children}
      <Toaster position="top-center" className="bg-[#fff9f0]! text-xs" closeButton/>
    </div>
  )
}
