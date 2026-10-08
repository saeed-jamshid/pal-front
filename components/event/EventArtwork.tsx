// Animated palDesign scenes. Each lives in a sandboxed static HTML file so its
// SVG ids/scripts stay isolated; looping motion and reduced-motion behavior live inside each scene.
const artwork = {
  landing: {
    src: "/pal-design/landing-animated.html",
    title: "تصویر متحرک آب‌انبار و قهوهٔ پَل؛ انتخاب تصویر، نقاشی را دوباره پخش می‌کند",
    ratio: "aspect-[8/5]",
  },
  registration: {
    src: "/pal-design/registration-animated.html",
    title: "تصویر متحرک گربهٔ پَل کنار فنجان قهوه؛ با انتخاب تصویر گربه واکنش نشان می‌دهد",
    ratio: "aspect-[8/5]",
  },
  success: {
    src: "/pal-design/registration-animated.html#success",
    title: "تصویر متحرک گربهٔ خوشحال پَل کنار فنجان قهوه؛ با انتخاب تصویر گربه واکنش نشان می‌دهد",
    ratio: "aspect-[8/5]",
  },
  about: {
    src: "/pal-design/about-animated.html",
    title: "تصویر متحرک مسیر قهوه از مزرعه تا دورهمی پَل",
    ratio: "aspect-[2/1]",
  },
} as const

export default function EventArtwork({
  variant,
  className = "",
}: {
  variant: keyof typeof artwork
  className?: string
}) {
  const { src, title, ratio } = artwork[variant]
  return (
    <iframe
      src={src}
      title={title}
      sandbox="allow-scripts"
      loading={variant === "landing" ? "eager" : "lazy"}
      className={`block w-full border-0 ${ratio} ${className}`}
    />
  )
}
