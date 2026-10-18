"use client"

import { useState } from "react"
import { eventMap, type PalEvent } from "@/lib/event-api"

export default function EventLocation({ event }: { event: PalEvent }) {
  const [showMap, setShowMap] = useState(false)
  const map = eventMap(event)
  if (!event.location_name && !event.address && !map) return null
  return (
    <section aria-label="محل برگزاری" className="my-6 space-y-3 border border-(--outline) bg-(--surface-300) p-4">
      <h3 className="font-bold">محل برگزاری{event.location_name ? `: ${event.location_name}` : ""}</h3>
      {event.address && <p className="whitespace-pre-line leading-8">{event.address}</p>}
      {map && <>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn--secondary" aria-expanded={showMap} aria-controls={`event-map-${event.id}`} onClick={() => setShowMap(!showMap)}>
            {showMap ? "بستن نقشه" : "نمایش نقشه"}
          </button>
          <a href={map.link} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">باز کردن در OpenStreetMap</a>
        </div>
        <p className="text-sm text-(--ink-muted)">با نمایش نقشه، اتصال به OpenStreetMap برقرار می‌شود.</p>
        <div id={`event-map-${event.id}`}>
          {showMap && <iframe title="نقشه محل برگزاری رویداد" src={map.embed} loading="lazy" referrerPolicy="no-referrer" className="h-64 w-full border border-(--outline)" />}
        </div>
      </>}
    </section>
  )
}
