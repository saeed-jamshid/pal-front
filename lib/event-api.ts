import { api } from "./api"
import { fetchPages } from "./shop"
export { normalizePhone } from "./api"

export type TimeSlot = {
  id: number
  start_time: string
  end_time: string
  registration_ceiling: number
  remaining_capacity: number
}
export type PalEvent = {
  id: number
  title: string
  description: string
  date: string | null
  price_rial: number
  time_slots: TimeSlot[]
}
export type Registration = {
  id: number
  registration_token: string
  event: number
  event_title: string
  full_name: string
  phone_number: string
  time_slot: TimeSlot | null
  amount_rial: number
  status: "pending" | "confirmed" | "rejected"
  status_display: string
  reference_number: string
  admin_note: string
  receipt_url: string | null
  created_at: string
}
export const fetchEvents = () => fetchPages<PalEvent>("/events/")
export const fetchRegistrations = () =>
  fetchPages<Registration>("/events/registrations/", true)
export const fetchRegistration = (token: string) =>
  api.get<Registration>(
    `/events/registrations/${encodeURIComponent(token)}/`,
    true
  )
export const registerEvent = (data: FormData) =>
  api.upload<Registration>("/events/registrations/", data)
export const resubmitReceipt = (token: string, data: FormData) =>
  api.upload<Registration>(
    `/events/registrations/${encodeURIComponent(token)}/receipt/`,
    data
  )

export function csvCell(value: string | number | null) {
  return `"${String(value ?? "")
    .replace(/^[\s\u0000-\u001f]*[=+@\-]/, "'$&")
    .replaceAll('"', '""')}"`
}
