import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import ShopHeader from "@/components/shop/ShopHeader"

export const metadata: Metadata = {
  title: "پَل | فروشگاه قهوه و رویدادها",
  description:
    "خرید قهوه‌های پَل و ثبت‌نام دورهمی‌ها و رویدادهای پَل در بیرجند.",
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
          <Toaster position="top-center" closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
