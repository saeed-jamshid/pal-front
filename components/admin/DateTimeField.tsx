"use client"

import { useRef, useState } from "react"
import { DayPicker } from "react-day-picker/persian"
import "react-day-picker/style.css"
import { faDate, faDigits } from "@/lib/event-api"
import type { Field } from "@/lib/admin"

export default function DateTimeField({ field, value, invalid, describedBy, onChange }: {
  field: Field
  value: string
  invalid: boolean
  describedBy?: string
  onChange: () => void
}) {
  const [date, setDate] = useState(value)
  const details = useRef<HTMLDetailsElement>(null)
  const id = `admin-field-${field.key}`

  if (field.type === "time") {
    const [hour = "", minute = "", second = "00"] = value.split(":")
    return (
      <div className="admin-time-field" role="group" aria-label={field.label} aria-describedby={describedBy}>
        {[["ساعت", hour, 24], ["دقیقه", minute, 60], ["ثانیه", second, 60]].map(([label, initial, count], index) => (
          <label key={String(label)}>
            <span>{label}</span>
            <select id={index === 0 ? id : undefined} name={`${field.key}_${index}`} defaultValue={String(initial)} required={field.required} aria-invalid={invalid} aria-label={`${field.label}: ${label}`}>
              <option value="" disabled>—</option>
              {Array.from({ length: Number(count) }, (_, n) => {
                const part = String(n).padStart(2, "0")
                return <option key={part} value={part}>{faDigits(part)}</option>
              })}
            </select>
          </label>
        ))}
      </div>
    )
  }

  const selected = date ? new Date(`${date}T12:00:00`) : undefined
  return (
    <div className="admin-date-field">
      <input type="hidden" name={field.key} value={date} />
      <details ref={details}>
        <summary id={id} aria-invalid={invalid} aria-describedby={describedBy}>
          {date ? faDate(date) : "انتخاب تاریخ شمسی"}
        </summary>
        <DayPicker
          className="admin-calendar"
          mode="single"
          selected={selected}
          defaultMonth={selected}
          showOutsideDays
          labels={{ labelNext: () => "ماه بعد", labelPrevious: () => "ماه قبل" }}
          onSelect={day => {
            if (!day) return
            onChange()
            setDate(`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`)
            if (details.current) details.current.open = false
            document.getElementById(id)?.focus()
          }}
        />
      </details>
      {!field.required && date && (
        <button type="button" className="admin-link" onClick={() => { setDate(""); onChange() }}>پاک کردن تاریخ</button>
      )}
    </div>
  )
}
