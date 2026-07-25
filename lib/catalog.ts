export type CatalogProduct = {
  slug: string
  title: string
  subtitle: string
  image: string
  roast: string
  process: string
  origin: string
  notes: string[]
  description: string
  brewGuide: string
  price: string
}

export const CATALOG_STORAGE_KEY = "pal_catalog_products"

export const defaultCatalogProducts: CatalogProduct[] = [
  {
    slug: "drip-blend",
    title: "بلند قهوه دمی",
    subtitle: "شفاف، شیرین و مناسب دم‌آوری روزانه",
    image: "/img/brew.jpeg",
    roast: "مدیوم لایت",
    process: "شسته",
    origin: "ترکیب عربیکا",
    notes: ["مرکبات", "عسل", "چای سیاه"],
    description:
      "این قهوه برای کسانی انتخاب شده که فنجان تمیز، رایحه لطیف و شیرینی متعادل دوست دارند. برای وی۶۰، کمکس و کلور گزینه‌ی خوبی است.",
    brewGuide: "نسبت پیشنهادی ۱ به ۱۵، آب ۹۲ تا ۹۴ درجه، آسیاب متوسط رو به ریز.",
    price: "تماس بگیرید",
  },
  {
    slug: "espresso-blend",
    title: "بلند اسپرسو",
    subtitle: "بدنه بالا با کرمای پایدار",
    image: "/img/espersso.jpeg",
    roast: "مدیوم",
    process: "ترکیبی",
    origin: "عربیکا و روبوستا",
    notes: ["شکلات تلخ", "مغزها", "کارامل"],
    description:
      "بلند اسپرسو برای دستگاه خانگی و صنعتی طراحی شده؛ عصاره‌گیری راحت، تلخی کنترل‌شده و بدنه‌ی قابل لمس دارد.",
    brewGuide: "دوز ۱۸ گرم، خروجی ۳۶ گرم، زمان عصاره‌گیری ۲۵ تا ۳۰ ثانیه.",
    price: "تماس بگیرید",
  },
  {
    slug: "pal-beans",
    title: "دانه ویژه پَل",
    subtitle: "انتخاب فصلی برشته‌کاری پَل",
    image: "/img/beans.jpeg",
    roast: "فصلی",
    process: "بسته به محصول",
    origin: "تک‌خاستگاه یا بلند محدود",
    notes: ["آجیلی", "میوه خشک", "شیرینی قهوه‌ای"],
    description:
      "هر فصل چند قهوه محدود را برای تجربه‌های تازه انتخاب می‌کنیم. این کارت نماینده‌ی پیشنهاد ویژه‌ی همان دوره است.",
    brewGuide: "برای بهترین نتیجه، دستور دم‌آوری روی بسته یا پیشنهاد باریستا را دنبال کنید.",
    price: "تماس بگیرید",
  },
]

export const catalogProducts = defaultCatalogProducts

export function getCatalogProduct(slug: string, products = defaultCatalogProducts) {
  return products.find((product) => product.slug === slug)
}

export function createProductSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function loadCatalogProducts() {
  if (typeof window === "undefined") return defaultCatalogProducts

  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY)
    if (!raw) return defaultCatalogProducts

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultCatalogProducts

    return parsed as CatalogProduct[]
  } catch {
    return defaultCatalogProducts
  }
}

export function saveCatalogProducts(products: CatalogProduct[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(products))
  window.dispatchEvent(new Event("catalog-products-updated"))
}
