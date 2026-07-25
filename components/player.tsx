"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import {
  createPlayer,
  PlayButton,
  FullscreenButton,
  Poster,
  selectControls,
} from "@videojs/react"
import { Video, videoFeatures } from "@videojs/react/video"

const Player = createPlayer({ features: videoFeatures })

// ── keyboard controls ────────────────────────────────────────────────────────────
function KeyboardControls() {
  const store = Player.usePlayer()
  const media = Player.useMedia()
  const [hint, setHint] = useState<string | null>(null)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showHint = useCallback((text: string) => {
    if (hintTimer.current) clearTimeout(hintTimer.current)
    setHint(text)
    hintTimer.current = setTimeout(() => setHint(null), 800)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't fire when user is typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      if (!media) return

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          store.paused ? store.play() : store.pause()
          showHint(store.paused ? "▶ Play" : "⏸ Pause")
          break

        case "ArrowRight":
        case "l":
          e.preventDefault()
          media.currentTime = Math.min(media.currentTime + 5, media.duration)
          showHint("▶▶ +5s")
          break

        case "ArrowLeft":
        case "j":
          e.preventDefault()
          media.currentTime = Math.max(media.currentTime - 5, 0)
          showHint("◀◀ -5s")
          break

        case "ArrowUp":
          e.preventDefault()
          store.setVolume(Math.min((store.volume ?? 1) + 0.1, 1))
          showHint(
            `🔊 ${Math.round(Math.min((store.volume ?? 1) + 0.1, 1) * 100)}%`
          )
          break

        case "ArrowDown":
          e.preventDefault()
          store.setVolume(Math.max((store.volume ?? 1) - 0.1, 0))
          showHint(
            `🔉 ${Math.round(Math.max((store.volume ?? 1) - 0.1, 0) * 100)}%`
          )
          break

        case "m":
          e.preventDefault()
          store.toggleMuted()
          showHint(store.muted ? "🔊 Unmuted" : "🔇 Muted")
          break

        case "f":
          e.preventDefault()
          store.toggleFullscreen()
          showHint("⛶ Fullscreen")
          break

        case "0":
        case "Home":
          e.preventDefault()
          media.currentTime = 0
          showHint("⏮ Start")
          break

        case "End":
          e.preventDefault()
          media.currentTime = media.duration
          showHint("⏭ End")
          break
      }
    }

    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      if (hintTimer.current) clearTimeout(hintTimer.current)
    }
  }, [media, store, showHint])

  if (!hint) return null

  return <div className="vjs-key-hint">{hint}</div>
}

// ── Touch controls ────────────────────────────────────────────────────────────
function TouchControls() {
  const media = Player.useMedia()
  const store = Player.usePlayer()
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const lastTap = useRef<{ time: number; x: number } | null>(null)
  const doubleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [seekHint, setSeekHint] = useState<"forward" | "backward" | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return

      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStartX.current
      const dy = touch.clientY - touchStartY.current
      touchStartX.current = null
      touchStartY.current = null

      // Ignore swipes (let framer-motion handle drag when scale > 1)
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) return

      const now = Date.now()
      const prev = lastTap.current

      // ── Double tap ────────────────────────────────────────────────────────
      if (prev && now - prev.time < 300) {
        // Cancel the pending single-tap action
        if (doubleTapTimer.current) {
          clearTimeout(doubleTapTimer.current)
          doubleTapTimer.current = null
        }
        lastTap.current = null

        if (!media) return
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const isRightSide = touch.clientX > rect.left + rect.width / 2

        if (isRightSide) {
          media.currentTime = Math.min(media.currentTime + 5, media.duration)
          setSeekHint("forward")
        } else {
          media.currentTime = Math.max(media.currentTime - 5, 0)
          setSeekHint("backward")
        }
        setTimeout(() => setSeekHint(null), 800)
        return
      }

      // ── Single tap — toggle play/pause after short delay ──────────────────
      lastTap.current = { time: now, x: touch.clientX }
      doubleTapTimer.current = setTimeout(() => {
        lastTap.current = null
        doubleTapTimer.current = null
        store.paused ? store.play() : store.pause()
      }, 300)
    },
    [media, store]
  )

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (doubleTapTimer.current) clearTimeout(doubleTapTimer.current)
    },
    []
  )

  return (
    <div
      className="vjs-touch-surface"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {seekHint && (
        <div className={`vjs-seek-hint vjs-seek-hint--${seekHint}`}>
          {seekHint === "backward" ? (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="26"
                height="26"
              >
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z" />
              </svg>
              <span>5s</span>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="26"
                height="26"
              >
                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
              </svg>
              <span>5s</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Auto-hiding play button ───────────────────────────────────────────────────
function SmartPlayButton() {
  const controls = Player.usePlayer(selectControls)
  const { paused } = Player.usePlayer((s) => ({ paused: s.paused }))

  // visible when: paused OR controls are active (user just interacted)
  const visible = paused || (controls?.controlsVisible ?? true)

  return (
    <PlayButton
      className="vjs-minimal-play"
      data-visible={visible ? "" : undefined}
      render={(props, state) => (
        <button {...props}>
          {state.ended ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          ) : state.paused ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>
      )}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface MinimalVideoPlayerProps {
  src: string
  poster?: string
  aspectRatio?: string
}

export default function MinimalVideoPlayer({
  src,
  poster = "/img/gallery/videoPreview.jpeg",
  aspectRatio = "9 / 16",
}: MinimalVideoPlayerProps) {
  return (
    <Player.Provider>
      <Player.Container
        className="vjs-minimal-container"
        style={{ aspectRatio }}
      >
        <Video src={src} playsInline preload="metadata" poster={poster} />

        {poster && (
          <Poster className="vjs-minimal-poster" src={poster} alt="" />
        )}

        <TouchControls />
        <KeyboardControls />
        <SmartPlayButton />

        <FullscreenButton
          className="vjs-minimal-fullscreen"
          render={(props, state) => (
            <button {...props}>
              {state.fullscreen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="20"
                  height="20"
                >
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="20"
                  height="20"
                >
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          )}
        />
      </Player.Container>

      <style>{`
        .vjs-minimal-container {
          position: relative;
          width: 100%;
          aspect-ratio: 9/16;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }

        .vjs-minimal-container video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .vjs-minimal-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .vjs-minimal-poster:not([data-visible]) { opacity: 0; }

        /* Touch surface */
        .vjs-touch-surface {
          position: absolute;
          inset: 0;
          z-index: 1;
          touch-action: pan-y;
        }

        /* Seek hint */
        .vjs-seek-hint {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: white;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 12px 16px;
          pointer-events: none;
          animation: vjs-hint-fade 0.8s ease forwards;
        }
        .vjs-seek-hint span { font-size: 13px; font-weight: 500; }
        .vjs-seek-hint--backward { left: 20px; }
        .vjs-seek-hint--forward  { right: 20px; }

        @keyframes vjs-hint-fade {
          0%   { opacity: 0; transform: translateY(-50%) scale(0.9); }
          20%  { opacity: 1; transform: translateY(-50%) scale(1); }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Keyboard hint — center top */
        .vjs-key-hint {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          color: white;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          border-radius: 10px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          pointer-events: none;
          animation: vjs-hint-fade 0.8s ease forwards;
        }

        /* Play button — visibility driven by data-visible */
        .vjs-minimal-play {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 2;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(0,0,0,0.4);
          border: none;
          color: white;
          cursor: pointer;
          backdrop-filter: blur(8px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s, transform 0.2s, background 0.2s;
        }

        /* Show when data-visible is set */
        .vjs-minimal-play[data-visible] {
          opacity: 1;
          pointer-events: auto;
        }

        .vjs-minimal-play:hover {
          background: rgba(0,0,0,0.6);
          transform: translate(-50%, -50%) scale(1.08);
        }

        /* Fullscreen button */
        .vjs-minimal-fullscreen {
          position: absolute;
          bottom: 12px;
          right: 12px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(0,0,0,0.4);
          border: none;
          color: white;
          cursor: pointer;
          backdrop-filter: blur(8px);
          opacity: 0;
          transition: opacity 0.2s, background 0.2s;
        }
        .vjs-minimal-container:hover .vjs-minimal-fullscreen { opacity: 1; }
        .vjs-minimal-fullscreen:hover { background: rgba(0,0,0,0.6); }
        .vjs-minimal-fullscreen[data-availability="unsupported"] { display: none; }
      `}</style>
    </Player.Provider>
  )
}
