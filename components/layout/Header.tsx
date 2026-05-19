"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import MaterialSymbolsArrowBackRounded from "@/app/icons/MaterialSymbolsArrowBackRounded"

export default function Header({ back = false }) {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b shadow border-[--crp-warm) bg-(--crp-cream)/60 backdrop-blur-md rounded-b-2xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        <Popover>
          <PopoverTrigger asChild>
            <span className="flex cursor-pointer items-center gap-2 font-soraya">
              <Image
                src="/img/pal_logo.png"
                width={50}
                height={20}
                priority
                alt="pal_logo"
              />
              برشته کاری پَل
            </span>
          </PopoverTrigger>
          <PopoverContent className="mr-5 w-50">
            <PopoverHeader className="text-center">
              <PopoverTitle>پَل یعنی دوستی</PopoverTitle>
            </PopoverHeader>
          </PopoverContent>
        </Popover>

        {back && (
          <Link href="/">
            <MaterialSymbolsArrowBackRounded />
          </Link>
        )}
      </div>
    </header>
  )
}
