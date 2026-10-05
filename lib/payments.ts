import { api } from "./api"
import { fetchPages } from "./shop"
export type BankCard = {
  id: number
  label: string
  card_number: string
  iban: string
  account_holder: string
  bank_name: string
}
export type CardPayment = {
  payment_id: number
  status: string
  amount_rial: number
  expires_at: string
  admin_note: string
  card: Omit<BankCard, "id">
}
export const fetchCards = () => fetchPages<BankCard>("/payments/cards/", true)
export const startCardPayment = (order: string, card_id: number) =>
  api.post<CardPayment>(
    `/payments/card/start/${encodeURIComponent(order)}/`,
    { card_id },
    true
  )
export const fetchCardPayment = (id: number) =>
  api.get<CardPayment>(`/payments/card/${id}/`, true)
export const uploadCardReceipt = (id: number, data: FormData) =>
  api.upload<CardPayment>(`/payments/card/${id}/receipt/`, data)
export const PAYMENT_LABELS: Record<string, string> = {
  awaiting_receipt: "در انتظار رسید",
  pending_review: "رسید در انتظار بررسی",
  approved: "تأیید شده",
  rejected: "رسید رد شده",
  expired: "مهلت تمام شده",
  failed: "ناموفق",
}
