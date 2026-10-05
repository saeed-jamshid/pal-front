import Image from "next/image"

const artwork = {
  landing: {
    src: "/pal-design/landing.svg",
    alt: "آب‌انبار و فنجان قهوه با گیاهان قهوه و گربه",
    height: 500,
  },
  registration: {
    src: "/pal-design/registration.svg",
    alt: "ورودی آب‌انبار، تابلوی خوش‌آمد و گربه",
    height: 500,
  },
  success: {
    src: "/pal-design/registration-success.svg",
    alt: "تابلوی منتظرت هستیم کنار آب‌انبار و گربه",
    height: 500,
  },
  about: {
    src: "/pal-design/about.svg",
    alt: "مسیر دانهٔ سبز تا روستری، قهوه و دورهمی پَل",
    height: 400,
  },
} as const

export default function EventArtwork({
  variant,
  className = "",
}: {
  variant: keyof typeof artwork
  className?: string
}) {
  const { src, alt, height } = artwork[variant]
  if (variant === "landing")
    return (
      <iframe
        src="/pal-design/landing-animated.html"
        title="تصویر متحرک آب‌انبار و قهوهٔ پَل؛ با انتخاب تصویر دوباره پخش می‌شود"
        sandbox="allow-scripts"
        className={`aspect-[8/5] w-full border-0 ${className}`}
        width={800}
        height={500}
      />
    )
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={height}
      unoptimized
      loading="lazy"
      className={`h-auto w-full ${className}`}
    />
  )
}
