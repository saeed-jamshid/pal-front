import { test } from "node:test"
import { strict as assert } from "node:assert"
import { EVENT_START, eventCountdown } from "./event"

test("Friday 10 Mehr at 10:00 Tehran; countdown never goes negative", () => {
  assert.equal(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran", dateStyle: "full", timeStyle: "short" }).format(EVENT_START).includes("Friday, October 2, 2026 at 10:00"), true)
  assert.deepEqual(eventCountdown(EVENT_START - 90061000), { days: 1, hours: 1, minutes: 1, seconds: 1, started: false })
  assert.equal(eventCountdown(EVENT_START).started, true)
  assert.equal(eventCountdown(EVENT_START + 1000).days, 0)
})
