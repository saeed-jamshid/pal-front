"use client"

import { useRef, useState, useCallback } from "react"
import {
  createPlayer,
  PlayButton,
  FullscreenButton,
  Poster,
} from "@videojs/react"
import { Video, videoFeatures } from "@videojs/react/video"

const Player = createPlayer({ features: videoFeatures })

// ── Touch seek controls via store ─────────────────────────────────────────────
function TouchControls() {
  const media = Player.useMedia()
  const store = Player.usePlayer()
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const [seekHint, setSeekHint] = useState<"forward" | "backward" | null>(null)
  const lastTap = useRef<number>(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return

      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current
      touchStartX.current = null
      touchStartY.current = null

      // Double tap fullscreen
      const now = Date.now()
      if (now - lastTap.current < 300) {
        store.toggleFullscreen()
        return
      }
      lastTap.current = now

      // Ignore vertical swipes
      if (Math.abs(dy) > Math.abs(dx)) return
      // Ignore small swipes
      if (Math.abs(dx) < 40 || !media) return

      if (dx > 0) {
        media.currentTime = Math.min(media.currentTime + 5, media.duration)
        setSeekHint("forward")
      } else {
        media.currentTime = Math.max(media.currentTime - 5, 0)
        setSeekHint("backward")
      }

      setTimeout(() => setSeekHint(null), 800)
    },
    [media, store]
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

// ── Main component ────────────────────────────────────────────────────────────
interface MinimalVideoPlayerProps {
  src: string
  poster?: string
}

export default function MinimalVideoPlayer({
  src,
  poster,
}: MinimalVideoPlayerProps) {
  return (
    <Player.Provider>
      <Player.Container className="vjs-minimal-container">
        <Video
          src={src}
          playsInline
          preload="metadata"
          poster="/img/gallery/videoPreview.jpeg"
        />

        {poster && (
          <Poster className="vjs-minimal-poster" src={poster} alt="" />
        )}

        {/* Full touch surface — seek + double tap fullscreen */}
        <TouchControls />

        {/* Play button — centered */}
        <PlayButton
          className="vjs-minimal-play"
          render={(props, state) => (
            <button {...props}>
              {state.ended ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
              ) : state.paused ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>
          )}
        />

        {/* Fullscreen button — bottom right */}
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
          object-fit: cover;
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

        /* Touch surface covers entire player */
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

        /* Play button */
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
          transition: background 0.2s, transform 0.2s, opacity 0.2s;
        }

        .vjs-minimal-play:hover {
          background: rgba(0,0,0,0.6);
          transform: translate(-50%, -50%) scale(1.08);
        }

        .vjs-minimal-play:not([data-paused]) {
          opacity: 0;
          pointer-events: none;
        }

        .vjs-minimal-container:hover .vjs-minimal-play:not([data-paused]) {
          opacity: 1;
          pointer-events: auto;
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
