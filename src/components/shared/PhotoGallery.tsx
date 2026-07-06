// src/components/shared/PhotoGallery.tsx
'use client'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReportPhoto } from '@/types/api'

/** Horizontal thumbnail strip with a click-to-enlarge lightbox. */
export function PhotoGallery({ photos }: { photos: ReportPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  if (!photos.length) {
    return <p className="text-xs text-text-muted">写真はありません</p>
  }
  const sorted = [...photos].sort((a, b) => a.order_index - b.order_index)

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sorted.map((photo, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo.id}
            src={photo.s3_url}
            alt={`現場写真 ${i + 1}`}
            className="h-20 w-28 flex-shrink-0 cursor-pointer rounded-md border border-border object-cover transition-opacity hover:opacity-80"
            onClick={() => setOpenIndex(i)}
          />
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 animate-fade-in"
          onClick={() => setOpenIndex(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-surface p-2 text-text-primary"
            onClick={() => setOpenIndex(null)}
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
          {openIndex > 0 && (
            <button
              className="absolute left-4 rounded-full bg-surface p-2 text-text-primary"
              onClick={(e) => { e.stopPropagation(); setOpenIndex(openIndex - 1) }}
              aria-label="前の写真"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sorted[openIndex].s3_url}
            alt={`現場写真 ${openIndex + 1}（拡大）`}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {openIndex < sorted.length - 1 && (
            <button
              className="absolute right-16 rounded-full bg-surface p-2 text-text-primary"
              onClick={(e) => { e.stopPropagation(); setOpenIndex(openIndex + 1) }}
              aria-label="次の写真"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
