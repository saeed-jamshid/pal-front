import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import ShopHeader from "@/components/shop/ShopHeader"
import Footer from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "پَل | قهوه و رویدادها",
  description:
    "قهوه‌های پَل و ثبت‌نام دورهمی‌ها و رویدادهای پَل در بیرجند.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={cn("antialiased")}
    >
      <body>
        <ThemeProvider>
          <ShopHeader />
          {children}
          <Footer />
          <Toaster position="top-center" closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
