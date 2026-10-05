"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import {
  createPlayer,
  Container,
  PlayButton,
  FullscreenButton,
  Poster,
  selectControls,
} from "@videojs/react"
import { Video, videoFeatures } from "@videojs/react/video"

const { Player, usePlayer } = createPlayer({ features: videoFeatures })

const SEEK_STEP = 5

/**
 * Resolve the underlying <video> element from the player container.
 * The store's `media` object is a hook return value: mutating it directly
 * trips react-hooks/immutability and it isn't typed with HTMLMediaElement
 * members. Driving the real DOM node avoids both problems.
 */
function videoOf(container: HTMLElement | null): HTMLVideoElement | null {
  return container?.querySelector("video") ?? null
}

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

// ── Keyboard controls ─────────────────────────────────────────────────────────
// Scoped to the player container: a global window listener would hijack
// arrow-key scrolling for the whole page while a video sits idle on screen.
function KeyboardControls({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const store = usePlayer()
  const [hint, setHint] = useState<string | null>(null)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showHint = useCallback((text: string) => {
    if (hintTimer.current) clearTimeout(hintTimer.current)
    setHint(text)
    hintTimer.current = setTimeout(() => setHint(null), 800)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          if (store.paused) {
            store.play()
            showHint("پخش")
          } else {
            store.pause()
            showHint("مکث")
          }
          break
        case "ArrowRight": {
          e.preventDefault()
          const v = videoOf(el)
          if (v) v.currentTime = Math.min(v.currentTime + SEEK_STEP, v.duration)
          showHint(`+${SEEK_STEP}s`)
          break
        }
        case "ArrowLeft": {
          e.preventDefault()
          const v = videoOf(el)
          if (v) v.currentTime = Math.max(v.currentTime - SEEK_STEP, 0)
          showHint(`-${SEEK_STEP}s`)
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          const v = Math.min((store.volume ?? 1) + 0.1, 1)
          store.setVolume(v)
          showHint(`صدا ${Math.round(v * 100)}%`)
          break
        }
        case "ArrowDown": {
          e.preventDefault()
          const v = Math.max((store.volume ?? 1) - 0.1, 0)
          store.setVolume(v)
          showHint(`صدا ${Math.round(v * 100)}%`)
          break
        }
        case "m":
          e.preventDefault()
          store.toggleMuted()
          showHint(store.muted ? "صدا روشن" : "بی‌صدا")
          break
        case "f":
          e.preventDefault()
          store.toggleFullscreen()
          break
        case "0":
        case "Home": {
          e.preventDefault()
          const v = videoOf(el)
          if (v) v.currentTime = 0
          showHint("ابتدا")
          break
        }
        case "End": {
          e.preventDefault()
          const v = videoOf(el)
          if (v) v.currentTime = v.duration
          break
        }
      }
    }

    el.addEventListener("keydown", onKey)
    return () => {
      el.removeEventListener("keydown", onKey)
      if (hintTimer.current) clearTimeout(hintTimer.current)
    }
  }, [store, showHint, containerRef])

  if (!hint) return null
  return (
    <div className="vjs-key-hint" role="status" aria-live="polite">
      {hint}
    </div>
  )
}

// ── Seek bar + time ───────────────────────────────────────────────────────────
function SeekBar({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)

  useEffect(() => {
    const el = videoOf(containerRef.current)
    if (!el) return
    const sync = () => {
      setTime(el.currentTime || 0)
      setDuration(Number.isFinite(el.duration) ? el.duration : 0)
      try {
        if (el.buffered?.length) setBuffered(el.buffered.end(el.buffered.length - 1))
      } catch {
        /* buffered can throw before metadata is ready */
      }
    }
    sync()
    el.addEventListener("timeupdate", sync)
    el.addEventListener("loadedmetadata", sync)
    el.addEventListener("progress", sync)
    return () => {
      el.removeEventListener("timeupdate", sync)
      el.removeEventListener("loadedmetadata", sync)
      el.removeEventListener("progress", sync)
    }
  }, [containerRef])

  const pct = duration ? (time / duration) * 100 : 0
  const bufPct = duration ? (buffered / duration) * 100 : 0

  return (
    <div className="vjs-seekbar">
      <span className="vjs-time">{fmt(time)}</span>
      <div className="vjs-track">
        <div className="vjs-track-buffer" style={{ width: `${bufPct}%` }} />
        <div className="vjs-track-fill" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          aria-label="جابه‌جایی در ویدیو"
          onChange={(e) => {
            const v = videoOf(containerRef.current)
            if (v) v.currentTime = Number(e.target.value)
          }}
        />
      </div>
      <span className="vjs-time">{fmt(duration)}</span>
    </div>
  )
}

// ── Touch controls ────────────────────────────────────────────────────────────
function TouchControls({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const store = usePlayer()
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const lastTap = useRef<number | null>(null)
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [seekHint, setSeekHint] = useState<"forward" | "backward" | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - startX.current
      const dy = touch.clientY - startY.current
      startX.current = null
      startY.current = null
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) return

      const now = Date.now()
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()

      if (lastTap.current && now - lastTap.current < 300) {
        if (tapTimer.current) {
          clearTimeout(tapTimer.current)
          tapTimer.current = null
        }
        lastTap.current = null
        const v = videoOf(containerRef.current)
        if (!v) return
        // RTL-agnostic: right half seeks forward
        if (touch.clientX > rect.left + rect.width / 2) {
          v.currentTime = Math.min(v.currentTime + SEEK_STEP, v.duration)
          setSeekHint("forward")
        } else {
          v.currentTime = Math.max(v.currentTime - SEEK_STEP, 0)
          setSeekHint("backward")
        }
        setTimeout(() => setSeekHint(null), 800)
        return
      }

      lastTap.current = now
      tapTimer.current = setTimeout(() => {
        lastTap.current = null
        tapTimer.current = null
        if (store.paused) store.play()
        else store.pause()
      }, 300)
    },
    [store, containerRef],
  )

  useEffect(
    () => () => {
      if (tapTimer.current) clearTimeout(tapTimer.current)
    },
    [],
  )

  return (
    <div
      className="vjs-touch-surface"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {seekHint && (
        <div className={`vjs-seek-hint vjs-seek-hint--${seekHint}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true">
            {seekHint === "backward" ? (
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z" />
            ) : (
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
            )}
          </svg>
          <span>{SEEK_STEP}s</span>
        </div>
      )}
    </div>
  )
}

// ── Auto-hiding play button ───────────────────────────────────────────────────
function SmartPlayButton() {
  const controls = usePlayer(selectControls)
  const { paused } = usePlayer((s) => ({ paused: s.paused }))
  const visible = paused || (controls?.controlsVisible ?? true)

  return (
    <PlayButton
      className="vjs-minimal-play"
      data-visible={visible ? "" : undefined}
      render={(props, state) => (
        <button {...props} aria-label={state.paused ? "پخش ویدیو" : "مکث ویدیو"}>
          {state.ended ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          ) : state.paused ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>
      )}
    />
  )
}

interface MinimalVideoPlayerProps {
  src: string
  /** Adaptive HLS stream; src remains MP4 fallback. */
  hlsSrc?: string
  poster?: string
  aspectRatio?: string
  /** Only the above-the-fold player should preload; others stay at "none". */
  preload?: "none" | "metadata" | "auto"
}

export default function MinimalVideoPlayer({
  src,
  hlsSrc,
  poster = "/img/gallery/videoPreview.jpeg",
  aspectRatio = "9 / 16",
  preload = "metadata",
}: MinimalVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hlsSrc) return
    const video = videoOf(containerRef.current)
    if (!video) return
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsSrc
      return
    }

    let disposed = false
    let player: import("hls.js").default | undefined
    import("hls.js").then(({ default: Hls }) => {
      if (disposed || !Hls.isSupported()) return
      player = new Hls({ enableWorker: true })
      player.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          player?.destroy()
          player = undefined
          video.src = src
        }
      })
      player.loadSource(hlsSrc)
      player.attachMedia(video)
    })
    return () => { disposed = true; player?.destroy() }
  }, [hlsSrc, src])

  return (
    <Player>
      <Container
        ref={containerRef}
        tabIndex={0}
        aria-label="پخش‌کننده ویدیو"
        className="vjs-minimal-container"
        style={{ aspectRatio }}
      >
        <Video src={src} playsInline preload={preload} poster={poster} />

        {poster && <Poster.Root className="vjs-minimal-poster"><Poster.Image src={poster} alt="" /></Poster.Root>}

        <TouchControls containerRef={containerRef} />
        <KeyboardControls containerRef={containerRef} />
        <SmartPlayButton />

        <div className="vjs-bottom">
          <SeekBar containerRef={containerRef} />
          <FullscreenButton
            className="vjs-minimal-fullscreen"
            render={(props, state) => (
              <button {...props} aria-label={state.fullscreen ? "خروج از تمام‌صفحه" : "تمام‌صفحه"}>
                {state.fullscreen ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            )}
          />
        </div>
      </Container>
    </Player>
  )
}
