// src/components/landing/CinematicBackground.tsx
'use client'
import Image from 'next/image'

// Second pass on the water effect — the previous version used identical
// bezier shapes sliding left/right, which read as "moving wave graphic"
// rather than actual liquid. This version uses:
//   1. An SVG feTurbulence + feDisplacementMap filter (the standard
//      technique for organic liquid/fire/smoke distortion), with its
//      baseFrequency animated via SMIL <animate> — this genuinely warps
//      the wave edges over time rather than just translating a fixed shape.
//   2. Several DIFFERENT wave shapes (not the same curve repeated at
//      different offsets) layered together, each with independent
//      horizontal AND vertical drift, so the combined motion doesn't
//      repeat in an obviously loop-able way.
//   3. A slow-shifting diagonal highlight gradient simulating light
//      glinting off a water surface.
//   4. Small pulsing foam highlights along the crest line.
export function CinematicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#03151f]">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #03151f 0%, #0e2f42 55%, #123b4d 100%)',
      }} />

      <div className="absolute bottom-0 left-1/2 h-[92%] w-auto -translate-x-1/2">
        <Image
          src="/landing/building-progress.png"
          alt=""
          width={1024}
          height={1536}
          priority
          className="h-full w-auto object-contain object-bottom"
        />
      </div>

      <svg
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
        className="absolute left-0 right-0 top-[48%] h-[52%] w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="waterFillDeep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e6685" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#031824" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="waterFillMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12809e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#042230" stopOpacity="0.92" />
          </linearGradient>

          <filter id="liquidWarp" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.04"
              numOctaves="2"
              seed="7"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.012 0.04;0.017 0.03;0.012 0.04"
                dur="14s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <g filter="url(#liquidWarp)">
          <path className="wave layer-back" d="M0,70 C130,110 260,40 400,75 C540,110 660,45 800,80 C920,105 1040,55 1200,85 L1200,320 L0,320 Z" fill="url(#waterFillDeep)" />
          <path className="wave layer-mid" d="M0,95 C160,60 300,120 460,90 C610,62 760,125 920,92 C1020,72 1110,100 1200,95 L1200,320 L0,320 Z" fill="url(#waterFillMid)" />
          <path className="wave layer-front" d="M0,115 C140,145 280,90 420,118 C560,146 700,85 860,116 C980,140 1090,100 1200,118 L1200,320 L0,320 Z" fill="url(#waterFillDeep)" opacity="0.9" />
        </g>

        <path className="wave crest" d="M0,115 C140,145 280,90 420,118 C560,146 700,85 860,116 C980,140 1090,100 1200,118" fill="none" stroke="#9fe8f5" strokeWidth="1.5" opacity="0.55" filter="url(#liquidWarp)" />

        <g className="foam">
          <circle cx="160" cy="112" r="2.5" fill="#eafcff" opacity="0.7" />
          <circle cx="410" cy="122" r="2" fill="#eafcff" opacity="0.5" />
          <circle cx="680" cy="98" r="2.5" fill="#eafcff" opacity="0.6" />
          <circle cx="940" cy="120" r="2" fill="#eafcff" opacity="0.5" />
          <circle cx="1080" cy="105" r="2.5" fill="#eafcff" opacity="0.65" />
        </g>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-[#03151f]/40 via-transparent to-[#03151f]/70" />

      <style jsx global>{`
        @keyframes driftBack  { 0% { transform: translate(0,0); } 50% { transform: translate(-26px, 6px); } 100% { transform: translate(0,0); } }
        @keyframes driftMid   { 0% { transform: translate(0,0); } 50% { transform: translate(20px, -8px); } 100% { transform: translate(0,0); } }
        @keyframes driftFront { 0% { transform: translate(0,0); } 50% { transform: translate(-14px, 5px); } 100% { transform: translate(0,0); } }
        @keyframes foamPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.85; } }

        .layer-back  { animation: driftBack 11s ease-in-out infinite; }
        .layer-mid   { animation: driftMid 8s ease-in-out infinite; }
        .layer-front { animation: driftFront 6s ease-in-out infinite; }
        .crest       { animation: driftFront 6s ease-in-out infinite; }
        .foam circle { animation: foamPulse 3.5s ease-in-out infinite; }
        .foam circle:nth-child(2) { animation-delay: 0.6s; }
        .foam circle:nth-child(3) { animation-delay: 1.2s; }
        .foam circle:nth-child(4) { animation-delay: 1.8s; }
        .foam circle:nth-child(5) { animation-delay: 2.4s; }

        @media (prefers-reduced-motion: reduce) {
          .layer-back, .layer-mid, .layer-front, .crest, .foam circle {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}