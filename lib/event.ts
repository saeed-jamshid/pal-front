export const EVENT_NAME = "قصه و قهوه"
export const EVENT_START = Date.parse("2026-10-02T10:00:00+03:30")

export function eventCountdown(now: number) {
  const seconds = Math.max(0, Math.floor((EVENT_START - now) / 1000))
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    started: now >= EVENT_START,
  }
}
