import { api } from "./api"

export type AdminRow = Record<string, unknown> & { id: number }
export type AdminPage = {
  count: number
  next: string | null
  previous: string | null
  results: AdminRow[]
}
export type Overview = {
  user: { id: number; full_name: string; phone_number: string }
  products: number
  orders: number
  unfulfilled: number
  registrations_pending: number
  receipts_pending: number
  customers: number
  paid_total_rial: number
}
export type Field = {
  key: string
  label: string
  type?:
    | "number"
    | "textarea"
    | "checkbox"
    | "select"
    | "multi"
    | "date"
    | "time"
    | "file"
  required?: boolean
  options?: [string, string][]
  source?: string
  hint?: string
  default?: string | number | boolean
  min?: number
}
export type Resource = {
  key: string
  title: string
  singular: string
  group: string
  description: string
  columns: [string, string][]
  fields?: Field[]
  create?: boolean
  remove?: boolean
  review?: "event" | "payment"
  filter?: { key: string; options: [string, string][] }
}
const active: Field = {
  key: "is_active",
  label: "فعال / قابل نمایش",
  type: "checkbox",
  default: true,
}
const name: Field = { key: "name", label: "نام", required: true }
const slug: Field = {
  key: "slug",
  label: "شناسه URL",
  required: true,
  hint: "یکتا؛ بدون فاصله، مانند pal-coffee",
}
const description: Field = {
  key: "description",
  label: "توضیحات",
  type: "textarea",
}
const ordering: Field = {
  key: "ordering",
  label: "ترتیب نمایش",
  type: "number",
  default: 0,
}
const money = (key: string, label: string): Field => ({
  key,
  label: `${label} (ریال)`,
  type: "number",
  required: true,
  min: 0,
  hint: "۱۰ ریال = ۱ تومان؛ مقدار ذخیره‌شده ریال است.",
})
export const grinds: [string, string][] = [
  ["beans", "دانه"],
  ["espresso", "اسپرسوساز"],
  ["moka_pot", "موکاپات"],
  ["french_press", "فرنچ‌پرس"],
  ["v60", "V60"],
]
export const fulfillment: [string, string][] = [
  ["new", "جدید"],
  ["preparing", "آماده‌سازی"],
  ["shipped", "ارسال‌شده"],
  ["delivered", "تحویل‌شده"],
  ["cancelled", "لغوشده"],
]
export const paymentStatuses: [string, string][] = [
  ["unpaid", "پرداخت‌نشده"],
  ["pending", "در انتظار پرداخت"],
  ["paid", "پرداخت‌شده"],
  ["failed", "ناموفق"],
  ["refunded", "بازگشت وجه"],
]
export const registrationStatuses: [string, string][] = [
  ["pending", "در انتظار بررسی"],
  ["confirmed", "تأییدشده"],
  ["rejected", "ردشده"],
]
export const receiptStatuses: [string, string][] = [
  ["awaiting_receipt", "در انتظار رسید"],
  ["pending_review", "در انتظار بررسی"],
  ["approved", "تأییدشده"],
  ["rejected", "ردشده"],
  ["expired", "منقضی"],
  ["sent", "ارسال فاکتور"],
  ["paid", "پرداخت‌شده"],
  ["failed", "ناموفق"],
]
const booleanFilter = {
  key: "is_active",
  options: [
    ["true", "فعال"],
    ["false", "غیرفعال"],
  ] as [string, string][],
}

export const resources: Resource[] = [
  {
    key: "products",
    title: "محصولات",
    singular: "محصول",
    group: "فروشگاه",
    description:
      "قیمت، موجودی و مشخصات قهوه و ابزار؛ همه مبالغ به ریال ثبت می‌شوند.",
    create: true,
    remove: true,
    filter: booleanFilter,
    columns: [
      ["name", "محصول"],
      ["sku", "SKU"],
      ["category_name", "دسته"],
      ["price", "قیمت"],
      ["available_stock", "موجودی قابل فروش"],
      ["is_active", "وضعیت"],
    ],
    fields: [
      name,
      slug,
      { key: "sku", label: "SKU", required: true },
      {
        key: "category",
        label: "دسته‌بندی",
        type: "select",
        source: "categories",
        required: true,
      },
      money("price", "قیمت"),
      {
        key: "stock",
        label: "موجودی مستقل",
        type: "number",
        required: true,
        default: 0,
      },
      { key: "short_description", label: "معرفی کوتاه" },
      description,
      { key: "origin", label: "خاستگاه" },
      {
        key: "roast_level",
        label: "درجه رست",
        type: "select",
        options: [
          ["", "نامشخص"],
          ["light", "روشن"],
          ["medium", "متوسط"],
          ["dark", "تیره"],
        ],
      },
      { key: "roast_date", label: "تاریخ رست", type: "date" },
      { key: "tasting_notes", label: "یادداشت طعمی" },
      {
        key: "allowed_grinds",
        label: "آسیاب‌های مجاز",
        type: "multi",
        options: grinds,
        hint: "برای ابزار دم‌آوری هیچ گزینه‌ای انتخاب نکنید.",
      },
      {
        key: "brew_methods",
        label: "روش‌های دم‌آوری",
        type: "multi",
        options: grinds.slice(1),
      },
      {
        key: "taste_profile",
        label: "پروفایل طعمی",
        type: "select",
        options: [
          ["balanced", "متعادل"],
          ["chocolate", "شکلاتی"],
          ["fruity", "میوه‌ای"],
        ],
      },
      {
        key: "strength",
        label: "شدت",
        type: "select",
        options: [
          ["medium", "متوسط"],
          ["mild", "ملایم"],
          ["strong", "قوی"],
        ],
      },
      active,
      { key: "is_featured", label: "محصول ویژه", type: "checkbox" },
    ],
  },
  {
    key: "categories",
    title: "دسته‌بندی محصولات",
    singular: "دسته‌بندی",
    group: "فروشگاه",
    description: "ساختار فروشگاه و ترتیب نمایش دسته‌ها.",
    filter: booleanFilter,
    create: true,
    remove: true,
    columns: [
      ["name", "نام"],
      ["slug", "شناسه"],
      ["ordering", "ترتیب"],
      ["is_active", "وضعیت"],
    ],
    fields: [
      name,
      slug,
      description,
      { key: "image", label: "تصویر دسته", type: "file" },
      ordering,
      active,
    ],
  },
  {
    key: "images",
    title: "تصاویر محصولات",
    singular: "تصویر",
    group: "فروشگاه",
    description:
      "JPG، PNG یا WebP؛ حداکثر ۵ مگابایت. متن جایگزین برای دسترس‌پذیری.",
    create: true,
    remove: true,
    columns: [
      ["product_name", "محصول"],
      ["image", "تصویر"],
      ["alt_text", "متن جایگزین"],
      ["ordering", "ترتیب"],
    ],
    fields: [
      {
        key: "product",
        label: "محصول",
        type: "select",
        source: "products",
        required: true,
      },
      { key: "image", label: "فایل تصویر", type: "file", required: true },
      { key: "alt_text", label: "متن جایگزین" },
      ordering,
    ],
  },
  {
    key: "bundles",
    title: "ترکیب باندل‌ها",
    singular: "جزء باندل",
    group: "فروشگاه",
    description:
      "محصولات داخل هر باندل را مشخص کنید. ترکیب باندلی که سفارش دارد قابل تغییر نیست.",
    create: true,
    remove: true,
    columns: [
      ["bundle_name", "باندل"],
      ["included_name", "محصول داخل باندل"],
      ["quantity", "تعداد"],
    ],
    fields: [
      {
        key: "bundle_product",
        label: "محصول باندل",
        type: "select",
        source: "products",
        required: true,
      },
      {
        key: "included_product",
        label: "محصول داخل باندل",
        type: "select",
        source: "products",
        required: true,
      },
      {
        key: "quantity",
        label: "تعداد",
        type: "number",
        required: true,
        min: 1,
        default: 1,
      },
    ],
  },
  {
    key: "orders",
    title: "سفارش‌ها",
    singular: "سفارش",
    group: "عملیات",
    description:
      "ارسال و رهگیری؛ مبلغ و وضعیت پرداخت مستقیماً قابل تغییر نیستند.",
    filter: { key: "payment_status", options: paymentStatuses },
    columns: [
      ["order_number", "سفارش"],
      ["full_name", "مشتری"],
      ["total_amount", "مبلغ"],
      ["payment_status", "پرداخت"],
      ["fulfillment_status", "ارسال"],
    ],
    fields: [
      {
        key: "fulfillment_status",
        label: "وضعیت ارسال",
        type: "select",
        options: fulfillment,
      },
      { key: "tracking_code", label: "کد رهگیری" },
      { key: "customer_note", label: "یادداشت", type: "textarea" },
    ],
  },
  {
    key: "payments",
    title: "بررسی پرداخت‌ها",
    singular: "پرداخت",
    group: "عملیات",
    description:
      "رسید و حساب مقصد را بررسی کنید. تأیید رسید، سفارش را پرداخت‌شده ثبت می‌کند و از موجودی کم می‌کند.",
    review: "payment",
    filter: { key: "status", options: receiptStatuses },
    columns: [
      ["order_number", "سفارش"],
      ["full_name", "مشتری"],
      ["amount_rial", "مبلغ"],
      ["status", "وضعیت"],
      ["created_at", "ثبت"],
    ],
  },
  {
    key: "gateways",
    title: "تراکنش‌های سامان",
    singular: "تراکنش",
    group: "عملیات",
    description:
      "تراکنش‌های سامان را ببینید. اطلاعات این بخش قابل ویرایش نیست.",
    columns: [
      ["order_number", "سفارش"],
      ["amount", "مبلغ"],
      ["status", "وضعیت"],
      ["reference_number", "مرجع"],
      ["created_at", "ثبت"],
    ],
  },
  {
    key: "events",
    title: "رویدادها",
    singular: "رویداد",
    group: "رویدادها",
    description:
      "زمان، هزینه و فعال بودن رویداد؛ بازه‌های حضور در بخش بعد مدیریت می‌شوند.",
    create: true,
    remove: true,
    filter: booleanFilter,
    columns: [
      ["title", "رویداد"],
      ["date", "تاریخ"],
      ["price_rial", "هزینه"],
      ["is_active", "وضعیت"],
    ],
    fields: [
      { key: "title", label: "عنوان", required: true },
      description,
      { key: "date", label: "تاریخ", type: "date" },
      money("price_rial", "هزینه"),
      active,
    ],
  },
  {
    key: "slots",
    title: "بازه‌های حضور",
    singular: "بازه حضور",
    group: "رویدادها",
    description:
      "ظرفیت نمی‌تواند از ثبت‌نام‌های موجود کمتر شود؛ بازه رزروشده جابه‌جا نمی‌شود.",
    create: true,
    remove: true,
    columns: [
      ["event_title", "رویداد"],
      ["start_time", "شروع"],
      ["end_time", "پایان"],
      ["registration_ceiling", "ظرفیت"],
      ["remaining_capacity", "باقی‌مانده"],
    ],
    fields: [
      {
        key: "event",
        label: "رویداد",
        type: "select",
        source: "events",
        required: true,
      },
      { key: "start_time", label: "شروع", type: "time", required: true },
      { key: "end_time", label: "پایان", type: "time", required: true },
      {
        key: "registration_ceiling",
        label: "ظرفیت",
        type: "number",
        required: true,
        min: 1,
        default: 10,
      },
    ],
  },
  {
    key: "registrations",
    title: "ثبت‌نام‌ها",
    singular: "ثبت‌نام",
    group: "رویدادها",
    description: "بررسی دستی رسید و تصمیم با یادداشت؛ سوابق قابل حذف نیستند.",
    review: "event",
    filter: { key: "status", options: registrationStatuses },
    columns: [
      ["full_name", "شرکت‌کننده"],
      ["event_title", "رویداد"],
      ["time_slot", "بازه"],
      ["amount_rial", "هزینه"],
      ["status", "وضعیت"],
    ],
  },
  {
    key: "posts",
    title: "مقاله‌ها",
    singular: "مقاله",
    group: "محتوا",
    description:
      "مقاله بنویسید، پیش‌نویس نگه دارید یا منتشر کنید. مقاله تازه با نام شما ثبت می‌شود.",
    create: true,
    remove: true,
    filter: {
      key: "status",
      options: [
        ["draft", "پیش‌نویس"],
        ["published", "منتشرشده"],
      ],
    },
    columns: [
      ["title", "عنوان"],
      ["category_name", "دسته"],
      ["author_name", "نویسنده"],
      ["status", "وضعیت"],
      ["published_at", "انتشار"],
    ],
    fields: [
      { key: "title", label: "عنوان", required: true },
      slug,
      {
        key: "category",
        label: "دسته مقاله",
        type: "select",
        source: "blog-categories",
        required: true,
      },
      { key: "excerpt", label: "خلاصه", type: "textarea", required: true },
      { key: "content", label: "متن مقاله", type: "textarea", required: true },
      { key: "cover_image", label: "تصویر جلد", type: "file" },
      { key: "cover_alt_text", label: "متن جایگزین جلد" },
      {
        key: "status",
        label: "وضعیت",
        type: "select",
        options: [
          ["draft", "پیش‌نویس"],
          ["published", "منتشرشده"],
        ],
      },
      { key: "meta_title", label: "عنوان SEO" },
      { key: "meta_description", label: "توضیح SEO", type: "textarea" },
    ],
  },
  {
    key: "blog-categories",
    title: "دسته‌بندی مقاله‌ها",
    singular: "دسته مقاله",
    group: "محتوا",
    description:
      "موضوع‌های وبلاگ را مدیریت کنید. دسته‌ای که مقاله دارد قابل حذف نیست.",
    create: true,
    remove: true,
    columns: [
      ["name", "نام"],
      ["slug", "شناسه"],
    ],
    fields: [name, slug],
  },
  {
    key: "cards",
    title: "کارت‌های بانکی",
    singular: "کارت",
    group: "حساب‌ها",
    description:
      "کارت‌های مقصد فروشگاه و رویداد؛ اطلاعات گیرنده را پیش از فعال‌سازی دوباره بررسی کنید.",
    create: true,
    remove: true,
    columns: [
      ["label", "عنوان"],
      ["account_holder", "صاحب حساب"],
      ["card_number", "شماره کارت"],
      ["bank_name", "بانک"],
      ["is_active", "وضعیت"],
    ],
    fields: [
      { key: "label", label: "عنوان", required: true },
      {
        key: "card_number",
        label: "شماره کارت",
        required: true,
        hint: "۱۶ رقم لاتین",
      },
      { key: "iban", label: "شماره شبا" },
      { key: "account_holder", label: "صاحب حساب", required: true },
      { key: "bank_name", label: "بانک" },
      { key: "sort_order", label: "ترتیب", type: "number", default: 0 },
      active,
    ],
  },
  {
    key: "customers",
    title: "مشتریان",
    singular: "مشتری",
    group: "حساب‌ها",
    description:
      "نام و فعال بودن مشتری؛ شماره و دسترسی کارکنان از این پنل قابل تغییر نیست.",
    columns: [
      ["full_name", "نام"],
      ["phone_number", "موبایل"],
      ["is_staff", "کارکنان"],
      ["is_active", "وضعیت"],
      ["created_at", "عضویت"],
    ],
    fields: [{ key: "full_name", label: "نام کامل" }, active],
  },
  {
    key: "notifications",
    title: "وضعیت پیامک‌ها",
    singular: "پیامک",
    group: "حساب‌ها",
    description:
      "وضعیت ارسال پیامک‌ها را ببینید. متن پیامک و کد ورود نمایش داده نمی‌شود.",
    columns: [
      ["phone_number", "موبایل"],
      ["status", "وضعیت"],
      ["attempts", "تلاش"],
      ["created_at", "ایجاد"],
      ["sent_at", "ارسال"],
    ],
  },
]

export const fetchOverview = () => api.get<Overview>("/manage/overview/", true)
export const fetchAdminPage = (resource: string, query: URLSearchParams) =>
  api.get<AdminPage>(`/manage/${resource}/?${query}`, true)

export function formPayload(
  resource: Resource,
  data: FormData
): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  for (const field of resource.fields ?? []) {
    if (field.type === "file") continue
    const value = String(data.get(field.key) ?? "")
    if (field.type === "checkbox") body[field.key] = data.has(field.key)
    else if (field.type === "multi")
      body[field.key] = data.getAll(field.key).map(String)
    else if (field.type === "number" || field.source) {
      const n = Number(value)
      if (!value || !Number.isSafeInteger(n) || n < (field.min ?? 0))
        throw new Error(`${field.label}: عدد صحیح معتبر وارد کنید.`)
      body[field.key] = n
    } else body[field.key] = field.type === "date" && !value ? null : value
  }
  return body
}

export function displayValue(key: string, value: unknown): string {
  if (value == null || value === "") return "—"
  if (typeof value === "boolean") return value ? "بله" : "خیر"
  if (
    [
      "price",
      "price_rial",
      "amount_rial",
      "total_amount",
      "amount",
      "unit_price",
      "line_total",
      "subtotal",
      "shipping_cost",
    ].includes(key)
  )
    return `${(Number(value) / 10).toLocaleString("fa-IR")} تومان`
  if (key.endsWith("_at") || key === "date" || key === "roast_date") {
    const date = new Date(
      key.endsWith("_at") ? String(value) : `${value}T12:00:00`
    )
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString("fa-IR")
  }
  if (key === "time_slot" && typeof value === "object") {
    const slot = value as { start_time: string; end_time: string }
    return `${slot.start_time.slice(0, 5)} تا ${slot.end_time.slice(0, 5)}`
  }
  if (key.endsWith("status"))
    return (
      [
        ...fulfillment,
        ...paymentStatuses,
        ...registrationStatuses,
        ...receiptStatuses,
        ["draft", "پیش‌نویس"],
        ["published", "منتشرشده"],
        ["verified", "تأییدشده"],
        ["redirected", "انتقال به درگاه"],
        ["created", "ایجادشده"],
        ["queued", "در صف"],
        ["sent", "ارسال‌شده"],
      ].find(([v]) => v === value)?.[1] ?? String(value)
    )
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}
