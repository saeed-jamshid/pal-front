import type { BlogPost, Product } from "./shop"

// Historical visual fixtures only; live fetchers never fall back to these.
export const MOCK_PRODUCTS: Omit<Product, "allowedGrinds" | "availableStock" | "categoryName">[] = [
  {
    id: 1,
    slug: "ethiopia-yirgacheffe",
    title: "اتیوپی یرگاچف",
    category: "single-origin",
    region: "یرگاچف، اتیوپی",
    description:
      "قهوه‌ای روشن و گل‌دار با اسیدیته‌ی مرکباتی و شیرینی عسل‌مانند. برای دم‌آوری‌های فیلتری انتخاب اول ماست.",
    image: "/img/brew.jpeg",
    weights: [
      { grams: 250, price: 580000 },
      { grams: 500, price: 1100000 },
      { grams: 1000, price: 2100000 },
    ],
    acidity: 8,
    sweetness: 7,
    bitterness: 3,
    body: 5,
    altitude: "۱۹۰۰–۲۲۰۰ متر",
    arabicaVariety: "هیرلوم",
    cuppingScore: 87,
    roastLevel: "لایت",
    process: "واشد",
    tastingNotes: ["گل یاس", "لیمو", "عسل", "چای سیاه"],
    brewMethods: ["v60", "chemex", "aeropress"],
  },
  {
    id: 2,
    slug: "colombia-huila",
    title: "کلمبیا هویلا",
    category: "single-origin",
    region: "هویلا، کلمبیا",
    description:
      "بادی متوسط و شیرینی کاراملی با ته‌مایه‌ی شکلات و میوه‌های قرمز. هم اسپرسو جواب می‌دهد هم فیلتر.",
    image: "/img/espersso.jpeg",
    weights: [
      { grams: 250, price: 520000 },
      { grams: 1000, price: 1950000 },
    ],
    acidity: 6,
    sweetness: 8,
    bitterness: 4,
    body: 7,
    altitude: "۱۵۰۰–۱۸۰۰ متر",
    arabicaVariety: "کاستیو",
    cuppingScore: 85,
    roastLevel: "مدیوم",
    process: "واشد",
    tastingNotes: ["کارامل", "شکلات شیری", "گیلاس"],
    brewMethods: ["espresso", "v60", "french-press", "moka"],
  },
  {
    id: 3,
    slug: "pal-specialty-blend",
    title: "بلند تخصصی پَل",
    category: "specialty",
    region: "ترکیب برزیل و اتیوپی",
    description:
      "بلند امضای پَل برای اسپرسو؛ کرمای پایدار، شیرینی بالا و تلخی کنترل‌شده. برای کاپوچینو و لاته عالی است.",
    image: "/img/espersso.jpeg",
    weights: [
      { grams: 250, price: 450000 },
      { grams: 1000, price: 1650000 },
    ],
    acidity: 5,
    sweetness: 8,
    bitterness: 5,
    body: 8,
    arabicaPercent: 90,
  },
  {
    id: 4,
    slug: "pal-commercial-blend",
    title: "بلند تجاری پَل",
    category: "commercial",
    region: "ترکیب برزیل، ویتنام",
    description:
      "قهوه‌ی روزمره با بادی بالا و قیمت اقتصادی؛ مناسب کافه‌ها و مصرف روزانه با دستگاه‌های اسپرسو.",
    image: "/img/brew.jpeg",
    weights: [
      { grams: 500, price: 620000 },
      { grams: 1000, price: 1150000 },
    ],
    acidity: 3,
    sweetness: 5,
    bitterness: 7,
    body: 9,
    arabicaPercent: 60,
  },
]

export const MOCK_POSTS: BlogPost[] = [
  {
    slug: "v60-guide",
    title: "راهنمای کامل دم‌آوری با V60",
    cover: "/img/brew.jpeg",
    excerpt: "از نسبت قهوه و آب تا تکنیک ریختن؛ هر آنچه برای یک فنجان V60 تمیز نیاز داری.",
    content:
      "V60 یکی از محبوب‌ترین روش‌های دم‌آوری فیلتری است.\n\nنسبت پیشنهادی ما ۱ به ۱۵ است؛ یعنی برای هر ۱۵ گرم قهوه، ۲۲۵ گرم آب. دمای آب را بین ۹۲ تا ۹۴ درجه نگه دارید.\n\nابتدا ۳۰ ثانیه بلوم کنید، سپس آب را به‌آرامی و به‌صورت دورانی بریزید. کل زمان دم‌آوری باید بین ۲:۳۰ تا ۳ دقیقه باشد.",
    theme: "dark",
    category: "دم‌آوری",
    publishedAt: "2026-09-01T10:00:00Z",
  },
  {
    slug: "what-is-single-origin",
    title: "قهوه تک‌خاستگاه چیست؟",
    cover: "/img/pal_people2.png",
    excerpt: "چرا قهوه‌های تک‌خاستگاه امتیاز بالاتری می‌گیرند و چه فرقی با بلند دارند؟",
    content:
      "قهوه تک‌خاستگاه یعنی دانه‌ها از یک مزرعه یا منطقه‌ی مشخص آمده‌اند.\n\nاین قهوه‌ها معمولاً شخصیت طعمی مشخص‌تری دارند؛ مثلاً گل‌دار بودن اتیوپی‌ها یا شکلاتی بودن کلمبیاها.\n\nدر مقابل، بلندها برای تعادل و ثبات طراحی می‌شوند و معمولاً برای اسپرسو انتخاب بهتری هستند.",
    theme: "accent",
    category: "آموزش",
    publishedAt: "2026-08-20T10:00:00Z",
  },
  {
    slug: "roast-levels",
    title: "درجه‌های رست؛ از لایت تا دارک",
    cover: "/img/pal_chair.png",
    excerpt: "رست لایت اسیدیته را حفظ می‌کند، دارک آن را به تلخی و بدنه می‌سپارد. کدام برای توست؟",
    content:
      "درجه رست مستقیم روی طعم نهایی اثر می‌گذارد.\n\nرست لایت: اسیدیته بالا، نت‌های میوه‌ای و گل‌دار. مناسب فیلتر.\n\nرست مدیوم: تعادل بین شیرینی و اسیدیته. همه‌کاره.\n\nرست دارک: بادی بالا، تلخی بیشتر، نت‌های شکلاتی. مناسب اسپرسو و قهوه با شیر.",
    theme: "light",
    category: "آموزش",
    publishedAt: "2026-08-05T10:00:00Z",
  },
]
